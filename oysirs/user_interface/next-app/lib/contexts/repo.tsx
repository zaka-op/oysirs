"use client";

import { createContext, ReactNode, useContext } from "react";
import { OysirsRepository } from "../repositories/base";
import { OysirsRepositoryProd } from "../repositories/prod";
import { useAuth } from "react-oidc-context";

const RepoContext = createContext<OysirsRepository | undefined>(undefined);

export const RepoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth();
    const repo = new OysirsRepositoryProd(() => auth.user?.access_token || "");

    return (
        <RepoContext.Provider value={repo}>
            {children}
        </RepoContext.Provider>
    );
};

export const useRepo = (): OysirsRepository => {
    const context = useContext(RepoContext);
    if (!context) {
        throw new Error('useRepo must be used within a RepoProvider');
    }
    return context;
};
