'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Card, Alert, PageHeader, SearchFilter } from '@/components/ui';
import { Plus, Pencil, Trash2, Star, Crown, GripVertical } from 'lucide-react';
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

interface CategoryRelationship {
  id: number;
  name: string;
  is_highlight?: boolean;
  is_premium?: boolean;
}

interface Business {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  brand_name?: string;
  categories?: CategoryRelationship[];
  sections?: { id: number; is_highlight?: boolean; is_premium?: boolean }[];
  display_order?: number;
}

// Helper function
function getHighlightStatus(business: Business) {
  const categories = business.categories || [];
  const sections = business.sections || [];
  const hasCategoryHighlight = categories.some((c) => c.is_highlight && !c.is_premium);
  const hasCategoryPremium = categories.some((c) => c.is_premium);
  const hasSectionHighlight = sections.some((s) => s.is_highlight && !s.is_premium);
  const hasSectionPremium = sections.some((s) => s.is_premium);

  return { hasCategoryHighlight, hasCategoryPremium, hasSectionHighlight, hasSectionPremium };
}

// Sortable Row Component
function SortableRow({ 
  business, 
  onDelete 
}: { 
  business: Business; 
  onDelete: (b: Business) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: business.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const status = getHighlightStatus(business);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
        isDragging ? 'bg-blue-50 shadow-lg z-50 relative' : ''
      }`}
    >
      {/* Drag Handle */}
      <td className="w-10 px-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      
      {/* Business Info */}
      <td className="px-4 py-3">
        <div className="py-1">
          <div className="font-semibold text-slate-900">{business.name}</div>
          {business.address && (
            <div className="text-xs text-slate-500 mt-0.5">{business.address}</div>
          )}
          {business.categories && business.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {business.categories.map(cat => (
                <span 
                  key={cat.id} 
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                >
                  {cat.name}
                  {cat.is_premium && <Crown className="w-3 h-3 text-purple-500" />}
                  {cat.is_highlight && !cat.is_premium && <Star className="w-3 h-3 text-amber-500" />}
                </span>
              ))}
            </div>
          )}
          {business.brand_name && (
            <div className="text-xs text-blue-600 mt-1">
              {business.brand_name}
            </div>
          )}
        </div>
      </td>
      
      {/* Highlight Status */}
      <td className="px-4 py-3 w-32">
        {!status.hasCategoryHighlight &&
        !status.hasCategoryPremium &&
        !status.hasSectionHighlight &&
        !status.hasSectionPremium ? (
          <span className="text-slate-400 text-xs">—</span>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            {status.hasCategoryPremium && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full" title="Premium u kategoriji">
                <Crown className="w-3 h-3" />
              </span>
            )}
            {status.hasCategoryHighlight && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full" title="Highlight u kategoriji">
                <Star className="w-3 h-3" />
              </span>
            )}
            {status.hasSectionPremium && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-800 text-xs rounded-full ring-1 ring-purple-200" title="Premium na portalu">
                <Crown className="w-3 h-3" />
                <span className="hidden sm:inline">Portal</span>
              </span>
            )}
            {status.hasSectionHighlight && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded-full ring-1 ring-amber-200" title="Highlight na portalu">
                <Star className="w-3 h-3" />
                <span className="hidden sm:inline">Portal</span>
              </span>
            )}
          </div>
        )}
      </td>
      
      {/* Actions - Vertical Layout */}
      <td className="px-4 py-3 w-16">
        <div className="flex flex-col gap-1">
          <Link href={`/dashboard/explore/businesses/${business.id}`}>
            <Button variant="ghost" size="sm" className="w-full">
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => onDelete(business)} className="w-full">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function BusinessesContent() {
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSavingOrder, setIsSavingOrder] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  
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
  
  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/explore/businesses');
      const data = await response.json();
      setBusinesses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchBusinesses();
  }, []);
  
  const handleDelete = async (business: Business) => {
    if (!confirm(`Are you sure you want to delete "${business.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/explore/businesses/${business.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Business deleted');
        fetchBusinesses();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Error deleting');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = businesses.findIndex(b => b.id === active.id);
    const newIndex = businesses.findIndex(b => b.id === over.id);
    
    // Optimistically update UI
    const newOrder = arrayMove(businesses, oldIndex, newIndex);
    setBusinesses(newOrder);
    
    // Save new order to backend
    setIsSavingOrder(true);
    try {
      // Send array of IDs in new order
      const orderedIds = newOrder.map(b => b.id);
      
      const response = await fetch('/api/explore/businesses/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businesses: orderedIds }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Revert on error
        fetchBusinesses();
        setError('Error saving order');
      }
    } catch {
      fetchBusinesses();
      setError('Error saving order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Filter businesses based on search query and date range
  const filteredBusinesses = React.useMemo(() => {
    return businesses.filter(business => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          business.name?.toLowerCase().includes(query) ||
          business.address?.toLowerCase().includes(query) ||
          business.slug?.toLowerCase().includes(query) ||
          business.brand_name?.toLowerCase().includes(query) ||
          business.categories?.some(c => c.name.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      
      // Date filtering would require created_at field from API
      // For now, we just filter by text
      
      return true;
    });
  }, [businesses, searchQuery]);
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Businesses"
        description="Manage businesses for Explore Sarajevo"
        breadcrumb="Explore Sarajevo"
        action={
          <Link href="/dashboard/explore/businesses/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Business
            </Button>
          </Link>
        }
      />
      
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      
      {/* Search and Date Filter */}
      <SearchFilter
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search businesses by name, address..."
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        showDateFilter={true}
      />
      
      {/* Reorder hint */}
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
        <GripVertical className="w-4 h-4" />
        <span>Drag rows to change display order</span>
        {isSavingOrder && (
          <span className="ml-auto text-blue-600 flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Saving...
          </span>
        )}
      </div>
      
      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {searchQuery ? 'No businesses match your search' : 'No businesses'}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredBusinesses.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="w-10 px-2 py-3"></th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                        Featured
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBusinesses.map((business) => (
                      <SortableRow
                        key={business.id}
                        business={business}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>
    </div>
  );
}

export default function BusinessesPage() {
  return <BusinessesContent />;
}


