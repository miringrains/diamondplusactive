/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable source maps in production for better error tracking
  productionBrowserSourceMaps: true,
  
  // Experimental features
  experimental: {
    // Better error handling
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: ['https://diamondplusportal.com'],
    },
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // ESLint configuration
  eslint: {
    // WARNING: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },

  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.mux.com',
        pathname: '/**',
      },
    ],
  },

  // Custom webpack config for better debugging
  webpack: (config, { dev, isServer }) => {
    // Enable source maps in production
    if (!dev && !isServer) {
      config.devtool = 'source-map'
    }
    
    return config
  },
}

module.exports = nextConfig