/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sqlite3'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
