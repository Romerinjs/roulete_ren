/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Configuración para caracteres especiales
  experimental: {
    esmExternals: false,
  },
};

module.exports = nextConfig;
