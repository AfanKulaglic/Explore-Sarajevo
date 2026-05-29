'use client';

import * as React from 'react';
import { Button, Card, Modal, Input, Textarea, ImageUpload, Checkbox, Alert, PageHeader } from '@/components/ui';
import { Plus, Pencil, Trash2, Layers, GripVertical, Eye, EyeOff } from 'lucide-react';
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

interface Collection {
  id: number;
  name: string;
  slug: string;
  title?: string;
  subtitle?: string;
  intro?: string;
  background_image?: string;
  is_active?: boolean;
  display_order?: number;
  // English translations
  name_en?: string;
  title_en?: string;
  subtitle_en?: string;
  intro_en?: string;
}

// Sortable Row Component
function SortableRow({ 
  collection, 
  onEdit,
  onDelete 
}: { 
  collection: Collection;
  onEdit: (c: Collection) => void;
  onDelete: (c: Collection) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id });

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
      
      {/* Collection Info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Background Image */}
          {collection.background_image ? (
            <CmsThumbnail
              src={collection.background_image}
              alt={collection.name}
              width={64}
              height={40}
              className="w-16 h-10 object-cover rounded bg-slate-100 shrink-0"
            />
          ) : (
            <div className="w-16 h-10 bg-linear-to-br from-purple-100 to-blue-100 rounded shrink-0 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
          )}
          
          <div className="min-w-0">
            <div className="font-semibold text-slate-900">{collection.name}</div>
            {collection.title && collection.title !== collection.name && (
              <div className="text-sm text-slate-600 mt-0.5">{collection.title}</div>
            )}
            {collection.subtitle && (
              <div className="text-xs text-slate-500 mt-0.5">{collection.subtitle}</div>
            )}
          </div>
        </div>
      </td>
      
      {/* Status */}
      <td className="px-4 py-3 w-32">
        {collection.is_active !== false ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
            <Eye className="w-3 h-3" />
            Aktivna
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
            <EyeOff className="w-3 h-3" />
            Neaktivna
          </span>
        )}
      </td>
      
      {/* Actions */}
      <td className="px-4 py-3 w-16">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(collection)} className="w-full">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(collection)} className="w-full">
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function CollectionsContent() {
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSavingOrder, setIsSavingOrder] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCollection, setEditingCollection] = React.useState<Collection | null>(null);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  
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
  
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    title: '',
    subtitle: '',
    intro: '',
    background_image: '',
    is_active: true,
    display_order: 0,
    // English translations
    name_en: '',
    title_en: '',
    subtitle_en: '',
    intro_en: ''
  });
  
  const [showEnglish, setShowEnglish] = React.useState(false);
  
  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/pametno/collections');
      const data = await response.json();
      setCollections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchCollections();
  }, []);
  
  const openModal = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData({
        name: collection.name || '',
        slug: collection.slug || '',
        title: collection.title || '',
        subtitle: collection.subtitle || '',
        intro: collection.intro || '',
        background_image: collection.background_image || '',
        is_active: collection.is_active !== false,
        display_order: collection.display_order || 0,
        // English translations
        name_en: collection.name_en || '',
        title_en: collection.title_en || '',
        subtitle_en: collection.subtitle_en || '',
        intro_en: collection.intro_en || ''
      });
    } else {
      setEditingCollection(null);
      setFormData({
        name: '',
        slug: '',
        title: '',
        subtitle: '',
        intro: '',
        background_image: '',
        is_active: true,
        display_order: 0,
        name_en: '',
        title_en: '',
        subtitle_en: '',
        intro_en: ''
      });
    }
    setShowEnglish(false);
    setIsModalOpen(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const url = editingCollection 
      ? `/api/pametno/collections/${editingCollection.id}` 
      : '/api/pametno/collections';
    const method = editingCollection ? 'PUT' : 'POST';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess(editingCollection ? 'Kolekcija ažurirana' : 'Kolekcija kreirana');
        setIsModalOpen(false);
        fetchCollections();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Greška pri spremanju');
      }
    } catch {
      setError('Greška pri spremanju');
    }
  };
  
  const handleDelete = async (collection: Collection) => {
    if (!confirm(`Jeste li sigurni da želite obrisati "${collection.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/pametno/collections/${collection.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Kolekcija obrisana');
        fetchCollections();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Greška pri brisanju');
    }
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = collections.findIndex(c => c.id === active.id);
    const newIndex = collections.findIndex(c => c.id === over.id);
    
    // Optimistically update UI
    const newOrder = arrayMove(collections, oldIndex, newIndex);
    setCollections(newOrder);
    
    // Save new order to backend
    setIsSavingOrder(true);
    try {
      const orderedIds = newOrder.map(c => c.id);
      
      const response = await fetch('/api/pametno/collections/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collections: orderedIds }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        fetchCollections();
        setError('Greška pri spremanju redoslijeda');
      }
    } catch {
      fetchCollections();
      setError('Greška pri spremanju redoslijeda');
    } finally {
      setIsSavingOrder(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kolekcije"
        description="Pametno Odabrano kolekcije proizvoda"
        breadcrumb="Pametno Odabrano"
        action={
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4" />
            Nova kolekcija
          </Button>
        }
      />
      
      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      
      {/* Reorder hint */}
      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
        <GripVertical className="w-4 h-4" />
        <span>Povucite redove za promjenu redoslijeda prikaza</span>
        {isSavingOrder && (
          <span className="ml-auto text-blue-600 flex items-center gap-1">
            <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Spremanje...
          </span>
        )}
      </div>
      
      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : collections.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Nema kolekcija
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={collections.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="w-10 px-2 py-3"></th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Kolekcija
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                        Akcije
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map((collection) => (
                      <SortableRow
                        key={collection.id}
                        collection={collection}
                        onEdit={openModal}
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
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCollection ? 'Uredi kolekciju' : 'Nova kolekcija'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Naziv"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          
          <Input
            label="Naslov (Title)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          
          <Input
            label="Podnaslov (Subtitle)"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          />
          
          <Textarea
            label="Uvod (Intro)"
            value={formData.intro}
            onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
          />
          
          <ImageUpload
            label="Pozadinska slika"
            value={formData.background_image}
            onChange={(value) => setFormData({ ...formData, background_image: value as string })}
          />
          
          <Input
            label="Redoslijed prikaza"
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
          />
          
          <Checkbox
            label="Aktivna kolekcija"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          />
          
          {/* English Translations */}
          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setShowEnglish(!showEnglish)}
              className="w-full flex items-center justify-between text-left hover:bg-slate-50 p-2 rounded transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>🇬🇧</span>
                <span className="font-medium text-slate-700">English Translation</span>
              </div>
              <svg 
                className={`w-4 h-4 text-slate-400 transition-transform ${showEnglish ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showEnglish && (
              <div className="mt-3 space-y-3 pl-6 border-l-2 border-blue-200">
                <Input
                  label="Name (English)"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Collection name in English"
                />
                
                <Input
                  label="Title (English)"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="Collection title in English"
                />
                
                <Input
                  label="Subtitle (English)"
                  value={formData.subtitle_en}
                  onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                  placeholder="Collection subtitle in English"
                />
                
                <Textarea
                  label="Intro (English)"
                  value={formData.intro_en}
                  onChange={(e) => setFormData({ ...formData, intro_en: e.target.value })}
                  placeholder="Collection introduction in English"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Odustani
            </Button>
            <Button type="submit">
              {editingCollection ? 'Spremi' : 'Kreiraj'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function CollectionsPage() {
  return <CollectionsContent />;
}


