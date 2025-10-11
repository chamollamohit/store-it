"use server";

import { InputFile } from "node-appwrite/file";
import { createAdminClient } from "../appwrite";
import { getCurrentUser, handleError } from "./user.actions";
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType } from "../utils";
import { revalidatePath } from "next/cache";
import path from "path";
import {
    DeleteFileProps,
    GetFilesProps,
    MyFile,
    RenameFileProps,
    UpdateFileUsersProps,
    UploadFileProps,
} from "../../../types";

export const uploadFile = async ({
    file,
    ownerId,
    accountId,
    path,
}: UploadFileProps) => {
    const { storage, tablesDb } = await createAdminClient();

    try {
        const inputFile = InputFile.fromBuffer(file, file.name);
        const bucketFile = await storage.createFile(
            appwriteConfig.bucketId,
            ID.unique(),
            inputFile
        );

        const fileDocument = {
            type: getFileType({ fileName: bucketFile.name }).type,
            NAME: bucketFile.name,
            url: constructFileUrl(bucketFile.$id),
            extension: getFileType({ fileName: bucketFile.name }).extension,
            size: bucketFile.sizeOriginal,
            owner: ownerId,
            accountId,
            users: [],
            bucketFileId: bucketFile.$id,
        };

        const newFile = await tablesDb
            .createRow(
                appwriteConfig.databaseId,
                appwriteConfig.fileTableId,
                ID.unique(),
                fileDocument
            )
            .catch(async (error: unknown) => {
                await storage.deleteFile(
                    appwriteConfig.bucketId,
                    bucketFile.$id
                );
                handleError(
                    error,
                    "Failed to upload meta data... So deleting file"
                );
            });

        revalidatePath(path);
        return newFile;
    } catch (error) {
        handleError(error, "Failed to upload file");
    }
};

const createQueries = (currentUser: MyFile, types: string[]) => {
    const queries = [
        Query.or([
            Query.equal("owner", currentUser.$id),
            Query.contains("users", currentUser.email),
        ]),
    ];
    if (types.length > 0) queries.push(Query.equal("type", types));
    // console.log(queries);

    // Todo: Search, sort, limit query
    return queries;
};

export const getFiles = async ({ types }: GetFilesProps) => {
    const { tablesDb } = await createAdminClient();

    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return;

        const queries = createQueries(currentUser as unknown as MyFile, types);
        const files = await tablesDb.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.fileTableId,
            queries
        );
        // const check = files.rows.forEach((file) => console.log(file.owner));
        const fileOwner = files.rows.map(async (file) => {
            const owner = await tablesDb.getRow(
                appwriteConfig.databaseId,
                appwriteConfig.usersTableId,
                file.owner
            );
            return { ...file, owner };
        });
        const allFiles = await Promise.all(fileOwner);

        return allFiles;
    } catch (error) {
        handleError(error, "Failed to fetch files");
    }
};

export const renameFile = async ({
    fileId,
    name,
    extension,
    path,
}: RenameFileProps) => {
    const { tablesDb } = await createAdminClient();

    try {
        const newName = `${name}.${extension}`;
        const updatedFile = await tablesDb.updateRow(
            appwriteConfig.databaseId,
            appwriteConfig.fileTableId,
            fileId,
            { NAME: newName }
        );
        revalidatePath(path);
        return updatedFile;
    } catch (error) {
        handleError(error, "Failed to rename error");
    }
};

export const deleteFile = async ({
    fileId,
    bucketFileId,
    path,
}: DeleteFileProps) => {
    const { tablesDb, storage } = await createAdminClient();
    try {
        const deletedFile = await tablesDb.deleteRow(
            appwriteConfig.databaseId,
            appwriteConfig.fileTableId,
            fileId
        );
        if (deletedFile) {
            await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
        }
        revalidatePath(path);
        return { status: "success" };
    } catch (error) {
        handleError(error, "Unable to delete file");
    }
};

export const updateFileUsers = async ({
    fileId,
    emails,
    path,
}: UpdateFileUsersProps) => {
    const { tablesDb } = await createAdminClient();

    try {
        const updateFile = await tablesDb.updateRow(
            appwriteConfig.databaseId,
            appwriteConfig.fileTableId,
            fileId,
            { users: emails }
        );
        revalidatePath(path);
        return updateFile;
    } catch (error) {
        handleError(error, "Failed to share file");
    }
};
