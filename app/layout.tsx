import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Suspense } from "react";
import UserAccessToast from "@/components/user-access-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexusAI",
  description: "A Next.js 15 project with TypeScript, Tailwind, and ShadCN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
        <Suspense fallback={null}>
          <UserAccessToast />
        </Suspense>
      </body>
    </html>
  );
}
