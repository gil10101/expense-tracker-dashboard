/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  webpack: (config) => {
    // Three.js support disabled for now
    // config.externals.push({
    //   'sharp': 'commonjs sharp',
    // });
    return config;
  },
};

export default nextConfig;

