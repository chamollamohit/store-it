"use server";

import { InputFile } from "node-appwrite/file";
import { createAdminClient } from "../appwrite";
import { handleError } from "./user.actions";
import { appwriteConfig } from "../appwrite/config";
import { ID } from "node-appwrite";
import { constructFileUrl, getFileType } from "../utils";
import { revalidatePath } from "next/cache";

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
