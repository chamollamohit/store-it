"use client";
import React, { act, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/Constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
const ActionDropdown = ({ file }: { file: Models.Row }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const [action, setAction] = useState<ActionType>();
    const renderDialogContent = () => {
        return (
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove your data from our
                        servers.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        );
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DropdownMenu
                open={isDropDownOpen}
                onOpenChange={setIsDropDownOpen}
            >
                <DropdownMenuTrigger className="shad-no-focus">
                    <Image
                        src={"/icons/dots.svg"}
                        alt="dot"
                        width={24}
                        height={24}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel className="max-w-[200px] ">
                        {file.NAME}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {actionsDropdownItems.map((actionItem) => (
                        <DropdownMenuItem
                            key={actionItem.value}
                            className="shad-dropdown-item"
                            onClick={() => {
                                setAction(actionItem);
                                if (
                                    [
                                        "rename",
                                        "share",
                                        "delete",
                                        "details",
                                    ].includes(actionItem.value)
                                ) {
                                    setIsModalOpen(true);
                                }
                            }}
                        >
                            {actionItem.value === "download" ? (
                                <Link
                                    href={constructDownloadUrl(
                                        file.bucketFileId
                                    )}
                                    download={file.NAME}
                                    className="flex items-center gap-2"
                                >
                                    <Image
                                        src={actionItem.icon}
                                        alt={actionItem.label}
                                        width={30}
                                        height={30}
                                    />
                                    {actionItem.label}
                                </Link>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Image
                                        src={actionItem.icon}
                                        alt={actionItem.label}
                                        width={30}
                                        height={30}
                                    />
                                    {actionItem.label}
                                </div>
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            {renderDialogContent()}
        </Dialog>
    );
};

export default ActionDropdown;
