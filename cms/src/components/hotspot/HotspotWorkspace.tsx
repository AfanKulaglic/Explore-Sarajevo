'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Card, Input, Textarea, ImageUpload, VideoUpload, IconPicker, ToastContainer, useToast, Modal } from '@/components/ui';
import { useLanguage } from '@/lib/language-context';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  Video,
  Image as ImageIcon,
  Newspaper,
  Grid3X3, 
  Navigation, 
  Gamepad2,
  Settings,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  GripVertical,
  Sparkles,
  MapPin
} from 'lucide-react';
import {
  HotspotAnalyticsFields,
  type CrmClientOption,
  type CampaignOption,
  type HotspotAnalyticsValues,
} from '@/components/hotspot/HotspotAnalyticsFields';
import { HotspotCampaignsSection } from '@/components/hotspot/HotspotCampaignsSection';
import { hotspotPathForSegment, type HotspotSectionId } from '@/components/hotspot/hotspot-routes';
import {
  readHotspotSessionCache,
  writeHotspotSessionCache,
  clearHotspotSessionCache,
} from '@/lib/hotspot/hotspot-session-cache';

// =============================================================================
// TYPES
// =============================================================================

interface HeroVideo extends HotspotAnalyticsValues {
  id: number;
  video_url: string;
  video_url_alt: string | null;
  poster_url: string | null;
  title_ba: string | null;
  title_en: string | null;
  subtitle_ba: string | null;
  subtitle_en: string | null;
  button_text_ba: string | null;
  button_text_en: string | null;
  button_link: string | null;
  is_active: boolean;
  display_order: number;
}

interface HeroBanner extends HotspotAnalyticsValues {
  id: number;
  title: string;
  title_ba: string | null;
  title_en: string | null;
  subtitle: string | null;
  subtitle_ba: string | null;
  subtitle_en: string | null;
  image_url: string | null;
  cta_text: string | null;
  button_text_ba: string | null;
  button_text_en: string | null;
  cta_url: string | null;
  is_active: boolean;
  display_order: number;
}

interface NewsCard extends HotspotAnalyticsValues {
  id: number;
  title: string;
  text_ba: string | null;
  text_en: string | null;
  icon: string | null;
  image_url: string | null;
  cta_url: string | null;
  link: string | null;
  is_active: boolean;
  display_order: number;
}

interface NavigationChip extends HotspotAnalyticsValues {
  id: number;
  label_ba: string | null;
  label_en: string | null;
  custom_label: string | null;
  custom_icon: string | null;
  icon: string | null;
  custom_url: string | null;
  link: string | null;
  is_active: boolean;
  display_order: number;
}

interface BlockItem extends HotspotAnalyticsValues {
  id: number;
  block_set_id: number;
  title: string;
  title_ba: string | null;
  title_en: string | null;
  description: string | null;
  description_ba: string | null;
  description_en: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_text_en: string | null;
  cta_url: string | null;
  is_active: boolean;
  display_order: number;
}

interface BlockSet {
  id: number;
  name: string;
  is_active: boolean;
  display_order: number;
  items?: BlockItem[];
}

const DEAL_BLOCK_SLOTS = [
  { order: 0, label: 'Slot 1', aspect: '9:16', description: 'Visoki blok' },
  { order: 1, label: 'Slot 2', aspect: '1:1', description: 'Gornji desni kvadrat' },
  { order: 2, label: 'Slot 3', aspect: '1:1', description: 'Srednji desni kvadrat' },
  { order: 3, label: 'Slot 4', aspect: '16:9', description: 'Široki blok' },
  { order: 4, label: 'Slot 5', aspect: '1:1', description: 'Donji lijevi kvadrat' },
  { order: 5, label: 'Slot 6', aspect: '1:1', description: 'Donji desni kvadrat' },
] as const;

function sortByDisplayOrder<T extends { id: number; display_order: number }>(items: T[] = []): T[] {
  return [...items].sort((a, b) => {
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }
    return a.id - b.id;
  });
}

function reindexBlockItems(items: BlockItem[] = []): BlockItem[] {
  return items.map((item, index) => ({
    ...item,
    display_order: index,
  }));
}

function normalizeBlockItems(items: BlockItem[] = []): BlockItem[] {
  return reindexBlockItems(sortByDisplayOrder(items));
}

function normalizeBlockSets(blockSets: BlockSet[] = []): BlockSet[] {
  return sortByDisplayOrder(blockSets).map((blockSet) => ({
    ...blockSet,
    items: normalizeBlockItems(blockSet.items || []),
  }));
}

/** Single compact preview frame for ImageUpload — matches slot aspect, no duplicate wide banner. */
function blockSlotImagePreviewClass(aspect: string): string {
  if (aspect === '9:16') return 'w-28 max-h-[200px] aspect-[9/16] sm:w-32';
  if (aspect === '16:9') return 'w-[9rem] max-w-full aspect-video max-h-[5.25rem] sm:w-[10rem]';
  return 'w-28 max-h-[8rem] aspect-square sm:w-32';
}

interface SortableDealBlockCardProps {
  item: BlockItem;
  blockSetId: number;
  index: number;
  totalItems: number;
  isSaving: boolean;
  onMove: (blockSetId: number, itemId: number, direction: -1 | 1) => void;
  onToggleActive: (item: BlockItem) => void;
  onDelete: (blockSetId: number, itemId: number) => void;
  onImageChange: (blockSetId: number, itemId: number, url: string) => void;
  onFieldChange: (blockSetId: number, itemId: number, updates: Partial<BlockItem>) => void;
  onSave: (item: BlockItem) => void;
  crmClients: CrmClientOption[];
  campaigns: CampaignOption[];
  onCampaignsRefresh: () => Promise<void>;
}

function SortableDealBlockCard({
  item,
  blockSetId,
  index,
  totalItems,
  isSaving,
  onMove,
  onToggleActive,
  onDelete,
  onImageChange,
  onFieldChange,
  onSave,
  crmClients,
  campaigns,
  onCampaignsRefresh,
}: SortableDealBlockCardProps) {
  const { language } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const slot = DEAL_BLOCK_SLOTS[item.display_order] || {
    order: item.display_order,
    label: `Slot ${item.display_order + 1}`,
    aspect: 'Custom',
    description: 'Dodatni slot',
  };

  const previewFrame = blockSlotImagePreviewClass(String(slot.aspect));

  const toolbarBtn =
    'rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40';

  const reorderBtn =
    'flex h-8 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[2.25rem_auto_minmax(0,1fr)] items-start gap-x-3 gap-y-1 bg-white px-3 py-2.5 sm:gap-x-4 sm:px-4 ${
        isDragging ? 'relative z-10 ring-2 ring-inset ring-blue-400' : ''
      }`}
    >
      <div className="flex flex-col items-center gap-1 pt-1">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="h-9 w-9 shrink-0 cursor-grab touch-none rounded-md border border-slate-200 bg-slate-50 p-2 text-slate-600 hover:bg-slate-100 active:cursor-grabbing"
          title={language === 'bs' ? 'Prevucite za promjenu redoslijeda' : 'Drag to reorder'}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onMove(blockSetId, item.id, -1)}
          disabled={index === 0 || isSaving}
          className={reorderBtn}
          title={language === 'bs' ? 'Na gore u listi' : 'Move up'}
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onMove(blockSetId, item.id, 1)}
          disabled={index === totalItems - 1 || isSaving}
          className={reorderBtn}
          title={language === 'bs' ? 'Na dolje u listi' : 'Move down'}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="w-max max-w-full shrink-0 self-start">
        <ImageUpload
          compact
          compactActions="below"
          compactActionLabels={{
            replace: language === 'bs' ? 'Nova slika' : 'Replace image',
            remove: language === 'bs' ? 'Ukloni sliku' : 'Remove image',
          }}
          previewClassName={previewFrame}
          value={item.image_url || ''}
          onChange={(url) => onImageChange(blockSetId, item.id, Array.isArray(url) ? url[0] : url)}
          uploadBucket="sarayaconnect-hotspot"
          uploadFolder="block-items"
        />
      </div>

      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-1.5">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold leading-tight text-slate-800 sm:text-xs">
              {slot.label} · {slot.aspect}
            </div>
            <div className="text-[10px] text-slate-500 sm:text-[11px]">{slot.description}</div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => onSave(item)}
              disabled={isSaving}
              className={toolbarBtn}
              title={language === 'bs' ? 'Sačuvaj stavku' : 'Save item'}
            >
              <Save className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onToggleActive(item)}
              className={`${toolbarBtn} border-transparent ${
                item.is_active ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'text-slate-400 hover:text-slate-600'
              }`}
              title={language === 'bs' ? 'Vidljivost' : 'Visibility'}
            >
              {item.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => onDelete(blockSetId, item.id)}
              className={`${toolbarBtn} border-red-100 bg-red-50 text-red-600 hover:bg-red-100`}
              title={language === 'bs' ? 'Obriši stavku' : 'Delete item'}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2">
          <Input
            label={language === 'bs' ? 'Naslov (BS)' : 'Title (BS)'}
            value={item.title_ba || ''}
            onChange={(e) => onFieldChange(blockSetId, item.id, { title_ba: e.target.value, title: e.target.value })}
            placeholder={language === 'bs' ? 'Naslov na bosanskom' : 'Bosnian title'}
            className="text-sm"
          />
          <Textarea
            label={language === 'bs' ? 'Opis (BS)' : 'Description (BS)'}
            value={item.description_ba || ''}
            onChange={(e) =>
              onFieldChange(blockSetId, item.id, { description_ba: e.target.value, description: e.target.value })
            }
            placeholder={language === 'bs' ? 'Kratki opis (kao na portalu)' : 'Short description…'}
            rows={2}
            className="!min-h-[2.5rem] max-h-28 resize-y py-1.5 text-[13px] leading-snug"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input
            label={language === 'bs' ? 'CTA tekst' : 'CTA text'}
            value={item.cta_text || ''}
            onChange={(e) => onFieldChange(blockSetId, item.id, { cta_text: e.target.value })}
            placeholder="Pogledaj"
            className="text-sm"
          />
          <Input
            label={language === 'bs' ? 'CTA link' : 'CTA link'}
            value={item.cta_url || ''}
            onChange={(e) => onFieldChange(blockSetId, item.id, { cta_url: e.target.value })}
            placeholder="https://…"
            className="text-sm"
          />
        </div>

        <details className="mt-2 rounded-md border border-slate-200 bg-slate-50/60 px-2 py-1.5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="cursor-pointer select-none text-[11px] font-medium text-slate-700 hover:text-slate-900">
            {language === 'bs' ? 'Engleski prijevod (EN) — naslov, opis, CTA' : 'English — title, description, CTA'}
          </summary>
          <div className="mt-2 space-y-1.5 border-t border-slate-200/80 pt-2">
            <Input
              label={language === 'bs' ? 'Naslov (EN)' : 'Title (EN)'}
              value={item.title_en || ''}
              onChange={(e) => onFieldChange(blockSetId, item.id, { title_en: e.target.value })}
              placeholder="Title in English"
              className="text-sm"
            />
            <Textarea
              label={language === 'bs' ? 'Opis (EN)' : 'Description (EN)'}
              value={item.description_en || ''}
              onChange={(e) => onFieldChange(blockSetId, item.id, { description_en: e.target.value })}
              placeholder="Short description…"
              rows={2}
              className="!min-h-[2.5rem] max-h-24 resize-y py-1.5 text-[13px] leading-snug"
            />
            <Input
              label={language === 'bs' ? 'CTA tekst (EN)' : 'CTA text (EN)'}
              value={item.cta_text_en || ''}
              onChange={(e) => onFieldChange(blockSetId, item.id, { cta_text_en: e.target.value || null })}
              placeholder={language === 'bs' ? 'Npr. View' : 'e.g. View'}
              className="text-sm"
            />
          </div>
        </details>

        <HotspotAnalyticsFields
          placementType="block"
          placementLabel={`Blok · ${slot.label}`}
          clients={crmClients}
          campaigns={campaigns}
          onCampaignsRefresh={onCampaignsRefresh}
          destinationUrl={item.cta_url}
          value={item}
          onChange={(patch) => onFieldChange(blockSetId, item.id, patch)}
          dense
          collapsible
        />
      </div>
    </div>
  );
}

interface PlayAndWin extends HotspotAnalyticsValues {
  id: number;
  title: string | null;
  title_ba: string | null;
  title_en: string | null;
  subtitle: string | null;
  subtitle_ba: string | null;
  subtitle_en: string | null;
  image_url: string | null;
  cta_url: string | null;
  link: string | null;
  is_active: boolean;
  display_order: number;
}

interface SiteConfig {
  id: number;
  city_name: string | null;
  city_lat: number | null;
  city_lon: number | null;
  base_currency: string | null;
  target_currencies: string[] | null;
  primary_color: string | null;
  footer_icons: FooterIcon[] | null;
}

interface FooterIcon {
  id: string;
  name: string;
  url: string;
  icon: string;
}

interface EditorsPick extends HotspotAnalyticsValues {
  id: number;
  title_ba: string;
  title_en: string;
  description_ba: string | null;
  description_en: string | null;
  image_url: string | null;
  cta_url: string | null;
  badge: string | null;
  is_active: boolean;
  display_order: number;
}

interface DiscoveryPlace extends HotspotAnalyticsValues {
  id: number;
  name_ba: string;
  name_en: string;
  category_ba: string | null;
  category_en: string | null;
  description_ba: string | null;
  description_en: string | null;
  image_url: string | null;
  link: string | null;
  is_active: boolean;
  display_order: number;
}

const HOTSPOT_URL = process.env.NEXT_PUBLIC_HOTSPOT_URL || 'https://hs.saraya.solutions';

// =============================================================================
// COLLAPSIBLE ITEM COMPONENT
// =============================================================================

interface CollapsibleItemProps {
  title: string;
  subtitle?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  isActive?: boolean;
  onToggleActive?: () => void;
  children: React.ReactNode;
}

function CollapsibleItem({ 
  title, 
  subtitle, 
  isExpanded, 
  onToggle, 
  onDelete, 
  isActive,
  onToggleActive,
  children 
}: CollapsibleItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div 
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {title || 'Bez naziva'}
          </h4>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
        
        {isActive !== undefined && onToggleActive && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
            className={`p-2 rounded-lg transition-colors ${
              isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}
            title={isActive ? 'Aktivno' : 'Neaktivno'}
          >
            {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        
        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-100 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export function HotspotSectionPanel({ section }: { section: HotspotSectionId }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const toast = useToast();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // Data states
  const [heroVideos, setHeroVideos] = React.useState<HeroVideo[]>([]);
  const [heroBanners, setHeroBanners] = React.useState<HeroBanner[]>([]);
  const [newsCards, setNewsCards] = React.useState<NewsCard[]>([]);
  const [navChips, setNavChips] = React.useState<NavigationChip[]>([]);
  const [blockSets, setBlockSets] = React.useState<BlockSet[]>([]);
  const blockSetsRef = React.useRef(blockSets);
  blockSetsRef.current = blockSets;
  const blockAutosaveTimersRef = React.useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const [playAndWin, setPlayAndWin] = React.useState<PlayAndWin[]>([]);
  const [editorsPicks, setEditorsPicks] = React.useState<EditorsPick[]>([]);
  const [discoveryPlaces, setDiscoveryPlaces] = React.useState<DiscoveryPlace[]>([]);
  const [siteConfig, setSiteConfig] = React.useState<SiteConfig | null>(null);
  const [crmClients, setCrmClients] = React.useState<CrmClientOption[]>([]);
  const [campaigns, setCampaigns] = React.useState<CampaignOption[]>([]);

  // Expanded items
  const [expandedVideoId, setExpandedVideoId] = React.useState<number | null>(null);
  const [expandedBannerId, setExpandedBannerId] = React.useState<number | null>(null);
  const [expandedNewsId, setExpandedNewsId] = React.useState<number | null>(null);
  const [expandedChipId, setExpandedChipId] = React.useState<number | null>(null);
  const [expandedBlockSetId, setExpandedBlockSetId] = React.useState<number | null>(null);
  const [expandedPlayAndWinId, setExpandedPlayAndWinId] = React.useState<number | null>(null);
  const [expandedEditorsPickId, setExpandedEditorsPickId] = React.useState<number | null>(null);
  const [expandedDiscoveryId, setExpandedDiscoveryId] = React.useState<number | null>(null);

  const [deleteDialog, setDeleteDialog] = React.useState<{
    title: string;
    description: string;
    run: () => void;
  } | null>(null);

  const requestDelete = React.useCallback((title: string, description: string, run: () => void) => {
    setDeleteDialog({ title, description, run });
  }, []);

  // =============================================================================
  // DATA FETCHING
  // =============================================================================

  const refreshCampaigns = React.useCallback(async () => {
    try {
      const res = await fetch('/api/hotspot/campaigns', {
        credentials: 'include',
        cache: 'no-store',
      });
      const json = await res.json();
      if (json.success) setCampaigns(json.data || []);
    } catch {
      /* ignore */
    }
  }, []);

  /** Always bypass caches so the UI matches Supabase (same source as SarayaConnectHS). */
  const hotspotFetch = React.useCallback((input: string) => {
    return fetch(input, { credentials: 'include', cache: 'no-store' });
  }, []);

  const reloadBlockSetsFromServer = React.useCallback(async () => {
    try {
      const blocksRes = await hotspotFetch('/api/hotspot/block-sets');
      const blocksData = await blocksRes.json();
      if (blocksData.success) {
        setBlockSets(normalizeBlockSets(blocksData.data || []));
      }
    } catch {
      /* ignore */
    }
  }, [hotspotFetch]);

  const fetchAllData = React.useCallback(async (opts?: { mode?: 'hard' | 'soft'; preferOverlay?: boolean }) => {
    const hard = opts?.mode === 'hard' || readHotspotSessionCache() == null;
    const preferOverlay = opts?.preferOverlay === true;
    if (hard && !preferOverlay) {
      setIsLoading(true);
    }

    try {
      const [
        videosRes,
        bannersRes,
        newsRes,
        chipsRes,
        blocksRes,
        playAndWinRes,
        editorsPicksRes,
        discoveryRes,
        configRes,
        clientsRes,
        campaignsRes,
      ] = await Promise.all([
        hotspotFetch('/api/hotspot/hero-videos'),
        hotspotFetch('/api/hotspot/hero-banners'),
        hotspotFetch('/api/hotspot/news-cards'),
        hotspotFetch('/api/hotspot/navigation-chips'),
        hotspotFetch('/api/hotspot/block-sets'),
        hotspotFetch('/api/hotspot/play-and-win'),
        hotspotFetch('/api/hotspot/editors-picks'),
        hotspotFetch('/api/hotspot/discovery'),
        hotspotFetch('/api/hotspot/site-config'),
        hotspotFetch('/api/cms/crm/clients'),
        hotspotFetch('/api/hotspot/campaigns'),
      ]);

      const videosData = await videosRes.json();
      const bannersData = await bannersRes.json();
      const newsData = await newsRes.json();
      const chipsData = await chipsRes.json();
      const blocksData = await blocksRes.json();
      const playAndWinData = await playAndWinRes.json();
      const editorsPicksData = await editorsPicksRes.json();
      const discoveryData = await discoveryRes.json();
      const configData = await configRes.json();

      let crmClientsNext: CrmClientOption[] = [];
      if (clientsRes.ok) {
        try {
          const clientList = await clientsRes.json();
          if (Array.isArray(clientList)) {
            crmClientsNext = clientList.map((c: { id: number; name: string }) => ({
              id: c.id,
              name: c.name,
            }));
            setCrmClients(crmClientsNext);
          }
        } catch {
          /* ignore */
        }
      }

      const campaignsJson = await campaignsRes.json();
      if (campaignsJson.success) setCampaigns(campaignsJson.data || []);

      if (videosData.success) setHeroVideos(videosData.data || []);
      if (bannersData.success) setHeroBanners(bannersData.data || []);
      if (newsData.success) setNewsCards(newsData.data || []);
      if (chipsData.success) setNavChips(chipsData.data || []);
      const blockSetsNormalized = blocksData.success
        ? normalizeBlockSets(blocksData.data || [])
        : [];
      if (blocksData.success) setBlockSets(blockSetsNormalized);
      if (playAndWinData.success) setPlayAndWin(playAndWinData.data || []);
      if (editorsPicksData.success) setEditorsPicks(editorsPicksData.data || []);
      if (discoveryData.success) setDiscoveryPlaces(discoveryData.data || []);
      if (configData.success) setSiteConfig(configData.data);

      writeHotspotSessionCache({
        heroVideos: videosData.success ? videosData.data || [] : [],
        heroBanners: bannersData.success ? bannersData.data || [] : [],
        newsCards: newsData.success ? newsData.data || [] : [],
        navChips: chipsData.success ? chipsData.data || [] : [],
        blockSets: blockSetsNormalized,
        playAndWin: playAndWinData.success ? playAndWinData.data || [] : [],
        editorsPicks: editorsPicksData.success ? editorsPicksData.data || [] : [],
        discoveryPlaces: discoveryData.success ? discoveryData.data || [] : [],
        siteConfig: configData.success ? configData.data : null,
        crmClients: crmClientsNext,
        campaigns: campaignsJson.success ? campaignsJson.data || [] : [],
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Greška pri učitavanju podataka');
    } finally {
      setIsLoading(false);
    }
    // useToast() returns a new object reference each render; toast.error is stable (useCallback).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotspotFetch, toast.error]);

  /** Re-entering Hotspot from CRM etc. — drop in-memory snapshot so we match Supabase again. */
  const prevPathnameRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    const prev = prevPathnameRef.current;
    if (prev != null) {
      const wasOutsideHotspot = !prev.startsWith('/dashboard/hotspot');
      const isInsideHotspot = pathname.startsWith('/dashboard/hotspot');
      if (wasOutsideHotspot && isInsideHotspot) {
        clearHotspotSessionCache();
        void fetchAllData({ mode: 'hard' });
      }
    }
    prevPathnameRef.current = pathname;
  }, [pathname, fetchAllData]);

  React.useEffect(() => {
    const onRefreshRequest = () => {
      if (typeof window === 'undefined') return;
      window.dispatchEvent(new CustomEvent('saraya-hotspot-refresh-start'));
      clearHotspotSessionCache();
      void fetchAllData({ mode: 'hard', preferOverlay: true }).finally(() => {
        window.dispatchEvent(new CustomEvent('saraya-hotspot-refresh-end'));
      });
    };
    window.addEventListener('saraya-hotspot-refresh-request', onRefreshRequest);
    return () => window.removeEventListener('saraya-hotspot-refresh-request', onRefreshRequest);
  }, [fetchAllData]);

  React.useEffect(() => {
    const timers = blockAutosaveTimersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  React.useEffect(() => {
    const cached = readHotspotSessionCache();
    if (cached) {
      setHeroVideos(cached.heroVideos as HeroVideo[]);
      setHeroBanners(cached.heroBanners as HeroBanner[]);
      setNewsCards(cached.newsCards as NewsCard[]);
      setNavChips(cached.navChips as NavigationChip[]);
      setBlockSets(normalizeBlockSets(cached.blockSets as BlockSet[]));
      setPlayAndWin(cached.playAndWin as PlayAndWin[]);
      setEditorsPicks(cached.editorsPicks as EditorsPick[]);
      setDiscoveryPlaces(cached.discoveryPlaces as DiscoveryPlace[]);
      setSiteConfig(cached.siteConfig as SiteConfig | null);
      setCrmClients(cached.crmClients as CrmClientOption[]);
      setCampaigns(cached.campaigns as CampaignOption[]);
      setIsLoading(false);
      return;
    }
    void fetchAllData();
  }, [fetchAllData]);

  // =============================================================================
  // CRUD OPERATIONS - With Optimistic Updates
  // =============================================================================

  const saveItem = async (
    endpoint: string, 
    method: 'POST' | 'PUT' | 'DELETE',
    data?: object,
    id?: number,
    options?: { quiet?: boolean }
  ): Promise<{ success: boolean; data?: unknown }> => {
    const quiet = options?.quiet === true;
    if (!quiet) {
      setIsSaving(true);
    }

    try {
      const url = method === 'DELETE' && id ? `${endpoint}?id=${id}` : endpoint;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'DELETE' ? JSON.stringify(data) : undefined,
        credentials: 'include',
        cache: 'no-store',
      });

      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        data?: unknown;
        error?: string;
      };

      if (response.status === 401) {
        throw new Error(
          language === 'bs'
            ? 'Niste prijavljeni ili je sesija istekla. Osvježite stranicu i prijavite se ponovo.'
            : 'Not signed in or session expired. Refresh and sign in again.'
        );
      }

      if (result.success) {
        if (endpoint.startsWith('/api/hotspot')) {
          clearHotspotSessionCache();
        }
        if (!quiet) {
          if (method === 'DELETE') {
            toast.success(language === 'bs' ? 'Obrisano.' : 'Deleted.');
          } else {
            toast.success(language === 'bs' ? 'Sačuvano uspješno!' : 'Saved successfully!');
          }
        }
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || 'Greška pri spremanju');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : (language === 'bs' ? 'Greška pri spremanju' : 'Error saving');
      toast.error(message);
      return { success: false };
    } finally {
      if (!quiet) {
        setIsSaving(false);
      }
    }
  };

  // Hero Videos - Optimistic Updates
  const createHeroVideo = async () => {
    const tempId = Date.now();
    const newVideo: HeroVideo = {
      id: tempId,
      video_url: '',
      video_url_alt: null,
      poster_url: null,
      title_ba: 'Novi video',
      title_en: 'New video',
      subtitle_ba: null,
      subtitle_en: null,
      button_text_ba: null,
      button_text_en: null,
      button_link: null,
      is_active: false,
      display_order: heroVideos.length,
    };
    
    // Optimistic update
    setHeroVideos(prev => [...prev, newVideo]);
    setExpandedVideoId(tempId);
    
    const result = await saveItem('/api/hotspot/hero-videos', 'POST', {
      video_url: '',
      is_active: false,
      display_order: heroVideos.length,
    });
    
    if (result.success && result.data) {
      // Replace temp with real data
      setHeroVideos(prev => prev.map(v => v.id === tempId ? result.data as HeroVideo : v));
      setExpandedVideoId((result.data as HeroVideo).id);
    } else {
      // Rollback on failure
      setHeroVideos(prev => prev.filter(v => v.id !== tempId));
    }
  };

  const updateHeroVideo = async (video: HeroVideo) => {
    const result = await saveItem('/api/hotspot/hero-videos', 'PUT', video);
    if (result.success && result.data) {
      setHeroVideos((prev) => prev.map((v) => (v.id === video.id ? (result.data as HeroVideo) : v)));
    }
  };

  const deleteHeroVideo = async (id: number) => {
    const backup = heroVideos;
    setHeroVideos(prev => prev.filter(v => v.id !== id));
    
    const result = await saveItem('/api/hotspot/hero-videos', 'DELETE', undefined, id);
    if (!result.success) {
      setHeroVideos(backup);
    }
  };

  // Hero Banners - Optimistic Updates
  const createHeroBanner = async () => {
    const tempId = Date.now();
    const newBanner: HeroBanner = {
      id: tempId,
      title: 'Novi banner',
      title_ba: 'Novi banner',
      title_en: 'New banner',
      subtitle: null,
      subtitle_ba: null,
      subtitle_en: null,
      image_url: null,
      cta_text: null,
      button_text_ba: null,
      button_text_en: null,
      cta_url: null,
      is_active: false,
      display_order: heroBanners.length,
    };
    
    setHeroBanners(prev => [...prev, newBanner]);
    setExpandedBannerId(tempId);
    
    const result = await saveItem('/api/hotspot/hero-banners', 'POST', {
      title: 'Novi banner',
      is_active: false,
      display_order: heroBanners.length,
    });
    
    if (result.success && result.data) {
      setHeroBanners(prev => prev.map(b => b.id === tempId ? result.data as HeroBanner : b));
      setExpandedBannerId((result.data as HeroBanner).id);
    } else {
      setHeroBanners(prev => prev.filter(b => b.id !== tempId));
    }
  };

  const updateHeroBanner = async (banner: HeroBanner) => {
    const result = await saveItem('/api/hotspot/hero-banners', 'PUT', banner);
    if (result.success && result.data) {
      setHeroBanners((prev) => prev.map((b) => (b.id === banner.id ? (result.data as HeroBanner) : b)));
    }
  };

  const deleteHeroBanner = async (id: number) => {
    const backup = heroBanners;
    setHeroBanners(prev => prev.filter(b => b.id !== id));
    
    const result = await saveItem('/api/hotspot/hero-banners', 'DELETE', undefined, id);
    if (!result.success) {
      setHeroBanners(backup);
    }
  };

  // News Cards - Optimistic Updates
  const createNewsCard = async () => {
    const tempId = Date.now();
    const newCard: NewsCard = {
      id: tempId,
      title: 'Nova vijest', // For DB compatibility, synced from text
      text_ba: 'Nova vijest',
      text_en: 'New news',
      icon: null,
      image_url: null,
      cta_url: null,
      link: null,
      is_active: false,
      display_order: newsCards.length,
    };
    
    setNewsCards(prev => [...prev, newCard]);
    setExpandedNewsId(tempId);
    
    const result = await saveItem('/api/hotspot/news-cards', 'POST', {
      title: 'Nova vijest',
      text_ba: 'Nova vijest',
      text_en: 'New news',
      is_active: false,
      display_order: newsCards.length,
    });
    
    if (result.success && result.data) {
      setNewsCards(prev => prev.map(c => c.id === tempId ? result.data as NewsCard : c));
      setExpandedNewsId((result.data as NewsCard).id);
    } else {
      setNewsCards(prev => prev.filter(c => c.id !== tempId));
    }
  };

  const updateNewsCard = async (card: NewsCard) => {
    const result = await saveItem('/api/hotspot/news-cards', 'PUT', card);
    if (result.success && result.data) {
      setNewsCards((prev) => prev.map((c) => (c.id === card.id ? (result.data as NewsCard) : c)));
    }
  };

  const deleteNewsCard = async (id: number) => {
    const backup = newsCards;
    setNewsCards(prev => prev.filter(c => c.id !== id));
    
    const result = await saveItem('/api/hotspot/news-cards', 'DELETE', undefined, id);
    if (!result.success) {
      setNewsCards(backup);
    }
  };

  // Navigation Chips - Optimistic Updates
  const createNavChip = async () => {
    const tempId = Date.now();
    const newChip: NavigationChip = {
      id: tempId,
      label_ba: 'Novi chip',
      label_en: 'New chip',
      custom_label: 'Novi chip',
      custom_icon: 'Tag',
      icon: 'Tag',
      custom_url: null,
      link: null,
      is_active: false,
      display_order: navChips.length,
    };
    
    setNavChips(prev => [...prev, newChip]);
    setExpandedChipId(tempId);
    
    const result = await saveItem('/api/hotspot/navigation-chips', 'POST', {
      custom_label: 'Novi chip',
      custom_icon: 'Tag',
      is_active: false,
      display_order: navChips.length,
    });
    
    if (result.success && result.data) {
      setNavChips(prev => prev.map(c => c.id === tempId ? result.data as NavigationChip : c));
      setExpandedChipId((result.data as NavigationChip).id);
    } else {
      setNavChips(prev => prev.filter(c => c.id !== tempId));
    }
  };

  const updateNavChip = async (chip: NavigationChip) => {
    const result = await saveItem('/api/hotspot/navigation-chips', 'PUT', chip);
    if (result.success && result.data) {
      setNavChips((prev) => prev.map((c) => (c.id === chip.id ? (result.data as NavigationChip) : c)));
    }
  };

  const deleteNavChip = async (id: number) => {
    const backup = navChips;
    setNavChips(prev => prev.filter(c => c.id !== id));
    
    const result = await saveItem('/api/hotspot/navigation-chips', 'DELETE', undefined, id);
    if (!result.success) {
      setNavChips(backup);
    }
  };

  // Block Sets - Optimistic Updates
  const createBlockSet = async () => {
    const tempId = Date.now();
    const newBlockSet: BlockSet = {
      id: tempId,
      name: 'Novi blok set',
      is_active: false,
      display_order: blockSets.length,
      items: [],
    };
    
    setBlockSets(prev => [...prev, newBlockSet]);
    setExpandedBlockSetId(tempId);
    
    const result = await saveItem('/api/hotspot/block-sets', 'POST', {
      name: 'Novi blok set',
      is_active: false,
      display_order: blockSets.length,
    });
    
    if (result.success && result.data) {
      setBlockSets(prev => prev.map(bs => bs.id === tempId ? { ...result.data as BlockSet, items: [] } : bs));
      setExpandedBlockSetId((result.data as BlockSet).id);
    } else {
      setBlockSets(prev => prev.filter(bs => bs.id !== tempId));
    }
  };

  const updateBlockSet = async (blockSet: BlockSet) => {
    const result = await saveItem('/api/hotspot/block-sets', 'PUT', blockSet);
    if (result.success && result.data) {
      const updated = result.data as BlockSet;
      setBlockSets((prev) =>
        prev.map((bs) =>
          bs.id === blockSet.id ? { ...updated, items: bs.items } : bs
        )
      );
    }
  };

  const deleteBlockSet = async (id: number) => {
    const backup = blockSets;
    setBlockSets((prev) => prev.filter((bs) => bs.id !== id));

    const result = await saveItem('/api/hotspot/block-sets', 'DELETE', undefined, id);
    if (!result.success) {
      setBlockSets(backup);
      return;
    }
    await reloadBlockSetsFromServer();
  };

  // Play and Win - Optimistic Updates
  const createPlayAndWinItem = async () => {
    const tempId = Date.now();
    const newItem: PlayAndWin = {
      id: tempId,
      title: 'Play & Win',
      title_ba: 'Play & Win',
      title_en: 'Play & Win',
      subtitle: null,
      subtitle_ba: null,
      subtitle_en: null,
      image_url: null,
      cta_url: null,
      link: null,
      is_active: false,
      display_order: playAndWin.length,
    };
    
    setPlayAndWin(prev => [...prev, newItem]);
    setExpandedPlayAndWinId(tempId);
    
    const result = await saveItem('/api/hotspot/play-and-win', 'POST', {
      title: 'Play & Win',
      is_active: false,
      display_order: playAndWin.length,
    });
    
    if (result.success && result.data) {
      setPlayAndWin(prev => prev.map(i => i.id === tempId ? result.data as PlayAndWin : i));
      setExpandedPlayAndWinId((result.data as PlayAndWin).id);
    } else {
      setPlayAndWin(prev => prev.filter(i => i.id !== tempId));
    }
  };

  const updatePlayAndWinItem = async (item: PlayAndWin) => {
    const result = await saveItem('/api/hotspot/play-and-win', 'PUT', item);
    if (result.success && result.data) {
      setPlayAndWin((prev) => prev.map((i) => (i.id === item.id ? (result.data as PlayAndWin) : i)));
    }
  };

  const deletePlayAndWinItem = async (id: number) => {
    const backup = playAndWin;
    setPlayAndWin(prev => prev.filter(i => i.id !== id));
    
    const result = await saveItem('/api/hotspot/play-and-win', 'DELETE', undefined, id);
    if (!result.success) {
      setPlayAndWin(backup);
    }
  };

  // Editors Picks - Optimistic Updates
  const createEditorsPick = async () => {
    const tempId = Date.now();
    const newItem: EditorsPick = {
      id: tempId,
      title_ba: 'Novi izbor',
      title_en: 'New pick',
      description_ba: null,
      description_en: null,
      image_url: null,
      cta_url: null,
      badge: null,
      is_active: false,
      display_order: editorsPicks.length,
    };
    
    setEditorsPicks(prev => [...prev, newItem]);
    setExpandedEditorsPickId(tempId);
    
    const result = await saveItem('/api/hotspot/editors-picks', 'POST', {
      title_ba: 'Novi izbor',
      title_en: 'New pick',
      is_active: false,
      display_order: editorsPicks.length,
    });
    
    if (result.success && result.data) {
      setEditorsPicks(prev => prev.map(i => i.id === tempId ? result.data as EditorsPick : i));
      setExpandedEditorsPickId((result.data as EditorsPick).id);
    } else {
      setEditorsPicks(prev => prev.filter(i => i.id !== tempId));
    }
  };

  const updateEditorsPick = async (item: EditorsPick) => {
    const result = await saveItem('/api/hotspot/editors-picks', 'PUT', item);
    if (result.success && result.data) {
      setEditorsPicks((prev) => prev.map((i) => (i.id === item.id ? (result.data as EditorsPick) : i)));
    }
  };

  const deleteEditorsPick = async (id: number) => {
    const backup = editorsPicks;
    setEditorsPicks(prev => prev.filter(i => i.id !== id));
    
    const result = await saveItem('/api/hotspot/editors-picks', 'DELETE', undefined, id);
    if (!result.success) {
      setEditorsPicks(backup);
    }
  };

  // Discovery Places - Optimistic Updates
  const createDiscoveryPlace = async () => {
    const tempId = Date.now();
    const newItem: DiscoveryPlace = {
      id: tempId,
      name_ba: 'Novo mjesto',
      name_en: 'New place',
      category_ba: null,
      category_en: null,
      description_ba: null,
      description_en: null,
      image_url: null,
      link: null,
      is_active: false,
      display_order: discoveryPlaces.length,
    };
    
    setDiscoveryPlaces(prev => [...prev, newItem]);
    setExpandedDiscoveryId(tempId);
    
    const result = await saveItem('/api/hotspot/discovery', 'POST', {
      name_ba: 'Novo mjesto',
      name_en: 'New place',
      is_active: false,
      display_order: discoveryPlaces.length,
    });
    
    if (result.success && result.data) {
      setDiscoveryPlaces(prev => prev.map(i => i.id === tempId ? result.data as DiscoveryPlace : i));
      setExpandedDiscoveryId((result.data as DiscoveryPlace).id);
    } else {
      setDiscoveryPlaces(prev => prev.filter(i => i.id !== tempId));
    }
  };

  const updateDiscoveryPlace = async (item: DiscoveryPlace) => {
    const result = await saveItem('/api/hotspot/discovery', 'PUT', item);
    if (result.success && result.data) {
      setDiscoveryPlaces((prev) => prev.map((i) => (i.id === item.id ? (result.data as DiscoveryPlace) : i)));
    }
  };

  const deleteDiscoveryPlace = async (id: number) => {
    const backup = discoveryPlaces;
    setDiscoveryPlaces(prev => prev.filter(i => i.id !== id));
    
    const result = await saveItem('/api/hotspot/discovery', 'DELETE', undefined, id);
    if (!result.success) {
      setDiscoveryPlaces(backup);
    }
  };

  const updateSiteConfigData = async (config: Partial<SiteConfig>) => {
    await saveItem('/api/hotspot/site-config', 'PUT', config);
  };

  // =============================================================================
  // RENDER FUNCTIONS
  // =============================================================================

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pregled Hotspot Portala</h2>
          <p className="text-gray-500 mt-1">Upravljanje sadržajem za {HOTSPOT_URL}</p>
        </div>
        <a
          href={HOTSPOT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Pogledaj portal
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{heroVideos.length}</p>
              <p className="text-sm text-gray-500">Hero Videoi</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{heroBanners.length}</p>
              <p className="text-sm text-gray-500">Hero Banneri</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <Newspaper className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{newsCards.length}</p>
              <p className="text-sm text-gray-500">News Kartice</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-orange-100">
              <Navigation className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{navChips.length}</p>
              <p className="text-sm text-gray-500">Nav Chipovi</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-pink-100">
              <Sparkles className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{editorsPicks.length}</p>
              <p className="text-sm text-gray-500">Pametno odabrano</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-teal-100">
              <MapPin className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{discoveryPlaces.length}</p>
              <p className="text-sm text-gray-500">Explore Sarajevo</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Brze akcije</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href={hotspotPathForSegment('hero-video')}
            className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <Video className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Uredi videoe</span>
          </Link>
          <Link
            href={hotspotPathForSegment('hero-banneri')}
            className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <ImageIcon className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Uredi bannere</span>
          </Link>
          <Link
            href={hotspotPathForSegment('news-carousel')}
            className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <Newspaper className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Uredi vijesti</span>
          </Link>
          <Link
            href={hotspotPathForSegment('postavke')}
            className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <Settings className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">Postavke</span>
          </Link>
        </div>
      </Card>
    </div>
  );

  const renderHeroVideos = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Hero Videoi</h2>
          <p className="text-gray-500 mt-1">Upravljanje videima na početnoj stranici</p>
        </div>
        <Button onClick={createHeroVideo} disabled={isSaving}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj video
        </Button>
      </div>

      <div className="space-y-3">
        {heroVideos.map((video) => (
          <CollapsibleItem
            key={video.id}
            title={video.title_en || video.title_ba || `Video #${video.id}`}
            subtitle={video.video_url || 'Nema URL-a'}
            isExpanded={expandedVideoId === video.id}
            onToggle={() => setExpandedVideoId(expandedVideoId === video.id ? null : video.id)}
            onDelete={() =>
              requestDelete(
                'Obrisati hero video?',
                'Video će biti uklonjen s portala.',
                () => {
                  void deleteHeroVideo(video.id);
                }
              )
            }
            isActive={video.is_active}
            onToggleActive={() => updateHeroVideo({ ...video, is_active: !video.is_active })}
          >
            {/* Video Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <VideoUpload
                label="Video File"
                value={video.video_url}
                onChange={(url) => setHeroVideos(prev =>
                  prev.map(v => v.id === video.id ? { ...v, video_url: url } : v)
                )}
                uploadBucket="sarayaconnect-hotspot"
                uploadFolder="hero-videos"
              />
              <ImageUpload
                label="Poster Image (Thumbnail)"
                value={video.poster_url}
                onChange={(url) => setHeroVideos(prev =>
                  prev.map(v => v.id === video.id ? { ...v, poster_url: typeof url === 'string' ? url : url[0] || '' } : v)
                )}
                uploadBucket="sarayaconnect-hotspot"
                uploadFolder="hero-videos"
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="Naslov (BA)"
                value={video.title_ba || ''}
                onChange={(e) => setHeroVideos(prev => 
                  prev.map(v => v.id === video.id ? { ...v, title_ba: e.target.value } : v)
                )}
              />
              <Input
                label="Naslov (EN)"
                value={video.title_en || ''}
                onChange={(e) => setHeroVideos(prev => 
                  prev.map(v => v.id === video.id ? { ...v, title_en: e.target.value } : v)
                )}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Input
                label="Button tekst (BA)"
                value={video.button_text_ba || ''}
                onChange={(e) => setHeroVideos(prev => 
                  prev.map(v => v.id === video.id ? { ...v, button_text_ba: e.target.value } : v)
                )}
              />
              <Input
                label="Button tekst (EN)"
                value={video.button_text_en || ''}
                onChange={(e) => setHeroVideos(prev => 
                  prev.map(v => v.id === video.id ? { ...v, button_text_en: e.target.value } : v)
                )}
              />
              <Input
                label="Button link"
                value={video.button_link || ''}
                onChange={(e) => setHeroVideos(prev => 
                  prev.map(v => v.id === video.id ? { ...v, button_link: e.target.value } : v)
                )}
              />
            </div>
            <HotspotAnalyticsFields
              placementType="hero_video"
              placementLabel="Hero video"
              clients={crmClients}
              campaigns={campaigns}
              onCampaignsRefresh={refreshCampaigns}
              destinationUrl={video.button_link}
              value={video}
              onChange={(patch) =>
                setHeroVideos((prev) =>
                  prev.map((v) => (v.id === video.id ? { ...v, ...patch } : v))
                )
              }
            />
            <div className="flex justify-end">
              <Button onClick={() => updateHeroVideo(video)} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Spremi
              </Button>
            </div>
          </CollapsibleItem>
        ))}
        {heroVideos.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nema video zapisa</p>
            <Button onClick={createHeroVideo} variant="secondary" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj prvi video
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderHeroBanners = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Hero Banneri</h2>
          <p className="text-gray-500 mt-1">Upravljanje bannerima na početnoj stranici</p>
        </div>
        <Button onClick={createHeroBanner} disabled={isSaving}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj banner
        </Button>
      </div>

      <div className="space-y-3">
        {heroBanners.map((banner) => (
          <CollapsibleItem
            key={banner.id}
            title={banner.title_en || banner.title_ba || banner.title || `Banner #${banner.id}`}
            subtitle={banner.cta_url || 'Nema linka'}
            isExpanded={expandedBannerId === banner.id}
            onToggle={() => setExpandedBannerId(expandedBannerId === banner.id ? null : banner.id)}
            onDelete={() =>
              requestDelete(
                'Obrisati hero banner?',
                'Banner će biti uklonjen s portala.',
                () => {
                  void deleteHeroBanner(banner.id);
                }
              )
            }
            isActive={banner.is_active}
            onToggleActive={() => updateHeroBanner({ ...banner, is_active: !banner.is_active })}
          >
            <ImageUpload
              label="Slika bannera"
              value={banner.image_url || ''}
              onChange={(url) => setHeroBanners(prev =>
                prev.map(b => b.id === banner.id ? { ...b, image_url: Array.isArray(url) ? url[0] : url } : b)
              )}
              uploadBucket="sarayaconnect-hotspot"
              uploadFolder="hero-banners"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="Naslov (BA)"
                value={banner.title_ba || ''}
                onChange={(e) => setHeroBanners(prev => 
                  prev.map(b => b.id === banner.id ? { ...b, title_ba: e.target.value } : b)
                )}
              />
              <Input
                label="Naslov (EN)"
                value={banner.title_en || ''}
                onChange={(e) => setHeroBanners(prev => 
                  prev.map(b => b.id === banner.id ? { ...b, title_en: e.target.value } : b)
                )}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="Podnaslov (BA)"
                value={banner.subtitle_ba || ''}
                onChange={(e) => setHeroBanners(prev => 
                  prev.map(b => b.id === banner.id ? { ...b, subtitle_ba: e.target.value } : b)
                )}
              />
              <Input
                label="Podnaslov (EN)"
                value={banner.subtitle_en || ''}
                onChange={(e) => setHeroBanners(prev => 
                  prev.map(b => b.id === banner.id ? { ...b, subtitle_en: e.target.value } : b)
                )}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Input
                label="Button tekst (BA)"
                value={banner.button_text_ba || ''}
                onChange={(e) => setHeroBanners(prev => 
                  prev.map(b => b.id === banner.id ? { ...b, button_text_ba: e.target.value } : b)
                )}
              />
              <Input
                label="Button tekst (EN)"
                value={banner.button_text_en || ''}
                onChange={(e) => setHeroBanners(prev => 
                  prev.map(b => b.id === banner.id ? { ...b, button_text_en: e.target.value } : b)
                )}
              />
              <Input
                label="CTA URL"
                value={banner.cta_url || ''}
                onChange={(e) => setHeroBanners(prev => 
                  prev.map(b => b.id === banner.id ? { ...b, cta_url: e.target.value } : b)
                )}
              />
            </div>
            <HotspotAnalyticsFields
              placementType="hero_banner"
              placementLabel="Hero banner"
              clients={crmClients}
              campaigns={campaigns}
              onCampaignsRefresh={refreshCampaigns}
              destinationUrl={banner.cta_url}
              value={banner}
              onChange={(patch) =>
                setHeroBanners((prev) =>
                  prev.map((b) => (b.id === banner.id ? { ...b, ...patch } : b))
                )
              }
            />
            <div className="flex justify-end">
              <Button onClick={() => updateHeroBanner(banner)} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Spremi
              </Button>
            </div>
          </CollapsibleItem>
        ))}
        {heroBanners.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nema bannera</p>
            <Button onClick={createHeroBanner} variant="secondary" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj prvi banner
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderNewsCards = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">News Carousel</h2>
          <p className="text-gray-500 mt-1">Upravljanje karticama u news carousel-u</p>
        </div>
        <Button onClick={createNewsCard} disabled={isSaving}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj karticu
        </Button>
      </div>

      <div className="space-y-3">
        {newsCards.map((card) => (
          <CollapsibleItem
            key={card.id}
            title={card.text_en || card.text_ba || `Kartica #${card.id}`}
            subtitle={card.cta_url || card.link || 'Nema linka'}
            isExpanded={expandedNewsId === card.id}
            onToggle={() => setExpandedNewsId(expandedNewsId === card.id ? null : card.id)}
            onDelete={() =>
              requestDelete(
                'Obrisati karticu vijesti?',
                'Kartica će biti uklonjena s portala.',
                () => {
                  void deleteNewsCard(card.id);
                }
              )
            }
            isActive={card.is_active}
            onToggleActive={() => updateNewsCard({ ...card, is_active: !card.is_active })}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ImageUpload
                label={language === 'bs' ? 'Slika kartice' : 'Card Image'}
                value={card.image_url || ''}
                onChange={(url) => setNewsCards(prev =>
                  prev.map(c => c.id === card.id ? { ...c, image_url: Array.isArray(url) ? url[0] : url } : c)
                )}
                uploadBucket="sarayaconnect-hotspot"
                uploadFolder="news-cards"
              />
              <IconPicker
                label={language === 'bs' ? 'Ikona kartice' : 'Card Icon'}
                value={card.icon || ''}
                onChange={(icon) => setNewsCards(prev => 
                  prev.map(c => c.id === card.id ? { ...c, icon } : c)
                )}
                allowImage={false}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Textarea
                label="Tekst (BA)"
                value={card.text_ba || ''}
                onChange={(e) => setNewsCards(prev => 
                  prev.map(c => c.id === card.id ? { 
                    ...c, 
                    text_ba: e.target.value,
                    title: c.text_en || e.target.value || '' // Sync title for DB compatibility
                  } : c)
                )}
                rows={2}
                placeholder={language === 'bs' ? 'Tekst na bosanskom...' : 'Bosnian text...'}
              />
              <Textarea
                label="Tekst (EN)"
                value={card.text_en || ''}
                onChange={(e) => setNewsCards(prev => 
                  prev.map(c => c.id === card.id ? { 
                    ...c, 
                    text_en: e.target.value,
                    title: e.target.value || c.text_ba || '' // Sync title for DB compatibility
                  } : c)
                )}
                rows={2}
                placeholder={language === 'bs' ? 'Tekst na engleskom...' : 'English text...'}
              />
            </div>
            <Input
              label="Link"
              value={card.cta_url || card.link || ''}
              onChange={(e) => setNewsCards(prev => 
                prev.map(c => c.id === card.id ? { ...c, cta_url: e.target.value, link: e.target.value } : c)
              )}
              placeholder="https://..."
            />
            <HotspotAnalyticsFields
              placementType="article_card"
              placementLabel="News carousel kartica"
              clients={crmClients}
              campaigns={campaigns}
              onCampaignsRefresh={refreshCampaigns}
              destinationUrl={card.cta_url || card.link}
              value={card}
              onChange={(patch) =>
                setNewsCards((prev) =>
                  prev.map((c) => (c.id === card.id ? { ...c, ...patch } : c))
                )
              }
            />
            <div className="flex justify-end">
              <Button onClick={() => updateNewsCard(card)} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {language === 'bs' ? 'Spremi' : 'Save'}
              </Button>
            </div>
          </CollapsibleItem>
        ))}
        {newsCards.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nema kartica</p>
            <Button onClick={createNewsCard} variant="secondary" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj prvu karticu
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderNavChips = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Navigacijski Chipovi</h2>
          <p className="text-gray-500 mt-1">Quick navigation chipovi ispod hero sekcije</p>
        </div>
        <Button onClick={createNavChip} disabled={isSaving}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj chip
        </Button>
      </div>

      <div className="space-y-3">
        {navChips.map((chip) => (
          <CollapsibleItem
            key={chip.id}
            title={chip.label_en || chip.label_ba || chip.custom_label || `Chip #${chip.id}`}
            subtitle={chip.custom_url || chip.link || 'Nema linka'}
            isExpanded={expandedChipId === chip.id}
            onToggle={() => setExpandedChipId(expandedChipId === chip.id ? null : chip.id)}
            onDelete={() =>
              requestDelete(
                'Obrisati navigacijski chip?',
                'Chip će biti uklonjen s portala.',
                () => {
                  void deleteNavChip(chip.id);
                }
              )
            }
            isActive={chip.is_active}
            onToggleActive={() => updateNavChip({ ...chip, is_active: !chip.is_active })}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="Label (BA)"
                value={chip.label_ba || chip.custom_label || ''}
                onChange={(e) => setNavChips(prev => 
                  prev.map(c => c.id === chip.id ? { ...c, label_ba: e.target.value, custom_label: e.target.value } : c)
                )}
              />
              <Input
                label="Label (EN)"
                value={chip.label_en || ''}
                onChange={(e) => setNavChips(prev => 
                  prev.map(c => c.id === chip.id ? { ...c, label_en: e.target.value } : c)
                )}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <IconPicker
                label="Ikona"
                value={chip.icon || chip.custom_icon || ''}
                onChange={(icon) => setNavChips(prev => 
                  prev.map(c => c.id === chip.id ? { ...c, icon, custom_icon: icon } : c)
                )}
                allowImage={true}
              />
              <Input
                label="Link"
                value={chip.custom_url || chip.link || ''}
                onChange={(e) => setNavChips(prev => 
                  prev.map(c => c.id === chip.id ? { ...c, custom_url: e.target.value, link: e.target.value } : c)
                )}
              />
            </div>
            <HotspotAnalyticsFields
              placementType="quick_access"
              placementLabel="Brzi pristup (chip)"
              clients={crmClients}
              campaigns={campaigns}
              onCampaignsRefresh={refreshCampaigns}
              destinationUrl={chip.custom_url || chip.link}
              value={chip}
              onChange={(patch) =>
                setNavChips((prev) =>
                  prev.map((c) => (c.id === chip.id ? { ...c, ...patch } : c))
                )
              }
            />
            <div className="flex justify-end">
              <Button onClick={() => updateNavChip(chip)} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Spremi
              </Button>
            </div>
          </CollapsibleItem>
        ))}
        {navChips.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Navigation className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nema chipova</p>
            <Button onClick={createNavChip} variant="secondary" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj prvi chip
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderBlocks = () => {
    const persistBlockItemOrder = async (blockSetId: number, items: BlockItem[]) => {
      const normalizedItems = normalizeBlockItems(items).filter((item) => item.id > 0);

      setIsSaving(true);

      try {
        const response = await fetch('/api/hotspot/block-items/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          cache: 'no-store',
          body: JSON.stringify({
            blockSetId,
            itemIds: normalizedItems.map((item) => item.id),
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Greška pri promjeni redoslijeda');
        }

        if (Array.isArray(result.data)) {
          setBlockSets((prev) =>
            prev.map((bs) =>
              bs.id === blockSetId
                ? { ...bs, items: normalizeBlockItems(result.data as BlockItem[]) }
                : bs
            )
          );
        }

        toast.success(language === 'bs' ? 'Redoslijed blokova je sačuvan.' : 'Block order saved.');
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Greška pri promjeni redoslijeda';
        toast.error(message);
        await fetchAllData();
        return false;
      } finally {
        setIsSaving(false);
      }
    };

    const moveBlockItem = async (blockSetId: number, itemId: number, direction: -1 | 1) => {
      const currentSet = blockSets.find((bs) => bs.id === blockSetId);
      const orderedItems = normalizeBlockItems(currentSet?.items || []);
      const currentIndex = orderedItems.findIndex((item) => item.id === itemId);
      const targetIndex = currentIndex + direction;

      if (currentIndex === -1 || targetIndex < 0 || targetIndex >= orderedItems.length) {
        return;
      }

      const reorderedItems = [...orderedItems];
      const [movedItem] = reorderedItems.splice(currentIndex, 1);
      reorderedItems.splice(targetIndex, 0, movedItem);

      const normalizedItems = reindexBlockItems(reorderedItems);

      setBlockSets((prev) =>
        prev.map((bs) => (bs.id === blockSetId ? { ...bs, items: normalizedItems } : bs))
      );

      await persistBlockItemOrder(blockSetId, normalizedItems);
    };

    const handleBlockDragEnd = async (blockSetId: number, event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const currentSet = blockSets.find((bs) => bs.id === blockSetId);
      const orderedItems = normalizeBlockItems(currentSet?.items || []);
      const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
      const newIndex = orderedItems.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reorderedItems = reindexBlockItems(arrayMove(orderedItems, oldIndex, newIndex));

      setBlockSets((prev) =>
        prev.map((bs) => (bs.id === blockSetId ? { ...bs, items: reorderedItems } : bs))
      );

      await persistBlockItemOrder(blockSetId, reorderedItems);
    };

    // Add a new block item to a set (optimistic)
    const addBlockItem = async (blockSetId: number) => {
      const currentSet = blockSets.find(bs => bs.id === blockSetId);
      const currentItems = normalizeBlockItems(currentSet?.items || []);
      
      if (currentItems.length >= 6) {
        toast.error('Maksimalno 6 stavki po blok setu!');
        return;
      }
      
      const tempId = -Date.now();
      const newItem: BlockItem = {
        id: tempId,
        block_set_id: blockSetId,
        title: 'Nova stavka',
        title_ba: 'Nova stavka',
        title_en: 'New item',
        description: '',
        description_ba: '',
        description_en: '',
        image_url: '',
        cta_text: '',
        cta_text_en: null,
        cta_url: '',
        is_active: true,
        display_order: currentItems.length,
      };
      
      // Optimistic update
      setBlockSets(prev => prev.map(bs => {
        if (bs.id === blockSetId) {
          return { ...bs, items: reindexBlockItems([...(bs.items || []), newItem]) };
        }
        return bs;
      }));
      
      const result = await saveItem('/api/hotspot/block-items', 'POST', {
        block_set_id: blockSetId,
        title: 'Nova stavka',
        is_active: true,
        display_order: currentItems.length,
      });
      
      if (result.success && result.data) {
        // Replace temp item with real one
        setBlockSets(prev => prev.map(bs => {
          if (bs.id === blockSetId && bs.items) {
            return {
              ...bs,
              items: reindexBlockItems(
                bs.items.map(item => item.id === tempId ? (result.data as BlockItem) : item)
              )
            };
          }
          return bs;
        }));
      } else {
        // Rollback on failure
        setBlockSets(prev => prev.map(bs => {
          if (bs.id === blockSetId && bs.items) {
            return { ...bs, items: reindexBlockItems(bs.items.filter(item => item.id !== tempId)) };
          }
          return bs;
        }));
      }
    };
    
    const scheduleBlockItemAutosave = (itemId: number) => {
      const timers = blockAutosaveTimersRef.current;
      const prev = timers.get(itemId);
      if (prev) clearTimeout(prev);
      timers.set(
        itemId,
        setTimeout(() => {
          timers.delete(itemId);
          const item = blockSetsRef.current.flatMap((bs) => bs.items ?? []).find((i) => i.id === itemId);
          if (!item || item.id < 0) return;
          void (async () => {
            const result = await saveItem('/api/hotspot/block-items', 'PUT', item, undefined, { quiet: true });
            if (result.success && result.data) {
              const saved = result.data as BlockItem;
              setBlockSets((prev) =>
                prev.map((bs) => {
                  if (bs.id !== saved.block_set_id || !bs.items) return bs;
                  return { ...bs, items: bs.items.map((it) => (it.id === saved.id ? saved : it)) };
                })
              );
            }
          })();
        }, 1200)
      );
    };

    // Update a block item (state already updated locally via updateLocalBlockItem)
    const updateBlockItem = async (item: BlockItem, opts?: { quiet?: boolean }) => {
      const result = await saveItem('/api/hotspot/block-items', 'PUT', item, undefined, opts);
      if (result.success && result.data) {
        const saved = result.data as BlockItem;
        setBlockSets((prev) =>
          prev.map((bs) => {
            if (bs.id !== item.block_set_id || !bs.items) return bs;
            return {
              ...bs,
              items: bs.items.map((it) => (it.id === item.id ? saved : it)),
            };
          })
        );
      }
    };
    
    // Delete a block item (optimistic)
    const deleteBlockItem = async (blockSetId: number, id: number) => {
      const pending = blockAutosaveTimersRef.current.get(id);
      if (pending) {
        clearTimeout(pending);
        blockAutosaveTimersRef.current.delete(id);
      }
      // Store for rollback
      const originalItems = normalizeBlockItems(blockSets.find(bs => bs.id === blockSetId)?.items || []);
      
      // Optimistic delete
      setBlockSets(prev => prev.map(bs => {
        if (bs.id === blockSetId && bs.items) {
          return { ...bs, items: reindexBlockItems(bs.items.filter(item => item.id !== id)) };
        }
        return bs;
      }));
      
      const result = await saveItem('/api/hotspot/block-items', 'DELETE', undefined, id);
      
      if (!result.success) {
        // Rollback on failure
        setBlockSets(prev => prev.map(bs => {
          if (bs.id === blockSetId) {
            return { ...bs, items: originalItems };
          }
          return bs;
        }));
        return;
      }

      const remainingItems = reindexBlockItems(
        (blockSets.find((bs) => bs.id === blockSetId)?.items || []).filter((item) => item.id !== id)
      );
      await persistBlockItemOrder(blockSetId, remainingItems);
    };
    
    // Update item in local state
    const updateLocalBlockItem = (blockSetId: number, itemId: number, updates: Partial<BlockItem>) => {
      setBlockSets(prev => prev.map(bs => {
        if (bs.id === blockSetId && bs.items) {
          return {
            ...bs,
            items: bs.items.map(item => 
              item.id === itemId ? { ...item, ...updates } : item
            )
          };
        }
        return bs;
      }));
    };
    
    return (
      <div className="w-full space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full max-w-4xl space-y-2 lg:max-w-none lg:flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {language === 'bs' ? 'Blokovi' : 'Blocks'}
            </h2>
            <p className="text-sm text-gray-600">
              {language === 'bs'
                ? 'Svaki blok set može imati do šest stavki. Na portalu se stavke prikazuju u fiksnim formatima (9:16, 1:1, 16:9, …). Redoslijed koji odredite u ovom dijelu CMS-a isti je kao redoslijed na portalu — prevucite cijele redove ili koristite strelice.'
                : 'Each block set holds up to six items. On the portal they map to fixed aspect slots (9:16, 1:1, 16:9, …). The order here is the layout order; drag rows or use the arrows.'}
            </p>
            <p className="text-xs text-gray-500">
              {language === 'bs'
                ? 'Nakon kratke stanke promjene u tekstu automatski se šalju na poslužitelj. Dugme „Sačuvaj stavku” odmah ih šalje i prikazuje potvrdu o uspješnom čuvanju.'
                : 'Text changes auto-save after a short pause; “Save item” saves immediately with a confirmation toast.'}
            </p>
          </div>
          <Button onClick={createBlockSet} disabled={isSaving} className="shrink-0 self-start sm:self-auto">
            <Plus className="w-4 h-4 mr-2" />
            Dodaj blok set
          </Button>
        </div>

        {blockSets.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center">
            <Grid3X3 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="text-slate-600">Nema blok setova</p>
            <Button onClick={createBlockSet} variant="secondary" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Dodaj prvi blok set
            </Button>
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          {normalizeBlockSets(blockSets).map((blockSet) => (
            <div key={blockSet.id} className="border-b border-slate-200 last:border-b-0">
              <div className="flex flex-wrap items-center gap-2 bg-slate-50/95 px-3 py-2.5 sm:gap-3 sm:px-4">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedBlockSetId(expandedBlockSetId === blockSet.id ? null : blockSet.id)}
                    className="shrink-0 rounded p-1 text-slate-600 hover:bg-slate-200/80"
                    aria-expanded={expandedBlockSetId === blockSet.id}
                  >
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${expandedBlockSetId === blockSet.id ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <Input
                      value={blockSet.name || ''}
                      onChange={(e) =>
                        setBlockSets((prev) =>
                          prev.map((bs) => (bs.id === blockSet.id ? { ...bs, name: e.target.value } : bs))
                        )
                      }
                      placeholder="Naziv blok seta"
                      className="font-medium"
                    />
                  </div>
                  <span className="shrink-0 text-xs text-slate-500 sm:text-sm">
                    {blockSet.items?.length || 0}/6 stavki
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => updateBlockSet({ ...blockSet, is_active: !blockSet.is_active })}
                    className={`rounded-md p-2 transition-colors ${
                      blockSet.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200/80 text-slate-500'
                    }`}
                    title={blockSet.is_active ? 'Aktivno' : 'Neaktivno'}
                  >
                    {blockSet.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <Button onClick={() => updateBlockSet(blockSet)} disabled={isSaving} size="sm">
                    <Save className="h-4 w-4" />
                  </Button>
                  <button
                    type="button"
                    onClick={() =>
                      requestDelete(
                        'Obrisati blok set?',
                        'Sve stavke unutar ovog seta bit će trajno uklonjene.',
                        () => {
                          void deleteBlockSet(blockSet.id);
                        }
                      )
                    }
                    className="rounded-md bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {expandedBlockSetId === blockSet.id && (
                <div className="border-t border-slate-100 bg-white">
                  <p className="border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[11px] leading-snug text-slate-600 sm:px-4">
                    {language === 'bs'
                      ? 'Prevucite red za redoslijed; promjena se odmah bilježi na poslužitelju (reorder API).'
                      : 'Drag a row to change order; the reorder API saves immediately.'}
                  </p>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleBlockDragEnd(blockSet.id, event)}
                  >
                    <SortableContext
                      items={normalizeBlockItems(blockSet.items || []).map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="divide-y divide-slate-200">
                        {normalizeBlockItems(blockSet.items || []).map((item, index, items) => (
                          <SortableDealBlockCard
                            key={item.id}
                            item={item}
                            blockSetId={blockSet.id}
                            index={index}
                            totalItems={items.length}
                            isSaving={isSaving}
                            onMove={moveBlockItem}
                            onToggleActive={(currentItem) => {
                              const tid = blockAutosaveTimersRef.current.get(currentItem.id);
                              if (tid) {
                                clearTimeout(tid);
                                blockAutosaveTimersRef.current.delete(currentItem.id);
                              }
                              updateLocalBlockItem(blockSet.id, currentItem.id, { is_active: !currentItem.is_active });
                              void updateBlockItem({ ...currentItem, is_active: !currentItem.is_active });
                            }}
                            onDelete={(bsId, itemId) =>
                              requestDelete(
                                'Obrisati stavku bloka?',
                                'Kartica će biti trajno uklonjena iz ovog seta.',
                                () => {
                                  void deleteBlockItem(bsId, itemId);
                                }
                              )
                            }
                            onImageChange={(currentBlockSetId, itemId, url) => {
                              updateLocalBlockItem(currentBlockSetId, itemId, { image_url: url });
                              scheduleBlockItemAutosave(itemId);
                            }}
                            onFieldChange={(bsId, itemId, updates) => {
                              updateLocalBlockItem(bsId, itemId, updates);
                              scheduleBlockItemAutosave(itemId);
                            }}
                            onSave={(currentItem) => {
                              const tid = blockAutosaveTimersRef.current.get(currentItem.id);
                              if (tid) {
                                clearTimeout(tid);
                                blockAutosaveTimersRef.current.delete(currentItem.id);
                              }
                              const latestItem = blockSet.items?.find((i) => i.id === currentItem.id);
                              if (latestItem) {
                                void updateBlockItem(latestItem);
                              }
                            }}
                            crmClients={crmClients}
                            campaigns={campaigns}
                            onCampaignsRefresh={refreshCampaigns}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  {(blockSet.items?.length || 0) < 6 && (
                    <button
                      type="button"
                      onClick={() => addBlockItem(blockSet.id)}
                      disabled={isSaving}
                      className="flex w-full items-center justify-center gap-2 border-t border-dashed border-slate-200 bg-slate-50/50 px-3 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-100/80"
                    >
                      <Plus className="h-5 w-5 text-slate-400" />
                      <span>Dodaj stavku</span>
                      <span className="text-xs text-slate-400">({6 - (blockSet.items?.length || 0)} preostalo)</span>
                    </button>
                  )}

                  {(!blockSet.items || blockSet.items.length === 0) && (
                    <div className="border-t border-slate-100 py-8 text-center text-sm text-slate-500">
                      <Grid3X3 className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                      <p>Nema stavki u ovom setu</p>
                      <p className="mt-1 text-xs text-slate-400">Klikni &quot;Dodaj stavku&quot; za početak</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          </div>
        )}
      </div>
    );
  };

  const renderPlayAndWin = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Play & Win Sekcija</h2>
          <p className="text-gray-500 mt-1">Upravljanje Play & Win sekcijom</p>
        </div>
        <Button onClick={createPlayAndWinItem} disabled={isSaving}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj stavku
        </Button>
      </div>

      <div className="space-y-3">
        {playAndWin.map((item) => (
          <CollapsibleItem
            key={item.id}
            title={item.title_en || item.title_ba || item.title || `Play & Win #${item.id}`}
            subtitle={item.cta_url || item.link || 'Nema linka'}
            isExpanded={expandedPlayAndWinId === item.id}
            onToggle={() => setExpandedPlayAndWinId(expandedPlayAndWinId === item.id ? null : item.id)}
            onDelete={() =>
              requestDelete(
                'Obrisati Play & Win stavku?',
                'Stavka će biti uklonjena s portala.',
                () => {
                  void deletePlayAndWinItem(item.id);
                }
              )
            }
            isActive={item.is_active}
            onToggleActive={() => updatePlayAndWinItem({ ...item, is_active: !item.is_active })}
          >
            <ImageUpload
              label="Banner slika"
              value={item.image_url || ''}
              onChange={(url) => setPlayAndWin(prev =>
                prev.map(i => i.id === item.id ? { ...i, image_url: Array.isArray(url) ? url[0] : url } : i)
              )}
              uploadBucket="sarayaconnect-hotspot"
              uploadFolder="playnwin"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="Naslov (BA)"
                value={item.title_ba || ''}
                onChange={(e) => setPlayAndWin(prev => 
                  prev.map(i => i.id === item.id ? { ...i, title_ba: e.target.value } : i)
                )}
              />
              <Input
                label="Naslov (EN)"
                value={item.title_en || ''}
                onChange={(e) => setPlayAndWin(prev => 
                  prev.map(i => i.id === item.id ? { ...i, title_en: e.target.value } : i)
                )}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label="Podnaslov (BA)"
                value={item.subtitle_ba || ''}
                onChange={(e) => setPlayAndWin(prev => 
                  prev.map(i => i.id === item.id ? { ...i, subtitle_ba: e.target.value } : i)
                )}
              />
              <Input
                label="Podnaslov (EN)"
                value={item.subtitle_en || ''}
                onChange={(e) => setPlayAndWin(prev => 
                  prev.map(i => i.id === item.id ? { ...i, subtitle_en: e.target.value } : i)
                )}
              />
            </div>
            <Input
              label="Link"
              value={item.cta_url || item.link || ''}
              onChange={(e) => setPlayAndWin(prev => 
                prev.map(i => i.id === item.id ? { ...i, cta_url: e.target.value, link: e.target.value } : i)
              )}
            />
            <HotspotAnalyticsFields
              placementType="play_and_win"
              placementLabel="Play & Win"
              clients={crmClients}
              campaigns={campaigns}
              onCampaignsRefresh={refreshCampaigns}
              destinationUrl={item.cta_url || item.link}
              value={item}
              onChange={(patch) =>
                setPlayAndWin((prev) =>
                  prev.map((i) => (i.id === item.id ? { ...i, ...patch } : i))
                )
              }
            />
            <div className="flex justify-end">
              <Button onClick={() => updatePlayAndWinItem(item)} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Spremi
              </Button>
            </div>
          </CollapsibleItem>
        ))}
        {playAndWin.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Gamepad2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nema Play & Win stavki</p>
            <Button onClick={createPlayAndWinItem} variant="secondary" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj prvu stavku
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // =============================================================================
  // EDITORS PICKS (Smart Choices / Pametno Odabrano)
  // =============================================================================
  const renderEditorsPicks = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Pametno odabrano</h2>
          <p className="text-gray-500 mt-1">Prikazuje se 5 random na portalu od aktivnih</p>
        </div>
        <Button onClick={createEditorsPick} disabled={isSaving}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj izbor
        </Button>
      </div>

      <div className="space-y-3">
        {editorsPicks.map((pick) => (
          <CollapsibleItem
            key={pick.id}
            title={pick.title_en || pick.title_ba || `Izbor #${pick.id}`}
            subtitle={pick.description_en || pick.description_ba || 'Bez opisa'}
            isExpanded={expandedEditorsPickId === pick.id}
            onToggle={() => setExpandedEditorsPickId(expandedEditorsPickId === pick.id ? null : pick.id)}
            onDelete={() =>
              requestDelete(
                'Obrisati izbor urednika?',
                'Stavka će biti uklonjena s portala.',
                () => {
                  void deleteEditorsPick(pick.id);
                }
              )
            }
            isActive={pick.is_active}
            onToggleActive={() => updateEditorsPick({ ...pick, is_active: !pick.is_active })}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Naslov (BS) - max ~25 znakova"
                value={pick.title_ba || ''}
                onChange={(e) => setEditorsPicks(prev => 
                  prev.map(p => p.id === pick.id ? { ...p, title_ba: e.target.value } : p)
                )}
                placeholder="Naslov na bosanskom"
                maxLength={50}
              />
              <Input
                label="Naslov (EN) - max ~25 znakova"
                value={pick.title_en || ''}
                onChange={(e) => setEditorsPicks(prev => 
                  prev.map(p => p.id === pick.id ? { ...p, title_en: e.target.value } : p)
                )}
                placeholder="Naslov na engleskom"
                maxLength={50}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="Opis (BS) - max ~60 znakova"
                value={pick.description_ba || ''}
                onChange={(e) => setEditorsPicks(prev => 
                  prev.map(p => p.id === pick.id ? { ...p, description_ba: e.target.value } : p)
                )}
                rows={2}
                placeholder="Kratki opis na bosanskom"
                maxLength={100}
              />
              <Textarea
                label="Opis (EN) - max ~60 znakova"
                value={pick.description_en || ''}
                onChange={(e) => setEditorsPicks(prev => 
                  prev.map(p => p.id === pick.id ? { ...p, description_en: e.target.value } : p)
                )}
                rows={2}
                placeholder="Kratki opis na engleskom"
                maxLength={100}
              />
            </div>

            <ImageUpload
              label="Slika"
              value={pick.image_url || ''}
              onChange={(url) => setEditorsPicks(prev =>
                prev.map(p => p.id === pick.id ? { ...p, image_url: Array.isArray(url) ? url[0] : url } : p)
              )}
              uploadBucket="sarayaconnect-hotspot"
              uploadFolder="editors-picks"
            />

            <Input
              label="Link URL"
              value={pick.cta_url || ''}
              onChange={(e) => setEditorsPicks(prev => 
                prev.map(p => p.id === pick.id ? { ...p, cta_url: e.target.value } : p)
              )}
              placeholder="https://..."
            />

            <HotspotAnalyticsFields
              placementType="listing_row"
              placementLabel="Pametno odabrano"
              listingRowVariant="pametno"
              clients={crmClients}
              campaigns={campaigns}
              onCampaignsRefresh={refreshCampaigns}
              destinationUrl={pick.cta_url}
              value={pick}
              onChange={(patch) =>
                setEditorsPicks((prev) =>
                  prev.map((p) => (p.id === pick.id ? { ...p, ...patch } : p))
                )
              }
            />

            <div className="flex justify-end pt-2">
              <Button onClick={() => updateEditorsPick(pick)} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Spremi
              </Button>
            </div>
          </CollapsibleItem>
        ))}

        {editorsPicks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Nema stavki u Pametno odabrano</p>
            <Button onClick={createEditorsPick} variant="secondary" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj prvu stavku
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // =============================================================================
  // DISCOVERY PLACES (Explore Sarajevo)
  // =============================================================================
  const renderDiscovery = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Explore Sarajevo</h2>
          <p className="text-gray-500 mt-1">Prikazuje se 5 random na portalu od aktivnih</p>
        </div>
        <Button onClick={createDiscoveryPlace} disabled={isSaving}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj mjesto
        </Button>
      </div>

      <div className="space-y-3">
        {discoveryPlaces.map((place) => (
          <CollapsibleItem
            key={place.id}
            title={place.name_en || place.name_ba || `Mjesto #${place.id}`}
            subtitle={place.category_en || place.category_ba || 'Bez kategorije'}
            isExpanded={expandedDiscoveryId === place.id}
            onToggle={() => setExpandedDiscoveryId(expandedDiscoveryId === place.id ? null : place.id)}
            onDelete={() =>
              requestDelete(
                'Obrisati mjesto otkrivanja?',
                'Mjesto će biti uklonjeno s portala.',
                () => {
                  void deleteDiscoveryPlace(place.id);
                }
              )
            }
            isActive={place.is_active}
            onToggleActive={() => updateDiscoveryPlace({ ...place, is_active: !place.is_active })}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ime (BS) - max ~25 znakova"
                value={place.name_ba || ''}
                onChange={(e) => setDiscoveryPlaces(prev => 
                  prev.map(p => p.id === place.id ? { ...p, name_ba: e.target.value } : p)
                )}
                placeholder="Ime na bosanskom"
                maxLength={50}
              />
              <Input
                label="Ime (EN) - max ~25 znakova"
                value={place.name_en || ''}
                onChange={(e) => setDiscoveryPlaces(prev => 
                  prev.map(p => p.id === place.id ? { ...p, name_en: e.target.value } : p)
                )}
                placeholder="Ime na engleskom"
                maxLength={50}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Kategorija (BS) - max ~60 znakova"
                value={place.category_ba || ''}
                onChange={(e) => setDiscoveryPlaces(prev => 
                  prev.map(p => p.id === place.id ? { ...p, category_ba: e.target.value } : p)
                )}
                placeholder="Muzej, Park, Restoran..."
                maxLength={100}
              />
              <Input
                label="Kategorija (EN) - max ~60 znakova"
                value={place.category_en || ''}
                onChange={(e) => setDiscoveryPlaces(prev => 
                  prev.map(p => p.id === place.id ? { ...p, category_en: e.target.value } : p)
                )}
                placeholder="Museum, Park, Restaurant..."
                maxLength={100}
              />
            </div>

            <ImageUpload
              label="Slika"
              value={place.image_url || ''}
              onChange={(url) => setDiscoveryPlaces(prev =>
                prev.map(p => p.id === place.id ? { ...p, image_url: Array.isArray(url) ? url[0] : url } : p)
              )}
              uploadBucket="sarayaconnect-hotspot"
              uploadFolder="discovery-places"
            />

            <Input
              label="Link URL"
              value={place.link || ''}
              onChange={(e) => setDiscoveryPlaces(prev => 
                prev.map(p => p.id === place.id ? { ...p, link: e.target.value } : p)
              )}
              placeholder="https://..."
            />

            <HotspotAnalyticsFields
              placementType="listing_row"
              placementLabel="Explore Sarajevo"
              listingRowVariant="explore_sarajevo"
              clients={crmClients}
              campaigns={campaigns}
              onCampaignsRefresh={refreshCampaigns}
              destinationUrl={place.link}
              value={place}
              onChange={(patch) =>
                setDiscoveryPlaces((prev) =>
                  prev.map((p) => (p.id === place.id ? { ...p, ...patch } : p))
                )
              }
            />

            <div className="flex justify-end pt-2">
              <Button onClick={() => updateDiscoveryPlace(place)} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Spremi
              </Button>
            </div>
          </CollapsibleItem>
        ))}

        {discoveryPlaces.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Nema Explore Sarajevo stavki</p>
            <Button onClick={createDiscoveryPlace} variant="secondary" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Dodaj prvo mjesto
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCampaigns = () => (
    <HotspotCampaignsSection
      campaigns={campaigns}
      crmClients={crmClients}
      onReloadCampaigns={async () => {
        clearHotspotSessionCache();
        await refreshCampaigns();
      }}
      toastError={(msg) => toast.error(msg)}
      toastSuccess={(msg) => toast.success(msg)}
    />
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Postavke portala</h2>
        <p className="text-gray-500 mt-1">Globalne postavke hotspot portala</p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lokacija & Valuta</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Naziv grada"
            value={siteConfig?.city_name || ''}
            onChange={(e) => setSiteConfig(prev => prev ? { ...prev, city_name: e.target.value } : null)}
          />
          <Input
            label="Osnovna valuta"
            value={siteConfig?.base_currency || ''}
            onChange={(e) => setSiteConfig(prev => prev ? { ...prev, base_currency: e.target.value } : null)}
            placeholder="npr. BAM"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <Input
            label="Latitude"
            type="number"
            value={siteConfig?.city_lat?.toString() || ''}
            onChange={(e) => setSiteConfig(prev => prev ? { ...prev, city_lat: parseFloat(e.target.value) } : null)}
          />
          <Input
            label="Longitude"
            type="number"
            value={siteConfig?.city_lon?.toString() || ''}
            onChange={(e) => setSiteConfig(prev => prev ? { ...prev, city_lon: parseFloat(e.target.value) } : null)}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button 
            onClick={() => siteConfig && updateSiteConfigData(siteConfig)} 
            disabled={isSaving || !siteConfig}
          >
            <Save className="w-4 h-4 mr-2" />
            Spremi postavke
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Boje & Tema</h3>
        <Input
          label="Primarna boja"
          value={siteConfig?.primary_color || ''}
          onChange={(e) => setSiteConfig(prev => prev ? { ...prev, primary_color: e.target.value } : null)}
          placeholder="npr. rgba(139, 92, 246, 1)"
        />
        <div className="flex justify-end mt-4">
          <Button 
            onClick={() => siteConfig && updateSiteConfigData(siteConfig)} 
            disabled={isSaving || !siteConfig}
          >
            <Save className="w-4 h-4 mr-2" />
            Spremi boje
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'hero-videos': return renderHeroVideos();
      case 'hero-banners': return renderHeroBanners();
      case 'news-cards': return renderNewsCards();
      case 'nav-chips': return renderNavChips();
      case 'blocks': return renderBlocks();
      case 'play-and-win': return renderPlayAndWin();
      case 'editors-picks': return renderEditorsPicks();
      case 'discovery': return renderDiscovery();
      case 'campaigns': return renderCampaigns();
      case 'settings': return renderSettings();
      default: return renderOverview();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <Modal
        isOpen={deleteDialog != null}
        onClose={() => setDeleteDialog(null)}
        title={deleteDialog?.title ?? ''}
        description={deleteDialog?.description}
        size="sm"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setDeleteDialog(null)}>
              Odustani
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                const d = deleteDialog;
                if (!d) return;
                setDeleteDialog(null);
                d.run();
              }}
            >
              Obriši
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">Ova radnja se ne može automatski vratiti.</p>
      </Modal>

      {/* Toast notifications - fixed position, doesn't affect layout */}
      <ToastContainer 
        toasts={toast.toasts} 
        onRemove={toast.removeToast} 
        position="top-right"
      />
      
      {renderContent()}
    </div>
  );
}
