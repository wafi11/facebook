/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint : {
        ignoreDuringBuilds : true
    },
    experimental : {
        staleTimes : {
            dynamic : 30,
        },
        serverComponentsExternalPackages: ['@node-rs/argon2'],
    },
    env : {
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
    },
    images : {
        remotePatterns : [
            {
                protocol : "https",
                hostname  : "utfs.io",
                pathname : `/a/${process.env.NEXT_APP_UPLOADTHING_APP_ID}/*`
            }
        ]
    }

};

export default nextConfig;
