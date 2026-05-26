import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BackgroundMesh } from "@/components/BackgroundMesh";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: {
    default: "miniword. Motion for LCD keypads.",
    template: "%s · miniword"
  },
  description:
    "A motion library for LCD keypads. Sized for every key.",
  metadataBase: new URL("https://miniword.gg"),
  openGraph: {
    title: "miniword",
    description: "Motion, made to fit.",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#FFFFFF" }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BackgroundMesh />
        <Header />
        <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 md:pt-16">{children}</main>
      </body>
    </html>
  );
}
