"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useAuth } from "react-oidc-context";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user} = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const signOutRedirect = () => {
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const logoutUri = `${process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI}`;
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri ?? "")}`;
    console.log("Logging out, redirecting to:", logoutUrl);
    window.location.href = logoutUrl;
    // alert(`You have been logged out. ${logoutUrl}`);
    // router.push(logoutUrl);
  };

  // Common navigation items for both admin and staff
  const commonNavItems = [
    { name: "Dashboard", path: "/", icon: "window" },
    { name: "Customers", path: "/customers", icon: "users" },
  ];

  // Admin-only navigation items
  const adminNavItems = [
    { name: "Upload Data", path: "/upload", icon: "file" },
  ];

  // Determine which nav items to show based on user role
  const navItems = true
    ? [...commonNavItems, ...adminNavItems]
    : commonNavItems;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md fixed h-full">
        <div className="px-6 py-4 border-b">
          <h1 className="text-xl font-bold">OYSIRS</h1>
          <p className="text-sm text-gray-500">
            {true ? "Admin Dashboard" : "Staff Dashboard"}
          </p>
        </div>
        
        <nav className="mt-6 px-4">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link 
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors ${
                    pathname === item.path ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <Image
                    src={`/${item.icon}.svg`}
                    alt={item.name}
                    width={20}
                    height={20}
                    className="mr-3"
                  />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-full border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.profile.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-2">
                <span className="text-sm font-medium block">{user?.profile.email || 'User'}</span>
                {/* <span className="text-xs text-gray-500">{user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}</span> */}
              </div>
            </div>
            <button 
              onClick={signOutRedirect}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        <header className="bg-white shadow-sm h-16 fixed w-[calc(100%-16rem)] z-10">
          <div className="h-full px-6 flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {navItems.find(item => item.path === pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        
        <main className="pt-24 pb-8 px-6">
          {children}
        </main>
      </div>
    </div>
  );
}