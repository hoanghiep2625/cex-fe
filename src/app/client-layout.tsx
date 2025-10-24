"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
