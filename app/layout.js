import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionWrapper from "./components/SessionWrapper";
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Milkmate - Manage Delivery and Bills",
  description: "Milkmate is a smart dairy management system designed for milk distributors and suppliers. Track inventory, automate billing, manage customers, and simplify daily milk delivery operations — all in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Analytics />
        <ToastContainer position="top-right"  autoClose={3000} />
        <Toaster position="top-center" reverseOrder={false} />
        <SessionWrapper>
        {children}

          </SessionWrapper>
       
      </body>
    </html>
  );
}
