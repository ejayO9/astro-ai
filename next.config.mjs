/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add custom webpack configuration if needed
  webpack: (config, { isServer }) => {
    // Any custom webpack configuration
    return config
  },
  // Development configuration
  ...(process.env.NODE_ENV === 'development' && {
    // In development, we can add specific configurations to help with debugging
    onDemandEntries: {
      // period (in ms) where the server will keep pages in the buffer
      maxInactiveAge: 25 * 1000,
      // number of pages that should be kept simultaneously without being disposed
      pagesBufferLength: 2,
    },
  }),
}

export default nextConfig