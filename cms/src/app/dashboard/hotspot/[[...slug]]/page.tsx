import { notFound } from 'next/navigation';
import { HotspotSectionPanel } from '@/components/hotspot/HotspotWorkspace';
import { hotspotSectionFromSlug } from '@/components/hotspot/hotspot-routes';

export default async function HotspotPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const section = hotspotSectionFromSlug(slug);
  if (section === null) notFound();
  return <HotspotSectionPanel section={section} />;
}
