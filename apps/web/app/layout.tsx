import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "../components/nav";

export const metadata: Metadata = {
  title: "FlowPilot",
  description: "Workflow automation platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container-shell py-6">{children}</main>
      </body>
    </html>
  );
}
