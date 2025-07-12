// import {withSentryConfig} from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'g.foolcdn.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.content.foolcdn.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'content.foolcdn.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.benzinga.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.decrypt.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.reuters.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.bloomberg.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.cnbc.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.marketwatch.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.wsj.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.ft.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.economist.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.cnn.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.bbc.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.nytimes.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.yahoo.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.investing.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.forbes.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.fool.com', port: '', pathname: '/**' }
    ]
  }
};

// Sentry is completely disabled
export default nextConfig;