"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/app/Constants";
import { redirect } from "next/navigation";

const handleError = (error: unknown, message: string) => {
    console.log(error, message);
    throw error;
};

const getUserByEmail = async (email: string) => {
    const { tablesDb } = await createAdminClient();

    const result = await tablesDb.listRows(
        appwriteConfig.databaseId,
        appwriteConfig.usersTableId,
        [Query.equal("email", email)]
    );

    return result.total > 0 ? result.rows[0] : null;
};

export const sendEmailOtp = async (email: string) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), email);
        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send Email OTP");
    }
};

export const createAccount = async ({
    fullName,
    email,
}: {
    fullName: string;
    email: string;
}) => {
    const existingUser = await getUserByEmail(email);

    const accountId = await sendEmailOtp(email);

    if (!accountId) {
        throw new Error("Failed to send an OTP");
    }

    if (!existingUser) {
        const { tablesDb } = await createAdminClient();
        await tablesDb.createRow(
            appwriteConfig.databaseId,
            appwriteConfig.usersTableId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: avatarPlaceholderUrl,
                accountId,
            }
        );
    }

    return accountId;
};

export const verifySecret = async ({
    accountId,
    password,
}: {
    accountId: string;
    password: string;
}) => {
    try {
        const { account } = await createAdminClient();
        const session = await account.createSession(accountId, password);
        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
        });

        return parseStringify({ sessionId: session.$id });
    } catch (error) {
        handleError(error, "Failed to verify OTP");
    }
};

export const getCurrentUser = async () => {
    const { tablesDb, account } = await createSessionClient();
    const result = await account.get();
    const user = await tablesDb.listRows(
        appwriteConfig.databaseId,
        appwriteConfig.usersTableId,
        [Query.equal("accountId", result.$id)]
    );

    if (user.total <= 0) return null;
    return user.rows[0];
};

export const logoutUser = async () => {
    const { account } = await createSessionClient();

    try {
        await account.deleteSession("current");
        (await cookies()).delete("appwrite-session");
    } catch (error) {
        handleError(error, "Failed to logout user");
    } finally {
        redirect("/sign-in");
    }
};

export const signInUser = async ({ email }: { email: string }) => {
    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            await sendEmailOtp(email);
            return existingUser.accountId;
        }

        return { accountId: null, error: "User not found" };
    } catch (error) {
        handleError(error, "Failed to sign in the user");
    }
};
