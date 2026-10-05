import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* 允许通过局域网 IP 在开发模式下访问 Next 资源（否则前端 JS 会被跨域拦截，页面空白） */
  allowedDevOrigins: ["10.82.186.100", "100.91.113.91", "zhaoteam", "localhost", "127.0.0.1"],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
