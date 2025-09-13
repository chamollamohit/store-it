"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import { Thumbnail } from "./Thumbnail";
import { MAX_FILE_SIZE } from "@/Constants";
import { toast } from "sonner";
import { uploadFile } from "@/lib/actions/file.action";
import { usePathname } from "next/navigation";

function FileUploader({
    ownerId,
    accountId,
    className,
}: {
    ownerId: string;
    accountId: string;
    className?: string;
}) {
    const [files, setFiles] = useState<File[]>([]);
    const path = usePathname();
    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            setFiles(acceptedFiles);
            const uploadFilePromise = acceptedFiles.map(async (file) => {
                if (file.size > MAX_FILE_SIZE) {
                    setFiles((prev) =>
                        prev.filter((prevfile) => prevfile.name != file.name)
                    );
                    return toast("File is to large", {
                        description: (
                            <p className="text-white">
                                <span className="font-semibold">
                                    {file.name}{" "}
                                </span>
                                is too large. Max size is 50 MB.
                            </p>
                        ),

                        classNames: {
                            toast: "!bg-red !rounded-[10px]",
                            title: "!font-extrabold !text-white ",
                            description: "text-sm ",
                        },
                        position: "top-center",
                    });
                }
                return await uploadFile({
                    file,
                    accountId,
                    ownerId,
                    path,
                })
                    .then((uploadFile) => {
                        if (uploadFile) {
                            setFiles((prev) =>
                                prev.filter(
                                    (prevFile) => prevFile.name != file.name
                                )
                            );
                        }
                    })
                    .then(() =>
                        toast.success(`${file.name} uploaded successfully`, {
                            classNames: {
                                toast: "!bg-red !rounded-[10px]",
                                title: "!text-white ",
                            },
                            position: "top-center",
                        })
                    )
                    .catch(() =>
                        toast.error(
                            `${file.name} not uploaded.. Try again later`,
                            {
                                classNames: {
                                    toast: "!bg-red !rounded-[10px]",
                                    title: "!text-white ",
                                },
                                position: "top-center",
                            }
                        )
                    );
            });
            await Promise.all(uploadFilePromise);
        },
        [ownerId, accountId, path]
    );
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
    });

    const handleRemoveFile = (
        e: React.MouseEvent<HTMLImageElement>,
        fileName: string
    ) => {
        e.stopPropagation();
        setFiles((prev) => prev.filter((file) => file.name != fileName));
    };

    return (
        <>
            <div {...getRootProps()} className="cursor-pointer">
                <input {...getInputProps()} />
                <Button
                    type="button"
                    className={cn("uploader-button", className)}
                >
                    <Image
                        src={"/icons/upload.svg"}
                        alt="upload"
                        width={24}
                        height={24}
                    />
                    <p>Upload</p>
                </Button>
            </div>
            {files.length > 0 && (
                <ul className="uploader-preview-list">
                    <h4 className="h4 text-light-100">Uploading</h4>
                    {files.map((file, index) => {
                        const { type, extension } = getFileType({
                            fileName: file.name,
                        });
                        return (
                            <li
                                key={`${file.name}-${index}`}
                                className="uploader-preview-item"
                            >
                                <div className="flex items-center gap-3">
                                    <Thumbnail
                                        type={type}
                                        extension={extension}
                                        url={convertFileToUrl(file)}
                                    />
                                    <div className="preview-item-name flex">
                                        <div className="line-clamp-1">
                                            {file.name}
                                        </div>
                                        <div>
                                            <Image
                                                src={"/icons/file-loader.gif"}
                                                alt="loader"
                                                width={100}
                                                height={50}
                                                unoptimized={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Image
                                    src={"/icons/remove.svg"}
                                    alt="remove"
                                    width={24}
                                    height={24}
                                    onClick={(e) =>
                                        handleRemoveFile(e, file.name)
                                    }
                                />
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}

export default FileUploader;
