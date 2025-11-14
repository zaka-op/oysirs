"use client";

import DashboardLayout from '@/components/DashboardLayout'
import { withAuthenticationRequired } from "react-oidc-context";

function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {

    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}


export default withAuthenticationRequired(MainLayout)