/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || '3306',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'nautilus_reporting',
    JWT_SECRET: process.env.JWT_SECRET || '9f8b1c2d3e4f5g6h7i8j9k0l!@#QWEasdZXC123',
  },
}

export default nextConfig;