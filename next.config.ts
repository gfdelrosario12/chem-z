/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. This is where 'output' needs to be, as a top-level property


  // 2. The 'eslint' property should ONLY contain ESLint-related options
  eslint: {
    // ... your eslint configs ...
    ignoreDuringBuilds: true,
  },
  
  // ... any other top-level configs ...
};

module.exports = nextConfig;