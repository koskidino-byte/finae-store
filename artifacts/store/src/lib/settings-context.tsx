import { createContext, useContext, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type SiteSettings = {
  store_name: string;
  store_tagline: string;
  hero_title: string;
  hero_subtitle: string;
  free_shipping_min: string;
  currency_symbol: string;
  contact_email: string;
  primary_color: string;
  announcement: string;
};

const DEFAULTS: SiteSettings = {
  store_name: "FINAE",
  store_tagline: "Everyday essentials made to feel luxurious. Crafted for a slower, more intentional way of living.",
  hero_title: "Home goods for a slower pace.",
  hero_subtitle: "Premium pillowcases, sheets, towels, and socks — crafted to last, designed to feel exceptional.",
  free_shipping_min: "75",
  currency_symbol: "€",
  contact_email: "",
  primary_color: "#c9a84c",
  announcement: "",
};

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

async function fetchSettings(): Promise<SiteSettings> {
  const res = await fetch("/api/settings");
  if (!res.ok) return DEFAULTS;
  return res.json();
}

async function patchSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const res = await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}

type SettingsCtx = {
  settings: SiteSettings;
  updateSettings: (updates: Partial<SiteSettings>) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
};

const Ctx = createContext<SettingsCtx>({
  settings: DEFAULTS,
  updateSettings: async () => {},
  isLoading: false,
  isSaving: false,
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: patchSettings,
    onSuccess: (data) => queryClient.setQueryData(["site-settings"], data),
  });

  const settings = data ?? DEFAULTS;

  useEffect(() => {
    const color = settings.primary_color;
    if (color && color.startsWith("#") && color.length === 7) {
      try {
        document.documentElement.style.setProperty("--primary", hexToHsl(color));
      } catch {}
    }
  }, [settings.primary_color]);

  return (
    <Ctx.Provider value={{
      settings,
      updateSettings: async (updates) => { await mutation.mutateAsync(updates); },
      isLoading,
      isSaving: mutation.isPending,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  return useContext(Ctx);
}
