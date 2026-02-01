'use client';

import { createContext, useContext, ReactNode } from 'react';

const HideNavbarContext = createContext<boolean>(false);

export function HideNavbarProvider({ children, hide = false }: { children: ReactNode; hide?: boolean }) {
  return (
    <HideNavbarContext.Provider value={hide}>
      {children}
    </HideNavbarContext.Provider>
  );
}

export function useHideNavbar() {
  return useContext(HideNavbarContext);
}
