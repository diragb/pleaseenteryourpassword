/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  compiler: {
    styledComponents: true,
  },
  trailingSlash: true,
};

export default nextConfig;
