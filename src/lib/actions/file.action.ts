"use server";

import { InputFile } from "node-appwrite/file";
import { createAdminClient } from "../appwrite";
import { handleError } from "./user.actions";
import { appwriteConfig } from "../appwrite/config";
import { ID } from "node-appwrite";
import { constructFileUrl, getFileType } from "../utils";
import { revalidatePath } from "next/cache";

export const upload = async ({
    file,
    ownerId,
    accountId,
    path,
}: UploadFileProps) => {
    const { storage, tablesDb } = await createAdminClient();

    try {
        const inputFile = InputFile.fromBuffer(file, file.name);
        const bucletFile = await storage.createFile(
            appwriteConfig.bucketId,
            ID.unique(),
            inputFile
        );

        const fileDocument = {
            type: getFileType({ fileName: bucletFile.name }).type,
            name: bucletFile.name,
            url: constructFileUrl(bucletFile.$id),
            extension: getFileType({ fileName: bucletFile.name }).extension,
            size: bucletFile.sizeOriginal,
            owner: ownerId,
            account: accountId,
            users: [],
            bucletFileId: bucletFile.$id,
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
                    bucletFile.$id
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
