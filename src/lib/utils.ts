import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// export const parseStringify = (value: any) => {
//     return JSON.parse(JSON.stringify(value));
// };

export const getFileType = ({
    fileName,
}: {
    fileName: string;
}): { type: string; extension: string } => {
    if (!fileName) {
        return { type: "file", extension: "" };
    }

    const lastDotIndex = fileName.lastIndexOf(".");

    // Handle files with no extension or hidden files (e.g., ".env")
    if (lastDotIndex === -1 || lastDotIndex === 0) {
        return { type: "file", extension: "" };
    }

    const extension = fileName.slice(lastDotIndex + 1).toLowerCase();

    const typeMappings: { [key: string]: string[] } = {
        image: ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp"],
        video: ["mp4", "mov", "avi", "mkv", "webm", "flv"],
        audio: ["mp3", "wav", "ogg", "aac", "m4a"],
        document: ["pdf", "doc", "docx", "txt", "rtf", "odt"],
        spreadsheet: ["xls", "xlsx", "csv"],
        presentation: ["ppt", "pptx"],
        archive: ["zip", "rar", "7z", "tar", "gz"],
        code: [
            "js",
            "ts",
            "jsx",
            "tsx",
            "html",
            "css",
            "json",
            "xml",
            "md",
            "py",
            "java",
        ],
    };

    for (const type in typeMappings) {
        if (typeMappings[type].includes(extension)) {
            return { type, extension };
        }
    }

    // If no specific type is found, default to a generic 'file' type
    return { type: "file", extension };
};

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export const getFileIcon = (extension: string, type: string) => {
    switch (extension) {
        // Document
        case "pdf":
            return "/icons/file-pdf.svg";
        case "doc":
            return "/icons/file-doc.svg";
        case "docx":
            return "/icons/file-docx.svg";
        case "csv":
            return "/icons/file-csv.svg";
        case "txt":
            return "/icons/file-txt.svg";
        case "xls":
        case "xlsx":
            return "/icons/file-document.svg";
        // Image
        case "svg":
            return "/icons/file-image.svg";
        // Video
        case "mkv":
        case "mov":
        case "avi":
        case "wmv":
        case "mp4":
        case "flv":
        case "webm":
        case "m4v":
        case "3gp":
            return "/icons/file-video.svg";
        // Audio
        case "mp3":
        case "mpeg":
        case "wav":
        case "aac":
        case "flac":
        case "ogg":
        case "wma":
        case "m4a":
        case "aiff":
        case "alac":
            return "/icons/file-audio.svg";

        default:
            switch (type) {
                case "image":
                    return "/icons/file-image.svg";
                case "document":
                    return "/icons/file-document.svg";
                case "video":
                    return "/icons/file-video.svg";
                case "audio":
                    return "/icons/file-audio.svg";
                default:
                    return "/icons/file-other.svg";
            }
    }
};

export const constructFileUrl = (bucketFileId: string) => {
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${bucketFileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
};
