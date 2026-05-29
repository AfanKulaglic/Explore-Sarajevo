'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Card, Alert, PageHeader, SearchFilter } from '@/components/ui';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Event {
  id: number;
  name: string;
  slug: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  image?: string;
}

function EventsContent() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/explore/events');
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    fetchEvents();
  }, []);
  
  const handleDelete = async (event: Event) => {
    if (!confirm(`Jeste li sigurni da želite obrisati "${event.name}"?`)) return;
    
    try {
      const response = await fetch(`/api/explore/events/${event.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSuccess('Događaj obrisan');
        fetchEvents();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Greška pri brisanju');
    }
  };

  // Filter events based on search query
  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          event.name?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          event.slug?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [events, searchQuery]);
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Događaji"
        description="Upravljanje događajima za Explore Sarajevo"
        breadcrumb="Explore Sarajevo"
        action={
          <Link href="/dashboard/explore/events/new">
            <Button>
              <Plus className="w-4 h-4" />
              Novi događaj
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
        searchPlaceholder="Search events by name, location..."
        showDateFilter={false}
      />
      
      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {searchQuery ? 'No events match your search' : 'Nema događaja'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Događaj
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                    Početak
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                    Kraj
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    {/* Event Info */}
                    <td className="px-4 py-3">
                      <div className="py-1">
                        <div className="font-semibold text-slate-900">{event.name}</div>
                        {event.location && (
                          <div className="text-xs text-slate-500 mt-0.5">{event.location}</div>
                        )}
                      </div>
                    </td>
                    
                    {/* Start Date */}
                    <td className="px-4 py-3 w-32">
                      <span className="text-sm text-slate-600">
                        {event.start_date ? formatDate(event.start_date) : '—'}
                      </span>
                    </td>
                    
                    {/* End Date */}
                    <td className="px-4 py-3 w-32">
                      <span className="text-sm text-slate-600">
                        {event.end_date ? formatDate(event.end_date) : '—'}
                      </span>
                    </td>
                    
                    {/* Actions - Vertical Layout */}
                    <td className="px-4 py-3 w-16">
                      <div className="flex flex-col gap-1">
                        <Link href={`/dashboard/explore/events/${event.id}`}>
                          <Button variant="ghost" size="sm" className="w-full">
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(event)} className="w-full">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function EventsPage() {
  return <EventsContent />;
}


