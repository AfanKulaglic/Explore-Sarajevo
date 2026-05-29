import { getAttractions } from "../../lib/api";
import AttractionHero from "./AttractionHero";
import AttractionBody from "./AttractionBody";
import AttractionLocation from "./AttractionLocation";
import RelatedAttractions from "./RelatedAttractions";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AttractionPage({ params }: Props) {
  const { id } = await params;
  const attractions = await getAttractions();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <AttractionHero id={id} attractions={attractions} />
      <AttractionBody id={id} attractions={attractions} />
      <AttractionLocation id={id} attractions={attractions} />
      <RelatedAttractions id={id} attractions={attractions} />
    </div>
  );
}
