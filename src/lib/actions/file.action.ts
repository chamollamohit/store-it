"use server";

import { InputFile } from "node-appwrite/file";
import { createAdminClient } from "../appwrite";
import { getCurrentUser, handleError } from "./user.actions";
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
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

const createQueries = (currentUser: Models.Row, types: string[]) => {
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

        const queries = createQueries(currentUser, types);
        const files = await tablesDb.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.fileTableId,
            queries
        );
        // console.log(files);

        return files;
    } catch (error) {
        handleError(error, "Failed to fetch files");
    }
};
