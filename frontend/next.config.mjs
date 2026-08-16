import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    compress: true,
    poweredByHeader: false,
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
    },
    images: {
        remotePatterns: [{ protocol: 'https', hostname: '**' }, { protocol: 'http', hostname: 'localhost' }],
        minimumCacheTTL: 3600,
    },
    experimental: {
        optimizePackageImports: ['lucide-react', 'recharts'],
    },

    // @ alias ni to'g'ridan-to'g'ri webpack ga ko'rsatamiz (cPanel uchun)
    webpack(config) {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.resolve(__dirname, 'src'),
        };
        return config;
    },

    // Eski URL lardan yangi URL larga redirect (ubt → smart rename)
    async redirects() {
        return [
            {
                source: '/ubt-pos',
                destination: '/smart-pos',
                permanent: true,
            },
            {
                source: '/ubt-pos/:path*',
                destination: '/smart-pos/:path*',
                permanent: true,
            },
            {
                source: '/ubt',
                destination: '/smart',
                permanent: true,
            },
            {
                source: '/ubt/:path*',
                destination: '/smart/:path*',
                permanent: true,
            },
        ];
    },

    // Security Headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                ],
            },
        ];
    },
};

export default nextConfig;
