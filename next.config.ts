import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "img.freepik.com" },
            { protocol: "https", hostname: "cloud.appwrite.io" },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: "51mb",
        },
    },
};

export default nextConfig;
