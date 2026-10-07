/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ReactNode } from "react";

declare global {
  type NextSearchParams = {
    [key: string]: string | string[] | undefined;
  };

  // Generic global page/layout prop helpers, mirroring Next's typedRoutes
  // shapes. Route templates are accepted for readability: PageProps<"/library/[id]">.
  type PageProps<_Route extends string = "/"> = {
    params: Promise<{ [key: string]: string }>;
    searchParams?: Promise<NextSearchParams>;
  };

  type LayoutProps<_Route extends string = "/"> = {
    params: Promise<{ [key: string]: string }>;
    children: ReactNode;
  };
}

export {};