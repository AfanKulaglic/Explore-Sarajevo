'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader, Card } from '@/components/ui';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Package, 
  Users,
  Layers,
  ArrowRight,
  Globe,
  Smartphone,
  Briefcase,
  Tag
} from 'lucide-react';
import { ENTITIES } from '@/lib/config/entities';

// Static color maps for Tailwind purge safety
const statColorMap = {
  businesses: { bg: 'bg-blue-100', text: 'text-blue-600' },
  attractions: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  events: { bg: 'bg-violet-100', text: 'text-violet-600' },
  products: { bg: 'bg-orange-100', text: 'text-orange-600' },
  categories: { bg: 'bg-amber-100', text: 'text-amber-600' },
  types: { bg: 'bg-pink-100', text: 'text-pink-600' },
  clients: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
} as const;

const quickLinkColorMap = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' }
} as const;

type StatKey = keyof typeof statColorMap;
type QuickLinkColor = keyof typeof quickLinkColorMap;

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  colorKey: StatKey;
  isLoading?: boolean;
}

function StatCard({ title, value, icon: Icon, colorKey, isLoading }: StatCardProps) {
  const colors = statColorMap[colorKey];
  return (
    <Card padding="md" hover>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          {isLoading ? (
            <div className="h-8 w-16 mt-1 bg-slate-100 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-[var(--radius-md)] ${colors.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
      </div>
    </Card>
  );
}

interface QuickLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  colorKey: QuickLinkColor;
}

function QuickLink({ href, icon: Icon, label, colorKey }: QuickLinkProps) {
  const colors = quickLinkColorMap[colorKey];
  return (
    <Link 
      href={href} 
      className="group flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-slate-50 hover:bg-slate-100 transition-colors"
    >
      <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${colors.text}`} />
      </div>
      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{label}</span>
      <ArrowRight className="w-4 h-4 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

function DashboardContent() {
  const [stats, setStats] = React.useState({
    businesses: 0,
    attractions: 0,
    events: 0,
    products: 0,
    categories: 0,
    types: 0,
    clients: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [businessesRes, attractionsRes, eventsRes, productsRes, categoriesRes, typesRes, clientsRes] = await Promise.all([
          fetch('/api/explore/businesses'),
          fetch('/api/explore/attractions'),
          fetch('/api/explore/events'),
          fetch('/api/pametno/products'),
          fetch('/api/explore/categories'),
          fetch('/api/explore/types'),
          fetch('/api/cms/crm/clients', { credentials: 'include', cache: 'no-store' }),
        ]);
        
        const [businesses, attractions, events, products, categories, types, clients] = await Promise.all([
          businessesRes.json(),
          attractionsRes.json(),
          eventsRes.json(),
          productsRes.json(),
          categoriesRes.json(),
          typesRes.json(),
          clientsRes.json(),
        ]);
        
        setStats({
          businesses: Array.isArray(businesses) ? businesses.length : 0,
          attractions: Array.isArray(attractions) ? attractions.length : 0,
          events: Array.isArray(events) ? events.length : 0,
          products: Array.isArray(products) ? products.length : 0,
          categories: Array.isArray(categories) ? categories.length : 0,
          types: Array.isArray(types) ? types.length : 0,
          clients: Array.isArray(clients) ? clients.length : 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader 
          title="Dashboard" 
          description="Pregled svih platformi i sadržaja"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={ENTITIES.explore.businesses.plural} value="-" icon={Building2} colorKey="businesses" isLoading />
          <StatCard title={ENTITIES.explore.attractions.plural} value="-" icon={MapPin} colorKey="attractions" isLoading />
          <StatCard title={ENTITIES.explore.events.plural} value="-" icon={Calendar} colorKey="events" isLoading />
          <StatCard title={ENTITIES.pametno.products.plural} value="-" icon={Package} colorKey="products" isLoading />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card padding="none">
            <div className="p-4 border-b border-slate-100">
              <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="p-3 space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-slate-50 rounded-[var(--radius-md)] animate-pulse" />
              ))}
            </div>
          </Card>
          <Card padding="none">
            <div className="p-4 border-b border-slate-100">
              <div className="h-5 w-32 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="p-3 space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-slate-50 rounded-[var(--radius-md)] animate-pulse" />
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader 
        title="Dashboard" 
        description="Pregled svih platformi i sadržaja"
      />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={ENTITIES.explore.businesses.plural}
          value={stats.businesses}
          icon={Building2}
          colorKey="businesses"
        />
        <StatCard
          title={ENTITIES.explore.attractions.plural}
          value={stats.attractions}
          icon={MapPin}
          colorKey="attractions"
        />
        <StatCard
          title={ENTITIES.explore.events.plural}
          value={stats.events}
          icon={Calendar}
          colorKey="events"
        />
        <StatCard
          title={ENTITIES.pametno.products.plural}
          value={stats.products}
          icon={Package}
          colorKey="products"
        />
        <StatCard
          title={ENTITIES.explore.categories.plural}
          value={stats.categories}
          icon={Layers}
          colorKey="categories"
        />
        <StatCard
          title={ENTITIES.explore.types.plural}
          value={stats.types}
          icon={Tag}
          colorKey="types"
        />
        <StatCard
          title={ENTITIES.crm.clients.plural}
          value={stats.clients}
          icon={Briefcase}
          colorKey="clients"
        />
      </div>
      
      {/* Quick Access Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CRM - Full Width */}
        <Card padding="none" className="lg:col-span-2">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">CRM</h2>
              <p className="text-xs text-slate-500">Upravljanje klijentima</p>
            </div>
          </div>
          <div className="p-3">
            <QuickLink href="/dashboard/crm" icon={Briefcase} label={ENTITIES.crm.clients.plural} colorKey="violet" />
          </div>
        </Card>

        {/* Explore Sarajevo */}
        <Card padding="none">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Explore Sarajevo</h2>
              <p className="text-xs text-slate-500">Upravljanje sadržajem</p>
            </div>
          </div>
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <QuickLink href="/dashboard/explore/businesses" icon={Building2} label={ENTITIES.explore.businesses.plural} colorKey="blue" />
            <QuickLink href="/dashboard/explore/attractions" icon={MapPin} label={ENTITIES.explore.attractions.plural} colorKey="emerald" />
            <QuickLink href="/dashboard/explore/events" icon={Calendar} label={ENTITIES.explore.events.plural} colorKey="violet" />
            <QuickLink href="/dashboard/explore/categories" icon={Layers} label={ENTITIES.explore.categories.plural} colorKey="amber" />
          </div>
        </Card>
        
        {/* Pametno Odabrano */}
        <Card padding="none">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Pametno Odabrano</h2>
              <p className="text-xs text-slate-500">Upravljanje proizvodima</p>
            </div>
          </div>
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <QuickLink href="/dashboard/pametno/products" icon={Package} label={ENTITIES.pametno.products.plural} colorKey="blue" />
            <QuickLink href="/dashboard/pametno/categories" icon={Layers} label={ENTITIES.pametno.categories.plural} colorKey="emerald" />
            <QuickLink href="/dashboard/pametno/brands" icon={Tag} label={ENTITIES.pametno.brands.plural} colorKey="violet" />
          </div>
        </Card>
        
        {/* Hotspot - Full Width */}
        <Card padding="none" className="lg:col-span-2">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500 flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Hotspot</h2>
              <p className="text-xs text-slate-500">Konfiguracija mobilne aplikacije</p>
            </div>
          </div>
          <div className="p-3">
            <QuickLink href="/dashboard/hotspot" icon={Smartphone} label="Postavke Hotspot aplikacije" colorKey="violet" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}


