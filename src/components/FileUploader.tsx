"use client";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";
import { cn, convertFileToUrl, getFileType } from "@/lib/utils";
import Image from "next/image";
import { Thumnail } from "./Thumnail";

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

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
        <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            <Button type="button" className={cn("uploader-button", className)}>
                <Image
                    src={"/icons/upload.svg"}
                    alt="upload"
                    width={24}
                    height={24}
                />
                <p>Upload</p>
            </Button>
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
                                    <Thumnail
                                        type={type}
                                        extension={extension}
                                        url={convertFileToUrl(file)}
                                    />
                                    <div className="preview-item-name">
                                        {file.name}
                                        <Image
                                            src={"/icons/file-loader.gif"}
                                            alt="loader"
                                            width={100}
                                            height={50}
                                        />
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
            {isDragActive ? (
                <p>Drop the files here ...</p>
            ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
            )}
        </div>
    );
}

export default FileUploader;
