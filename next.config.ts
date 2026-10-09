import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This is a client-auth, TanStack-Query-driven SPA: the token lives in
  // localStorage and every authenticated route fetches on the client. The
  // experimental Cache Components / Partial Prefetching render model assumes
  // server-known static shells, which these routes don't have — enabling it
  // only produces dev-time "instant navigation" validation noise. Standard
  // App Router rendering is the right fit here.
};

export default nextConfig;
