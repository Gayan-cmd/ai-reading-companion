import { Inter } from "next/font/google"; // Import the standard font
import "./globals.css";

// Configure the font
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Reading Companion",
  description: "Chat with your documents",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Apply the font class to the body */}
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}