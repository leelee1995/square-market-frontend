import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ncspohmeuow89aak.public.blob.vercel-storage.com",
            },
        ],
    },
};

export default nextConfig;
