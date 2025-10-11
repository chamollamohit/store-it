"use client";
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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

import { actionsDropdownItems } from "@/Constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { deleteFile, renameFile } from "@/lib/actions/file.action";
import { usePathname } from "next/navigation";
import { FileDetails } from "./ui/ActionModalConten";
import { ActionType, MyFile } from "../../types";
const ActionDropdown = ({ file }: { file: MyFile }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const [action, setAction] = useState<ActionType | false>();
    const [name, setName] = useState(file.NAME);
    const [isLoading, setIsLoading] = useState(false);
    const path = usePathname();
    const closeAllModal = () => {
        setIsModalOpen(false);
        setIsDropDownOpen(false);
        setAction(false);
        setName(file.NAME);
        // console.log(file);
    };

    const handleAction = async () => {
        if (!action) return;
        setIsLoading(true);
        let success;
        const actions = {
            rename: () =>
                renameFile({
                    fileId: file.$id,
                    name,
                    extension: file.extension,
                    path,
                }),
            share: () => console.log("share"),
            delete: () =>
                deleteFile({
                    fileId: file.$id,
                    bucketFileId: file.bucketFileId,
                    path,
                }),
        };
        success = await actions[action.value as keyof typeof actions]();
        if (success) closeAllModal();
        console.log(action);

        setIsLoading(false);
    };

    const renderDialogContent = () => {
        if (!action) return null;
        const { value, label } = action;
        return (
            <DialogContent className="shad-dialog button">
                <DialogHeader className="flex flex-col gap-3">
                    <DialogTitle className="text-center text-light-100">
                        {label}
                    </DialogTitle>
                    {value === "rename" && (
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}
                    {value === "details" && <FileDetails file={file} />}
                </DialogHeader>
                {["rename", "delete", "share"].includes(value) && (
                    <DialogFooter className="flex flex-col gap-3 md:flex-row">
                        <Button
                            onClick={closeAllModal}
                            className="modal-cancel-button"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAction}
                            className="modal-submit-button"
                            disabled={isLoading}
                        >
                            <p className="capitalize">{value}</p>
                            {isLoading && (
                                <Image
                                    src={"/icons/loader.svg"}
                                    alt="loader"
                                    width={24}
                                    height={24}
                                    className="animate-spin"
                                />
                            )}
                        </Button>
                    </DialogFooter>
                )}
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
                        className="cursor-pointer"
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel className="max-w-[200px]">
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
