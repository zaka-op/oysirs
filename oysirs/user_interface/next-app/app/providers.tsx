"use client";

import {ErrorOverlay, LoadingOverlay} from "@/components/Overlay";
import { withHulk } from "hulk-react-utils";
import { useAuth, withAuthenticationRequired } from "react-oidc-context";
import { AuthProvider } from "react-oidc-context";


const cognitoAuthConfig = {
  authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY,
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI,
  response_type: process.env.NEXT_PUBLIC_COGNITO_RESPONSE_TYPE,
  scope: process.env.NEXT_PUBLIC_COGNITO_SCOPE,
};

function HulkProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuth()
    
    return withHulk(({children}: { children: React.ReactNode }) => children, {
        alertGlobalOptions: {
            targetId: "alert-container",
            replaceDuplicates: true,
        },
        fetchGlobalOptions: {
            baseUrl: process.env.NEXT_PUBLIC_BASE_API_URL,
            accessTokenRetriever: async () => {
                console.log(`Retrieved access token for fetch requests: ${auth?.user?.access_token}`);
                return {
                    access_token: auth?.user?.id_token || "",
                }
            },
            defaultHeaders: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${auth?.user?.id_token}`,
            },
            onError: (error, alert) => {
                const alertId = "error-alert"
                // alert?.push(<div>Error <button onClick={() => alert?.pop({alertId})}></button></div>, {alertId})
                alert?.push(
                    <ErrorOverlay
                        message={error.message}
                        onClose={() => alert?.pop({ alertId })}
                    />,
                    { alertId }
                )
                console.error("Fetch error:", error)
            },
            onPending: (state, alert) => {
                const alertId = "loading-alert"
                if (state === "start") {
                    alert?.push(
                        <LoadingOverlay message="Loading..." />,
                        { alertId }
                    )
                } else {
                    alert?.pop({ alertId })
                }
            }
        }
    })({children});
}

const ProtectedContent = withAuthenticationRequired(({ children }: { children: React.ReactNode }) => children);

export default function AppProvider({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider {...cognitoAuthConfig}>
            <HulkProvider>
                <ProtectedContent>
                    {children}
                </ProtectedContent>
            </HulkProvider>
        </AuthProvider>
    );
}