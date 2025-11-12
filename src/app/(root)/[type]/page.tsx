import Card from "@/components/Card";
import Sort from "@/components/Sort";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.action";
import {
    convertFileSize,
    getFileTypesParams,
    getUsageSummary,
} from "@/lib/utils";
import { Models } from "node-appwrite";
import React from "react";
import { FileType, MyFile, SearchParamProps } from "../../../../types";

async function page({ searchParams, params }: SearchParamProps) {
    const { type } = await params;
    const searchText = ((await searchParams)?.query as string) || "";
    const sort = (await searchParams)?.sort as string;
    const types = getFileTypesParams(type) as FileType[];
    const files = await getFiles({ types, searchText, sort });
    const totalSpace = await getTotalSpaceUsed();

    const usageSummary = getUsageSummary(totalSpace!);
    console.log(totalSpace);

    const summary = usageSummary.find((summary) => summary.url.includes(type));
    const fileSize = convertFileSize(summary ? summary.size : 0);

    return (
        <div className="page-container">
            <section className="w-full">
                <h1 className="h1 capitalize">{type}</h1>
                <div className="total-size-section">
                    <p className="body-1">
                        Total: <span className="h5">{fileSize}</span>
                    </p>
                    <div className="sort-container">
                        <p className="body-1 hidden sm:block text-light-200">
                            Sort by:
                        </p>
                        <Sort />
                    </div>
                </div>
            </section>
            {files && files.length > 0 ? (
                <section className="file-list">
                    {files?.map((file) => (
                        <Card key={file.$id} file={file as unknown as MyFile} />
                    ))}
                </section>
            ) : (
                <p className="empty-list">No Files uploaded</p>
            )}
        </div>
    );
}

export default page;
