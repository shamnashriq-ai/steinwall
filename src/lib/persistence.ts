import { SteinwallData, defaultSteinwallData } from "./types";

const STORAGE_KEY = "steinwall_v1";

export function saveData(data: SteinwallData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      lastUpdated: new Date().toISOString(),
    }));
  } catch (e) {
    console.error("Steinwall save failed:", e);
  }
}

export function loadData(): SteinwallData {
  if (typeof window === "undefined") return defaultSteinwallData;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSteinwallData;
    return { ...defaultSteinwallData, ...JSON.parse(stored) };
  } catch (e) {
    console.error("Steinwall load failed:", e);
    return defaultSteinwallData;
  }
}

export function clearData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
