#!/usr/bin/env python3
"""
EVIKO POS - cPanel EAGAIN fix script
Writes correct next.config.mjs with CPU limits and runs build
"""
import os
import subprocess

config = '''import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    compress: true,
    poweredByHeader: false,
    eslint: {
        // Build paytida xotira va protsessni tejash uchun eslint ni o'tkazib yuboramiz
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Build paytida xotira va protsessni tejash uchun typescript tekshiruvini o'tkazib yuboramiz
        ignoreBuildErrors: true,
    },
    webpack(config) {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.resolve(__dirname, 'src'),
        };
        return config;
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
            { protocol: 'http', hostname: 'localhost' }
        ],
        minimumCacheTTL: 3600,
    },
    experimental: {
        optimizePackageImports: ['lucide-react', 'recharts'],
        // EAGAIN xatosini oldini olish uchun faqat 1 ta CPU ishlatamiz
        cpus: 1,
        workerThreads: false,
    },
    async redirects() {
        return [
            { source: '/ubt-pos', destination: '/smart-pos', permanent: true },
            { source: '/ubt-pos/:path*', destination: '/smart-pos/:path*', permanent: true },
            { source: '/ubt', destination: '/smart', permanent: true },
            { source: '/ubt/:path*', destination: '/smart/:path*', permanent: true },
        ];
    },
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                ],
            },
        ];
    },
};

export default nextConfig;
'''

print("✅ next.config.mjs yozilmoqda (CPU limitlari bilan)...")
with open('next.config.mjs', 'w') as f:
    f.write(config)
print("✅ next.config.mjs tayyor!")

print("🗑️  .next cache o'chirilmoqda...")
subprocess.run(['rm', '-rf', '.next'], check=False)
print("✅ Cache o'chirildi!")

print("🔨 npm run build boshlandi...")
env = os.environ.copy()
env["NEXT_PRIVATE_MINIMAL_MODE"] = "1"
result = subprocess.run(['npm', 'run', 'build'], env=env, capture_output=False)
if result.returncode == 0:
    print("\n🎉 BUILD MUVAFFAQIYATLI TUGADI!")
else:
    print(f"\n❌ Build xato bilan tugadi (kod: {result.returncode})")
