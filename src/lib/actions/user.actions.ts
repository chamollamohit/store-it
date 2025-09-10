"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";

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

const sendEmailOtp = async (email: string) => {
    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailToken(ID.unique(), email);
        return session.userId;
    } catch (error) {
        handleError(error, "Failed to send Email OTP");
    }
};

const createAccount = async ({
    fullName,
    email,
}: {
    fullName: string;
    email: string;
}) => {
    const exisitingUser = await getUserByEmail(email);

    const accountId = await sendEmailOtp(email);

    if (!accountId) {
        throw new Error("Failed to send an OTP");
    }

    if (!exisitingUser) {
        const { tablesDb } = await createAdminClient();
        await tablesDb.createRow(
            appwriteConfig.databaseId,
            appwriteConfig.usersTableId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
                accountId,
            }
        );
    }

    return;
};
