'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { ChevronDown, Plus, Sparkles } from 'lucide-react';
import { hotspotPathForSegment } from '@/components/hotspot/hotspot-routes';
import {
  buildContentSnapshot,
  appendUtmToExternalUrl,
  resolveCampaign,
  clientFromAnalyticsRow,
} from '@/lib/hotspot/attribution';
import type { ListingRowVariant, PlacementType } from '@/lib/hotspot/types';
import { cn } from '@/lib/utils';

export interface CrmClientOption {
  id: number;
  name: string;
}

export interface CampaignOption {
  id: number;
  name: string;
  slug: string;
  is_active?: boolean;
  client_id?: number | null;
  notes?: string | null;
  campaign_start_date?: string | null;
  campaign_end_date?: string | null;
  campaign_start_time?: string | null;
  campaign_end_time?: string | null;
  start_include_time?: boolean;
  end_include_time?: boolean;
  /** Populated when API embeds `cms_crm_clients` */
  client?: { id: number; name: string } | null;
}

function campaignOptionLabel(c: CampaignOption): string {
  const bits = [c.name];
  if (c.client?.name) bits.push(c.client.name);
  else if (c.client_id) bits.push(`klijent #${c.client_id}`);
  if (c.campaign_start_date) bits.push(String(c.campaign_start_date).slice(0, 10));
  return bits.join(' · ');
}

export type HotspotAnalyticsValues = {
  id?: number;
  analytics_client_id?: number | null;
  analytics_client_label?: string | null;
  analytics_campaign_id?: number | null;
  creative_format?: string | null;
  placement_position?: number | null;
  analytics_tags?: unknown;
  analytics_overrides?: unknown;
  is_active?: boolean;
  display_order?: number;
};

interface HotspotAnalyticsFieldsProps {
  value: HotspotAnalyticsValues;
  onChange: (patch: Partial<HotspotAnalyticsValues>) => void;
  clients: CrmClientOption[];
  campaigns: CampaignOption[];
  onCampaignsRefresh: () => Promise<void>;
  /** Analytics placement / utm_medium default */
  placementType: PlacementType;
  /** Human label for editors (section context) */
  placementLabel: string;
  /** Outbound URL used for UTM preview (hero button, CTA, etc.) */
  destinationUrl?: string | null;
  /** When true (default), placement_position is synced from display_order and not shown */
  inferPlacement?: boolean;
  /** For listing_row — drives utm_content segment */
  listingRowVariant?: ListingRowVariant;
  /** Tighter padding for dense CMS rows (e.g. block editor table) */
  dense?: boolean;
  /** Collapse behind a single summary row (saves vertical space in block rows) */
  collapsible?: boolean;
}

export function HotspotAnalyticsFields({
  value,
  onChange,
  clients,
  campaigns,
  onCampaignsRefresh,
  placementType,
  placementLabel,
  destinationUrl,
  inferPlacement = true,
  listingRowVariant,
  dense = false,
  collapsible = false,
}: HotspotAnalyticsFieldsProps) {
  const [newCampaignName, setNewCampaignName] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [campaignError, setCampaignError] = React.useState<string | null>(null);
  const [campaignQuickCreateOpen, setCampaignQuickCreateOpen] = React.useState(false);
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [overrideError, setOverrideError] = React.useState<string | null>(null);

  const tagsStr = React.useMemo(() => {
    const t = value.analytics_tags;
    if (Array.isArray(t)) return t.join(', ');
    return '';
  }, [value.analytics_tags]);

  const overridesStr = React.useMemo(() => {
    if (value.analytics_overrides && typeof value.analytics_overrides === 'object') {
      return JSON.stringify(value.analytics_overrides, null, 2);
    }
    return '';
  }, [value.analytics_overrides]);

  const createCampaign = async () => {
    const name = newCampaignName.trim();
    if (!name) return;
    setCreating(true);
    setCampaignError(null);
    try {
      const res = await fetch('/api/hotspot/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        credentials: 'include',
        cache: 'no-store',
      });
      const json = await res.json();
      if (json.success && json.data?.id != null) {
        onChange({ analytics_campaign_id: Number(json.data.id) });
        setNewCampaignName('');
        setCampaignQuickCreateOpen(false);
        await onCampaignsRefresh();
        return;
      }
      setCampaignError(
        typeof json.error === 'string' && json.error
          ? json.error
          : res.ok
            ? 'Kreiranje kampanje nije uspjelo (nepoznat odgovor).'
            : `Greška ${res.status}`
      );
    } catch {
      setCampaignError('Mrežna greška pri kreiranju kampanje.');
    } finally {
      setCreating(false);
    }
  };

  const campaignMap = React.useMemo(() => {
    const m = new Map<number, CampaignOption>();
    for (const c of campaigns) m.set(c.id, c);
    return m;
  }, [campaigns]);

  const previewUrl = React.useMemo(() => {
    const raw = destinationUrl?.trim();
    if (!raw || raw === '#') return '';
    const row: Record<string, unknown> = {
      ...value,
      placement_position: inferPlacement && value.display_order != null ? value.display_order : value.placement_position,
    };
    const client = clientFromAnalyticsRow(row);
    const campaign = resolveCampaign(value.analytics_campaign_id, campaignMap);
    const snap = buildContentSnapshot({
      placementType,
      row,
      client,
      campaign: campaign ?? undefined,
      destinationUrl: raw,
      defaultUtmSource: process.env.NEXT_PUBLIC_HS_UTM_SOURCE,
      context:
        placementType === 'listing_row' && listingRowVariant
          ? { listingType: listingRowVariant }
          : placementType === 'article_card'
            ? { listingType: 'news_carousel' }
            : undefined,
    });
    return appendUtmToExternalUrl(
      raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw.replace(/^\/\//, '')}`,
      snap
    );
  }, [destinationUrl, value, campaignMap, placementType, inferPlacement, listingRowVariant]);

  const selectedCampaign = campaigns.find((c) => c.id === value.analytics_campaign_id);
  const selectedClient = clients.find((c) => c.id === value.analytics_client_id);
  const visibilityLabel = value.is_active === false ? 'Neaktivno' : 'Aktivno';
  const summaryCampaign = selectedCampaign?.name ?? 'Organsko';
  const summaryClient = selectedClient?.name ?? 'Bez klijenta';

  const headerRow = (
    <div className="flex flex-wrap items-center gap-2 text-violet-800 font-medium text-sm">
      <Sparkles className="w-4 h-4" />
      Kampanja i mjerenje
      <span className="text-xs font-normal text-violet-600">({placementLabel})</span>
      <span
        className={`ml-auto text-xs font-medium px-2 py-0.5 rounded border ${
          value.is_active === false
            ? 'text-slate-600 bg-slate-50 border-slate-200'
            : 'text-emerald-700 bg-emerald-50 border-emerald-200'
        }`}
        title="Isto kao prekidač aktivnosti na kartici iznad"
      >
        {visibilityLabel}
      </span>
    </div>
  );

  const fieldsBlock = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Klijent (CRM)</label>
          <select
            className="w-full border border-gray-200 rounded-md px-2 py-2 text-sm bg-white"
            value={value.analytics_client_id ?? ''}
            onChange={(e) => {
              const id = e.target.value ? parseInt(e.target.value, 10) : null;
              const c = clients.find((x) => x.id === id);
              onChange({
                analytics_client_id: id,
                analytics_client_label: c?.name ?? null,
              });
            }}
          >
            <option value="">— bez klijenta —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <label className="block text-xs font-medium text-gray-600">Marketinška kampanja</label>
            <Link
              href={hotspotPathForSegment('kampanje')}
              className="text-[11px] font-medium text-violet-700 hover:text-violet-900 shrink-0"
            >
              Sve kampanje →
            </Link>
          </div>
          <div className="flex gap-1.5">
            <select
              className="min-w-0 flex-1 border border-gray-200 rounded-md px-2 py-2 text-sm bg-white"
              value={value.analytics_campaign_id ?? ''}
              onChange={(e) => {
                const id = e.target.value ? parseInt(e.target.value, 10) : null;
                onChange({ analytics_campaign_id: id });
              }}
            >
              <option value="">— organski (bez kampanje) —</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {campaignOptionLabel(c)}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-[38px] w-10 shrink-0 p-0"
              title="Brzi unos nove kampanje"
              aria-expanded={campaignQuickCreateOpen}
              aria-label="Otvori brzi unos kampanje"
              onClick={() => setCampaignQuickCreateOpen((o) => !o)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {campaignQuickCreateOpen ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-violet-200 bg-white/80 p-2">
              <input
                className="min-w-0 flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                placeholder="Naziv nove kampanje"
                title="Kreira kampanju samo s nazivom; detalje na stranici Kampanje"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void createCampaign();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0"
                disabled={creating || !newCampaignName.trim()}
                onClick={() => void createCampaign()}
              >
                Kreiraj
              </Button>
              <button
                type="button"
                className="text-[11px] font-medium text-slate-600 hover:text-slate-900 shrink-0"
                onClick={() => {
                  setCampaignQuickCreateOpen(false);
                  setNewCampaignName('');
                  setCampaignError(null);
                }}
              >
                Odustani
              </button>
            </div>
          ) : null}
          {campaignError ? (
            <p className="text-xs text-red-600 mt-1" role="alert">
              {campaignError}
            </p>
          ) : null}
        </div>
      </div>

      {previewUrl ? (
        <div className="rounded-md border border-gray-200 bg-white p-2 text-xs">
          <div className="text-gray-500 mb-1">Pregled izlaznog linka s UTM parametrima</div>
          <code className="break-all text-[11px] text-gray-800">{previewUrl}</code>
        </div>
      ) : (
        <p className="text-[11px] text-gray-500">
          Unesite puni URL (https://…) u polje linka iznad da vidite generisane UTM parametre.
        </p>
      )}

      <p className="text-[11px] text-gray-600 leading-relaxed">
        <code className="text-[10px]">utm_source</code> dolazi iz konfiguracije portala (
        <code className="text-[10px]">NEXT_PUBLIC_HS_UTM_SOURCE</code>), <code className="text-[10px]">utm_medium</code>{' '}
        odgovara tipu plasmana (<strong>{placementType}</strong>
        ), <code className="text-[10px]">utm_campaign</code> je slug kampanje ili <strong>organic</strong>.
        {selectedCampaign ? (
          <>
            {' '}
            Odabrana kampanja: <strong>{selectedCampaign.slug}</strong>
          </>
        ) : null}
      </p>

      <button
        type="button"
        onClick={() => setAdvancedOpen(!advancedOpen)}
        className="flex items-center gap-2 text-xs font-medium text-violet-800"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
        Napredno (format, tagovi, ručni UTM)
      </button>

      {advancedOpen && (
        <div className="space-y-3 pt-1 border-t border-violet-100">
          {!inferPlacement && (
            <Input
              label="Pozicija (placement_position)"
              type="number"
              value={value.placement_position ?? ''}
              onChange={(e) =>
                onChange({
                  placement_position: e.target.value === '' ? null : parseInt(e.target.value, 10),
                })
              }
              className="text-sm"
            />
          )}
          <Input
            label="Format kreativa (npr. 16:9, 9:16)"
            value={value.creative_format ?? ''}
            onChange={(e) => onChange({ creative_format: e.target.value || null })}
            placeholder="16:9"
            className="text-sm"
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Oznake za izvještaje (zarezom, latinično)
            </label>
            <input
              className="w-full border border-gray-200 rounded-md px-2 py-2 text-sm"
              value={tagsStr}
              onChange={(e) => {
                const parts = e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                onChange({ analytics_tags: parts });
              }}
            />
            <p className="text-[10px] text-gray-500 mt-1">Kratke oznake za filtriranje u analitici; nisu UTM parametri.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Ručni UTM override (JSON, samo za napredne)
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-md px-2 py-2 text-xs font-mono min-h-[72px]"
              value={overridesStr}
              onChange={(e) => {
                const raw = e.target.value.trim();
                if (!raw) {
                  onChange({ analytics_overrides: null });
                  setOverrideError(null);
                  return;
                }
                try {
                  const parsed = JSON.parse(raw) as Record<string, unknown>;
                  const allowed = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
                  const bad = Object.keys(parsed).filter((k) => !allowed.includes(k));
                  if (bad.length) {
                    setOverrideError(`Nepoznati ključevi: ${bad.join(', ')}`);
                    return;
                  }
                  onChange({ analytics_overrides: parsed });
                  setOverrideError(null);
                } catch {
                  setOverrideError('JSON nije validan');
                }
              }}
              placeholder='{"utm_campaign":"custom"}'
            />
            {overrideError ? <p className="text-xs text-red-600 mt-1">{overrideError}</p> : null}
          </div>
        </div>
      )}
    </>
  );

  if (collapsible) {
    return (
      <details className="group rounded-md border border-slate-200 bg-slate-50/80 text-slate-800 shadow-sm open:bg-white">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 text-sm marker:content-none [&::-webkit-details-marker]:hidden hover:bg-slate-100/80">
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
          <span className="shrink-0 font-medium text-slate-800">Kampanja i mjerenje</span>
          <span className="min-w-0 flex-1 truncate text-xs font-normal text-slate-500">
            {summaryClient} · {summaryCampaign}
          </span>
        </summary>
        <div className={cn('space-y-2 border-t border-slate-200 bg-white p-2.5', dense && 'space-y-1.5 p-2')}>
          {fieldsBlock}
        </div>
      </details>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-violet-100 bg-violet-50/40',
        dense ? 'space-y-2 p-2.5' : 'space-y-3 p-4'
      )}
    >
      {headerRow}
      {fieldsBlock}
    </div>
  );
}
