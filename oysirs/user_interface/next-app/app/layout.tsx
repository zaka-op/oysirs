import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashboardLayout from "@/components/DashboardLayout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RepoProvider } from "@/lib/contexts/repo";
import { AuthProvider } from "react-oidc-context";
import AppProvider from "./providers";


const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "OYSIRS",
    description: "Oyo State Internal Revenue Service",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const queryClient = new QueryClient();
    const cognitoAuthConfig = {
        authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY,
        client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI,
        response_type: process.env.NEXT_PUBLIC_COGNITO_RESPONSE_TYPE,
        scope: process.env.NEXT_PUBLIC_COGNITO_SCOPE,
    };
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AppProvider>
                    <DashboardLayout>
                        {children}
                    </DashboardLayout>
                </AppProvider>
            </body>
        </html>
    );
}