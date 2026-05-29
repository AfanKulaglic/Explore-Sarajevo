export const PLATFORM_CATALOG = [
  { code: "QUIZ", name: "Quiz", type: "WEB_APP" },
  { code: "HOTSPOT", name: "Hotspot", type: "HOTSPOT" },
  { code: "PAMENTO", name: "Pamento", type: "MOBILE_APP" },
  { code: "EXPLORE", name: "Explore", type: "WEB_APP" },
  { code: "GIFT_CENTER", name: "Gift Center", type: "BACKOFFICE" },
  { code: "GIFT_SHOP", name: "Gift Shop", type: "WEB_APP" },
  { code: "GAME", name: "Game", type: "OTHER" },
] as const;

export type PlatformCode = (typeof PLATFORM_CATALOG)[number]["code"];
