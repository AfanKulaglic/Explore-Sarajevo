'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Card, Alert, PageHeader, SearchFilter } from '@/components/ui';
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, Layers, GripVertical } from 'lucide-react';
import { CmsThumbnail } from '@/components/ui/CmsThumbnail';
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

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Collection {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  image_url?: string;
  price?: number;
  currency?: string;
  is_published?: boolean;
  featured?: boolean;
  brand_name?: string;
  brand_logo?: string;
  categories?: Category[];
  collections?: Collection[];
  display_order?: number;
}

// Sortable Row Component
function SortableRow({ 
  product, 
  onDelete 
}: { 
  product: Product; 
  onDelete: (p: Product) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
      
      {/* Product Info */}
      <td className="px-4 py-3">
        <div className="flex items-start gap-3">
          {/* Product Image */}
          {product.image_url ? (
            <CmsThumbnail
              src={product.image_url}
              alt={product.title}
              width={48}
              height={48}
              className="w-12 h-12 object-cover rounded-lg bg-slate-100 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-slate-100 rounded-lg shrink-0" />
          )}
          
          <div className="py-0.5 min-w-0">
            <div className="font-semibold text-slate-900 truncate">{product.title}</div>
            
            {/* Price */}
            {product.price && (
              <div className="text-sm text-emerald-600 font-medium mt-0.5">
                {product.price} {product.currency || 'EUR'}
              </div>
            )}
            
            {/* Categories */}
            {product.categories && product.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {product.categories.map(cat => (
                  <span 
                    key={cat.id} 
                    className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
            
            {/* Brand */}
            {product.brand_name && (
              <div className="flex items-center gap-1.5 mt-1.5">
                {product.brand_logo && (
                  <CmsThumbnail
                    src={product.brand_logo}
                    alt={product.brand_name}
                    width={16}
                    height={16}
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="text-xs text-blue-600">{product.brand_name}</span>
              </div>
            )}
          </div>
        </div>
      </td>
      
      {/* Status Icons */}
      <td className="px-4 py-3 w-40">
        {!product.is_published && !product.featured && (!product.collections || product.collections.length === 0) ? (
          <span className="text-slate-400 text-xs">—</span>
        ) : (
          <div className="flex items-center gap-1.5">
            {/* Published Status */}
            {product.is_published ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full" title="Published">
                <Eye className="w-3 h-3" />
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full" title="Draft">
                <EyeOff className="w-3 h-3" />
              </span>
            )}
            
            {/* Featured */}
            {product.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full" title="Featured product">
                <Star className="w-3 h-3" />
              </span>
            )}
            
            {/* In Collections */}
            {product.collections && product.collections.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full" title={`In ${product.collections.length} collections`}>
                <Layers className="w-3 h-3" />
                <span>{product.collections.length}</span>
              </span>
            )}
          </div>
        )}
      </td>
      
      {/* Actions */}
      <td className="px-4 py-3 w-16">
        <div className="flex flex-col gap-1">
          <Link href={`/dashboard/pametno/products/${product.id}`}>
            <Button variant="ghost" size="sm" className="w-full">
              <Pencil className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => onDelete(product)} className="w-full">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function ProductsContent() {
  const [products, setProducts] = React.useState<Product[]>([]);
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
  
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/pametno/products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchProducts();
  }, []);
  
  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.title}"?`)) return;
    
    try {
      const response = await fetch(`/api/pametno/products/${product.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Product deleted');
        fetchProducts();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Error deleting product');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = products.findIndex(p => p.id === active.id);
    const newIndex = products.findIndex(p => p.id === over.id);
    
    // Optimistically update UI
    const newOrder = arrayMove(products, oldIndex, newIndex);
    setProducts(newOrder);
    
    // Save new order to backend
    setIsSavingOrder(true);
    try {
      const orderedIds = newOrder.map(p => p.id);
      
      const response = await fetch('/api/pametno/products/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: orderedIds }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        fetchProducts();
        setError('Error saving order');
      }
    } catch {
      fetchProducts();
      setError('Error saving order');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Filter products based on search query
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.title?.toLowerCase().includes(query) ||
          product.slug?.toLowerCase().includes(query) ||
          product.short_description?.toLowerCase().includes(query) ||
          product.brand_name?.toLowerCase().includes(query) ||
          product.categories?.some(c => c.name.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [products, searchQuery]);
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Pametno Odabrano products"
        breadcrumb="Pametno Odabrano"
        action={
          <Link href="/dashboard/pametno/products/new">
            <Button>
              <Plus className="w-4 h-4" />
              New Product
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
        searchPlaceholder="Search products by name, brand..."
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
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {searchQuery ? 'No products match your search' : 'No products'}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredProducts.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="w-10 px-2 py-3"></th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-40">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <SortableRow
                        key={product.id}
                        product={product}
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

export default function ProductsPage() {
  return <ProductsContent />;
}


