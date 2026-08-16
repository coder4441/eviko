#!/usr/bin/env python3
"""
EVIKO POS - cPanel fix script
Writes correct next.config.mjs and runs build
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

print("✅ next.config.mjs yozilmoqda...")
with open('next.config.mjs', 'w') as f:
    f.write(config)
print("✅ next.config.mjs tayyor!")

print("🗑️  .next cache o'chirilmoqda...")
subprocess.run(['rm', '-rf', '.next'], check=False)
print("✅ Cache o'chirildi!")

print("🔨 npm run build boshlandi...")
result = subprocess.run(['npm', 'run', 'build'], capture_output=False)
if result.returncode == 0:
    print("\n🎉 BUILD MUVAFFAQIYATLI TUGADI!")
else:
    print(f"\n❌ Build xato bilan tugadi (kod: {result.returncode})")
