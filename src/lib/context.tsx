"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { SteinwallData, defaultSteinwallData } from "./types";
import { saveData, loadData } from "./persistence";

interface SteinwallContextType {
  data: SteinwallData;
  update: (partial: Partial<SteinwallData>) => void;
  hydrated: boolean;
}

const SteinwallContext = createContext<SteinwallContextType>({
  data: defaultSteinwallData,
  update: () => {},
  hydrated: false,
});

export function SteinwallProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SteinwallData>(defaultSteinwallData);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(loadData());
    setHydrated(true);
  }, []);

  const update = useCallback((partial: Partial<SteinwallData>) => {
    setData((prev) => {
      const next = { ...prev, ...partial };
      saveData(next);
      return next;
    });
  }, []);

  return (
    <SteinwallContext.Provider value={{ data, update, hydrated }}>
      {children}
    </SteinwallContext.Provider>
  );
}

export function useSteinwall() {
  return useContext(SteinwallContext);
}
