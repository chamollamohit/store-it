"use server";

import { createAdminClient, createSessionClient } from "../appwrite";
import { getCurrentUser, handleError } from "./user.actions";
import { appwriteConfig } from "../appwrite/config";
import { ID, Query } from "node-appwrite";
import { constructFileUrl, getFileType } from "../utils";
import { revalidatePath } from "next/cache";
import {
    CreateFileDocumentProps,
    DeleteFileProps,
    FileType,
    GetFilesProps,
    MyFile,
    RenameFileProps,
    UpdateFileUsersProps,
} from "../../../types";

// export const uploadFile = async ({
//     file,
//     ownerId,
//     accountId,
//     path,
// }: UploadFileProps) => {
//     const { storage, tablesDb } = await createAdminClient();

//     try {
//         const inputFile = InputFile.fromBuffer(file, file.name);
//         const bucketFile = await storage.createFile(
//             appwriteConfig.bucketId,
//             ID.unique(),
//             inputFile
//         );

//         const fileDocument = {
//             type: getFileType({ fileName: bucketFile.name }).type,
//             NAME: bucketFile.name,
//             url: constructFileUrl(bucketFile.$id),
//             extension: getFileType({ fileName: bucketFile.name }).extension,
//             size: bucketFile.sizeOriginal,
//             owner: ownerId,
//             accountId,
//             users: [],
//             bucketFileId: bucketFile.$id,
//         };

//         const newFile = await tablesDb
//             .createRow(
//                 appwriteConfig.databaseId,
//                 appwriteConfig.fileTableId,
//                 ID.unique(),
//                 fileDocument
//             )
//             .catch(async (error: unknown) => {
//                 await storage.deleteFile(
//                     appwriteConfig.bucketId,
//                     bucketFile.$id
//                 );
//                 handleError(
//                     error,
//                     "Failed to upload meta data... So deleting file"
//                 );
//             });

//         revalidatePath(path);
//         return newFile;
//     } catch (error) {
//         handleError(error, "Failed to upload file");
//     }
// };

export const createFileDocument = async ({
    bucketFileId,
    fileName,
    fileSize,
    ownerId,
    accountId,
    path,
}: CreateFileDocumentProps) => {
    // Get storage as well, for the .catch block
    const { storage, tablesDb } = await createAdminClient();

    try {
        // We no longer call storage.createFile here.
        // We just build the document from the props.
        const fileDocument = {
            type: getFileType({ fileName }).type,
            NAME: fileName,
            url: constructFileUrl(bucketFileId),
            extension: getFileType({ fileName }).extension,
            size: fileSize,
            owner: ownerId,
            accountId,
            users: [],
            bucketFileId: bucketFileId,
        };

        const newFile = await tablesDb
            .createRow(
                appwriteConfig.databaseId,
                appwriteConfig.fileTableId,
                ID.unique(),
                fileDocument
            )
            .catch(async (error: unknown) => {
                // This is still important!
                // If the DB write fails, delete the orphaned file from storage.
                await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
                handleError(
                    error,
                    "Failed to create file document... So deleting file"
                );
            });

        revalidatePath(path);
        return newFile;
    } catch (error) {
        handleError(error, "Failed to create file document");
    }
};

const createQueries = (
    currentUser: MyFile,
    types: string[],
    searchText: string,
    sort: string,
    limit?: number
) => {
    const queries = [
        Query.or([
            Query.equal("owner", currentUser.$id),
            Query.contains("users", currentUser.email),
        ]),
    ];
    if (types.length > 0) queries.push(Query.equal("type", types));
    if (searchText) queries.push(Query.contains("NAME", searchText));
    if (limit) queries.push(Query.limit(limit));
    if (sort) {
        const [sortBy, orderBy] = sort.split("-");

        queries.push(
            orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy)
        );
    }
    // console.log(queries);

    return queries;
};

export const getFiles = async ({
    types,
    searchText = "",
    sort = "$createdAt-desc",
    limit,
}: GetFilesProps) => {
    const { tablesDb } = await createAdminClient();

    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) return;
        if (!currentUser) {
            throw new Error("User is not authenticated");
        }

        const queries = createQueries(
            currentUser as unknown as MyFile,
            types,
            searchText,
            sort,
            limit
        );
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

            return {
                ...file,
                owner,
            };
        });

        // @ts-expect-error "Ignore"

        const allFiles: MyFile[] = await Promise.all(fileOwner);

        return allFiles;
    } catch (error) {
        handleError(error, "Failed to fetch files");
        return [];
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

export async function getTotalSpaceUsed() {
    try {
        const { tablesDb } = await createSessionClient();
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("User is not authenticated.");

        const files = await tablesDb.listRows(
            appwriteConfig.databaseId,
            appwriteConfig.fileTableId,
            [Query.equal("owner", [currentUser.$id]), Query.limit(100)]
        );

        const totalSpace = {
            image: { size: 0, latestDate: "" },
            document: { size: 0, latestDate: "" },
            video: { size: 0, latestDate: "" },
            audio: { size: 0, latestDate: "" },
            other: { size: 0, latestDate: "" },
            used: 0,
            all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
        };

        files.rows.forEach((file) => {
            const fileType = file.type as FileType;
            totalSpace[fileType].size += file.size;
            totalSpace.used += file.size;

            if (
                !totalSpace[fileType].latestDate ||
                new Date(file.$updatedAt) >
                    new Date(totalSpace[fileType].latestDate)
            ) {
                totalSpace[fileType].latestDate = file.$updatedAt;
            }
        });

        return totalSpace;
    } catch (error) {
        handleError(error, "Error calculating total space used:, ");
    }
}
