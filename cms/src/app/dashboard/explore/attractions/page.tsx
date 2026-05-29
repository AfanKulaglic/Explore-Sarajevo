'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Card, Alert, PageHeader, SearchFilter } from '@/components/ui';
import { Plus, Pencil, Trash2, Star, Crown, Home, GripVertical } from 'lucide-react';
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

interface CategoryRelation {
  id: number;
  name?: string;
  is_highlight?: boolean;
  is_premium?: boolean;
}

interface SectionRelation {
  id: number;
  name?: string;
  is_highlight?: boolean;
  is_premium?: boolean;
}

interface Attraction {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  featured_location?: boolean;
  display_order?: number;
  categories?: CategoryRelation[];
  sections?: SectionRelation[];
}

interface SortableRowProps {
  attraction: Attraction;
  onDelete: (attraction: Attraction) => void;
}

function SortableRow({ attraction, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: attraction.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  // Calculate status from relationships
  const status = React.useMemo(() => {
    const hasHighlight = attraction.categories?.some(c => c.is_highlight) || 
                        attraction.sections?.some(s => s.is_highlight);
    const hasPremium = attraction.categories?.some(c => c.is_premium) || 
                      attraction.sections?.some(s => s.is_premium);
    const hasHomepage = attraction.featured_location;
    
    return { hasHighlight, hasPremium, hasHomepage };
  }, [attraction]);
  
  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
    >
      {/* Drag Handle */}
      <td className="w-10 px-2 py-3">
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded hover:bg-slate-200 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-slate-400" />
        </button>
      </td>
      
      {/* Attraction Info */}
      <td className="px-4 py-3">
        <div className="py-1">
          <div className="font-semibold text-slate-900">{attraction.name}</div>
          {attraction.address && (
            <div className="text-xs text-slate-500 mt-0.5">{attraction.address}</div>
          )}
          {attraction.categories && attraction.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {attraction.categories.map(cat => (
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
        </div>
      </td>
      
      {/* Highlight Status */}
      <td className="px-4 py-3 w-32">
        {!status.hasHighlight && !status.hasPremium && !status.hasHomepage ? (
          <span className="text-slate-400 text-xs">—</span>
        ) : (
          <div className="flex items-center gap-1.5">
            {status.hasPremium && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full" title="Premium u kategoriji">
                <Crown className="w-3 h-3" />
              </span>
            )}
            {status.hasHighlight && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full" title="Highlight u kategoriji">
                <Star className="w-3 h-3" />
              </span>
            )}
            {status.hasHomepage && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full" title="Na početnoj">
                <Home className="w-3 h-3" />
              </span>
            )}
          </div>
        )}
      </td>
      
      {/* Actions - Vertical Layout */}
      <td className="px-4 py-3 w-16">
        <div className="flex flex-col gap-1">
          <Link href={`/dashboard/explore/attractions/${attraction.id}`}>
            <Button variant="ghost" size="sm" className="w-full">
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => onDelete(attraction)} className="w-full">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function AttractionsContent() {
  const [attractions, setAttractions] = React.useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSavingOrder, setIsSavingOrder] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  
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
  
  const fetchAttractions = async () => {
    try {
      const response = await fetch('/api/explore/attractions');
      const data = await response.json();
      setAttractions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching attractions:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchAttractions();
  }, []);
  
  const handleDelete = async (attraction: Attraction) => {
    if (!confirm(`Are you sure you want to delete "${attraction.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/explore/attractions/${attraction.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Attraction deleted');
        fetchAttractions();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Error deleting');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = attractions.findIndex(a => a.id === active.id);
    const newIndex = attractions.findIndex(a => a.id === over.id);
    
    // Optimistically update UI
    const newOrder = arrayMove(attractions, oldIndex, newIndex);
    setAttractions(newOrder);
    
    // Save new order to backend
    setIsSavingOrder(true);
    try {
      const orderedIds = newOrder.map(a => a.id);
      
      const response = await fetch('/api/explore/attractions/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attractions: orderedIds }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        fetchAttractions();
        setError('Error saving order');
      }
    } catch {
      fetchAttractions();
      setError('Error saving order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Filter attractions based on search query
  const filteredAttractions = React.useMemo(() => {
    return attractions.filter(attraction => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          attraction.name?.toLowerCase().includes(query) ||
          attraction.address?.toLowerCase().includes(query) ||
          attraction.slug?.toLowerCase().includes(query) ||
          attraction.categories?.some(c => c.name?.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [attractions, searchQuery]);
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attractions"
        description="Tourist attractions for Explore Sarajevo"
        breadcrumb="Explore Sarajevo"
        action={
          <Link href="/dashboard/explore/attractions/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Attraction
            </Button>
          </Link>
        }
      />
      
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      
      {/* Search Filter */}
      <SearchFilter
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search attractions by name, address..."
        showDateFilter={false}
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
        ) : filteredAttractions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {searchQuery ? 'No attractions match your search' : 'No attractions'}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredAttractions.map(a => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="w-10 px-2 py-3"></th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Attraction
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
                    {filteredAttractions.map((attraction) => (
                      <SortableRow
                        key={attraction.id}
                        attraction={attraction}
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

export default function AttractionsPage() {
  return <AttractionsContent />;
}


