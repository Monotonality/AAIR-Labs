import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // The old /projects pages moved into the portal (Active Research / My
  // Research). Temporary redirects keep old links working.
  async redirects() {
    return [
      { source: "/projects", destination: "/portal/active-research", permanent: false },
      { source: "/projects/new", destination: "/portal/active-research/new", permanent: false },
      { source: "/projects/:id/edit", destination: "/portal/my-research/:id", permanent: false },
      { source: "/projects/:id", destination: "/portal/active-research/:id", permanent: false },
    ];
  },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost }]
      : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
