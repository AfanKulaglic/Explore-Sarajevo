import type { ComponentType } from "react";
import {
  BedDouble,
  Bike,
  Bus,
  Compass,
  Dumbbell,
  Landmark,
  Moon,
  PartyPopper,
  ShieldPlus,
  ShoppingBag,
  Sparkles,
  TreePine,
  Utensils,
} from "lucide-react";

const ICON_CLASS = "w-7 h-7 mb-2 text-white/90";

/** Default icons per category slug (Bosnian slugs + legacy English fallbacks). */
const SLUG_ICON_MAP: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  "aktivnosti-i-iskustva": Compass,
  "activities-experiences": Compass,
  smjestaj: BedDouble,
  accommodation: BedDouble,
  "hrana-i-pice": Utensils,
  "food-drink": Utensils,
  dogadaji: PartyPopper,
  events: PartyPopper,
  "wellness-i-ljepota": Sparkles,
  "wellness-beauty": Sparkles,
  "kultura-i-historija": Landmark,
  avantura: Compass,
  "priroda-i-aktivnosti-na-otvorenom": TreePine,
  "nature-outdoors": TreePine,
  kupovina: ShoppingBag,
  "prakticno-usluge": ShieldPlus,
  "practical-services": ShieldPlus,
  "nocni-zivot": Moon,
  sportovi: Dumbbell,
  "transport-i-mobilnost": Bus,
  health: ShieldPlus,
};

export function CategoryIcon({ slug }: { slug: string }) {
  const Icon = SLUG_ICON_MAP[slug] ?? Bike;
  return <Icon className={ICON_CLASS} />;
}
