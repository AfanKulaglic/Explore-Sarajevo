import { getBusinesses, getCategories, getAttractions } from "../lib/api";
import BusinessHero from "./BusinessHero";
import BusinessBody from "./BusinessBody";
import BusinessLocation from "./BusinessLocation";
import RelatedPlaces from "./RelatedPlaces";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BusinessPage({ params }: Props) {
  const { id } = await params;

  const [businesses, categories, attractive_locations] = await Promise.all([
    getBusinesses(),
    getCategories(),
    getAttractions(),
  ]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <BusinessHero id={id} businesses={businesses} />
      <BusinessBody id={id} businesses={businesses} />
      <BusinessLocation id={id} businesses={businesses} />
      <RelatedPlaces id={id} businesses={businesses} />
    </div>
  );
}
