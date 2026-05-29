'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui';
import { Package, Tags, Bookmark, FolderOpen, Layers } from 'lucide-react';

// Static color map for Tailwind purge safety
const cardColorMap = {
  products: 'bg-blue-500',
  categories: 'bg-emerald-500',
  brands: 'bg-violet-500',
  tags: 'bg-amber-500',
  collections: 'bg-pink-500'
} as const;

type CardKey = keyof typeof cardColorMap;

interface StatCardData {
  key: CardKey;
  title: string;
  icon: React.ElementType;
  href: string;
}

const statCardsConfig: StatCardData[] = [
  { key: 'products', title: 'Proizvodi', icon: Package, href: '/dashboard/pametno/products' },
  { key: 'categories', title: 'Kategorije', icon: FolderOpen, href: '/dashboard/pametno/categories' },
  { key: 'brands', title: 'Brendovi', icon: Bookmark, href: '/dashboard/pametno/brands' },
  { key: 'tags', title: 'Tagovi', icon: Tags, href: '/dashboard/pametno/tags' },
  { key: 'collections', title: 'Kolekcije', icon: Layers, href: '/dashboard/pametno/collections' }
];

function PametnoContent() {
  const [stats, setStats] = React.useState({
    products: 0,
    categories: 0,
    brands: 0,
    tags: 0,
    collections: 0
  });
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, categories, brands, tags, collections] = await Promise.all([
          fetch('/api/pametno/products').then(r => r.json()),
          fetch('/api/pametno/categories').then(r => r.json()),
          fetch('/api/pametno/brands').then(r => r.json()),
          fetch('/api/pametno/tags').then(r => r.json()),
          fetch('/api/pametno/collections').then(r => r.json())
        ]);
        
        setStats({
          products: Array.isArray(products) ? products.length : 0,
          categories: Array.isArray(categories) ? categories.length : 0,
          brands: Array.isArray(brands) ? brands.length : 0,
          tags: Array.isArray(tags) ? tags.length : 0,
          collections: Array.isArray(collections) ? collections.length : 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pametno Odabrano</h1>
        <p className="text-slate-500 mt-1">Upravljanje proizvodima i sadržajem</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCardsConfig.map((card) => {
          const Icon = card.icon;
          const colorClass = cardColorMap[card.key];
          const value = stats[card.key];
          
          return (
            <Link key={card.key} href={card.href}>
              <Card hover className="h-full">
                <div className={`${colorClass} text-white rounded-[var(--radius-md)] p-3 w-fit mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
                {isLoading ? (
                  <div className="h-9 w-12 mt-2 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Brze akcije" />
          <div className="space-y-2 mt-4">
            <Link 
              href="/dashboard/pametno/products/new"
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-[var(--radius-md)] hover:bg-slate-100 transition-colors"
            >
              <Package className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-sm">Dodaj novi proizvod</span>
            </Link>
            <Link 
              href="/dashboard/pametno/categories"
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-[var(--radius-md)] hover:bg-slate-100 transition-colors"
            >
              <FolderOpen className="w-5 h-5 text-emerald-500" />
              <span className="font-medium text-sm">Upravljaj kategorijama</span>
            </Link>
            <Link 
              href="/dashboard/pametno/brands"
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-[var(--radius-md)] hover:bg-slate-100 transition-colors"
            >
              <Bookmark className="w-5 h-5 text-violet-500" />
              <span className="font-medium text-sm">Upravljaj brendovima</span>
            </Link>
          </div>
        </Card>
        
        <Card>
          <CardHeader title="O Pametno Odabrano" />
          <div className="mt-4 space-y-3">
            <p className="text-slate-600 text-sm">
              Pametno Odabrano je platforma za pametne kupce koja pomaže korisnicima 
              da pronađu najbolje proizvode po najboljim cijenama.
            </p>
            <p className="text-slate-600 text-sm">
              Koristite ovaj panel za upravljanje proizvodima, kategorijama, brendovima,
              tagovima i kolekcijama.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function PametnoPage() {
  return <PametnoContent />;
}


