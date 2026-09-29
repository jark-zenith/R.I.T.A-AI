import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "R.I.T.A AI",
  description: "Revenue Intelligence and Transaction Assistant",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
