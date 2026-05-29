'use client';

import * as React from 'react';
import { Button, Card, Input, Modal, Textarea } from '@/components/ui';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { CrmClientOption, CampaignOption } from '@/components/hotspot/HotspotAnalyticsFields';

export type CampaignFormState = {
  name: string;
  slug: string;
  client_id: string;
  notes: string;
  campaign_start_date: string;
  campaign_end_date: string;
  campaign_start_time: string;
  campaign_end_time: string;
  start_include_time: boolean;
  end_include_time: boolean;
  is_active: boolean;
};

function emptyForm(): CampaignFormState {
  return {
    name: '',
    slug: '',
    client_id: '',
    notes: '',
    campaign_start_date: '',
    campaign_end_date: '',
    campaign_start_time: '',
    campaign_end_time: '',
    start_include_time: false,
    end_include_time: false,
    is_active: true,
  };
}

function rowToForm(c: CampaignOption): CampaignFormState {
  return {
    name: c.name,
    slug: c.slug,
    client_id: c.client_id != null ? String(c.client_id) : '',
    notes: c.notes ?? '',
    campaign_start_date: (c.campaign_start_date ?? '').slice(0, 10),
    campaign_end_date: (c.campaign_end_date ?? '').slice(0, 10),
    campaign_start_time: formatTimeForInput(c.campaign_start_time),
    campaign_end_time: formatTimeForInput(c.campaign_end_time),
    start_include_time: Boolean(c.start_include_time),
    end_include_time: Boolean(c.end_include_time),
    is_active: c.is_active !== false,
  };
}

function formatTimeForInput(t: string | null | undefined): string {
  if (!t) return '';
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
}

function formatPeriod(c: CampaignOption): string {
  const parts: string[] = [];
  if (c.campaign_start_date) {
    let s = c.campaign_start_date.slice(0, 10);
    if (c.start_include_time && c.campaign_start_time) {
      s += ` ${formatTimeForInput(c.campaign_start_time)}`;
    }
    parts.push(s);
  }
  if (c.campaign_end_date) {
    let e = c.campaign_end_date.slice(0, 10);
    if (c.end_include_time && c.campaign_end_time) {
      e += ` ${formatTimeForInput(c.campaign_end_time)}`;
    }
    parts.push(e);
  }
  if (parts.length === 0) return '—';
  return parts.length === 2 ? `${parts[0]} → ${parts[1]}` : parts[0];
}

interface HotspotCampaignsSectionProps {
  campaigns: CampaignOption[];
  crmClients: CrmClientOption[];
  onReloadCampaigns: () => Promise<void>;
  toastError: (msg: string) => void;
  toastSuccess: (msg: string) => void;
}

export function HotspotCampaignsSection({
  campaigns,
  crmClients,
  onReloadCampaigns,
  toastError,
  toastSuccess,
}: HotspotCampaignsSectionProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState<CampaignFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = React.useState<CampaignOption | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (c: CampaignOption) => {
    setEditingId(c.id);
    setForm(rowToForm(c));
    setModalOpen(true);
  };

  const payloadFromForm = () => {
    const name = form.name.trim();
    let slug = form.slug.trim().toLowerCase();
    if (!slug) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    }
    return {
      name,
      slug,
      is_active: form.is_active,
      client_id: form.client_id ? parseInt(form.client_id, 10) : null,
      notes: form.notes.trim() || null,
      campaign_start_date: form.campaign_start_date || null,
      campaign_end_date: form.campaign_end_date || null,
      campaign_start_time:
        form.start_include_time && form.campaign_start_time.trim()
          ? `${form.campaign_start_time.trim()}:00`
          : null,
      campaign_end_time:
        form.end_include_time && form.campaign_end_time.trim()
          ? `${form.campaign_end_time.trim()}:00`
          : null,
      start_include_time: form.start_include_time,
      end_include_time: form.end_include_time,
    };
  };

  const save = async () => {
    const body = payloadFromForm();
    if (!body.name) {
      toastError('Naziv kampanje je obavezan.');
      return;
    }
    setSubmitting(true);
    try {
      const url =
        editingId != null ? `/api/hotspot/campaigns/${editingId}` : '/api/hotspot/campaigns';
      const method = editingId != null ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { success?: boolean; error?: string };
      if (json.success) {
        toastSuccess(editingId != null ? 'Kampanja ažurirana.' : 'Kampanja kreirana.');
        setModalOpen(false);
        await onReloadCampaigns();
        return;
      }
      toastError(typeof json.error === 'string' ? json.error : `Greška ${res.status}`);
    } catch {
      toastError('Mrežna greška pri spremanju.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/hotspot/campaigns/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
        cache: 'no-store',
      });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (res.ok && json.success) {
        toastSuccess('Kampanja obrisana.');
        setDeleteTarget(null);
        await onReloadCampaigns();
        return;
      }
      toastError(typeof json.error === 'string' ? json.error : 'Brisanje nije uspjelo.');
    } catch {
      toastError('Mrežna greška pri brisanju.');
    } finally {
      setDeleting(false);
    }
  };

  const sorted = React.useMemo(
    () => [...campaigns].sort((a, b) => a.name.localeCompare(b.name)),
    [campaigns]
  );

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Marketinške kampanje</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-2xl">
              Evidencija kampanja po klijentu i periodu (informativno). Ne utiče na prikaz na portalu — služi
              organizaciji i UTM slug-u.
            </p>
          </div>
          <Button type="button" onClick={openCreate} disabled={submitting}>
            <Plus className="w-4 h-4 mr-2" />
            Nova kampanja
          </Button>
        </div>

        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">
              <tr>
                <th className="px-3 py-2">Naziv</th>
                <th className="px-3 py-2">Klijent</th>
                <th className="px-3 py-2">Period</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Aktivno</th>
                <th className="px-3 py-2 text-right">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                    Nema kampanja. Kreirajte prvu za evidenciju i povezivanje s klijentom.
                  </td>
                </tr>
              ) : (
                sorted.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/80">
                    <td className="px-3 py-2 font-medium text-gray-900">{c.name}</td>
                    <td className="px-3 py-2 text-gray-700">
                      {c.client?.name ?? (c.client_id ? `#${c.client_id}` : '—')}
                    </td>
                    <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{formatPeriod(c)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-violet-800">{c.slug}</td>
                    <td className="px-3 py-2">{c.is_active === false ? 'Ne' : 'Da'}</td>
                    <td className="px-3 py-2 text-right space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => openEdit(c)}
                        title="Uredi"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => setDeleteTarget(c)}
                        title="Obriši"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingId != null ? 'Uredi kampanju' : 'Nova kampanja'}
        size="md"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={submitting}>
              Odustani
            </Button>
            <Button type="button" onClick={() => void save()} disabled={submitting}>
              {submitting ? '…' : 'Spremi'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <Input
            label="Naziv"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="npr. Ljetna promocija 2026"
          />
          <Input
            label="Slug (UTM campaign)"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="auto iz naziva ako ostavite prazno"
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Klijent (CRM)</label>
            <select
              className="w-full border border-gray-200 rounded-md px-2 py-2 text-sm bg-white"
              value={form.client_id}
              onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
            >
              <option value="">— bez klijenta —</option>
              {crmClients.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.name}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            label="Napomene"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Interne napomene…"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Datum početka"
                type="date"
                value={form.campaign_start_date}
                onChange={(e) => setForm((f) => ({ ...f, campaign_start_date: e.target.value }))}
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.start_include_time}
                  onChange={(e) => setForm((f) => ({ ...f, start_include_time: e.target.checked }))}
                />
                Uključi vrijeme
              </label>
              {form.start_include_time ? (
                <Input
                  className="mt-2"
                  type="time"
                  value={form.campaign_start_time}
                  onChange={(e) => setForm((f) => ({ ...f, campaign_start_time: e.target.value }))}
                />
              ) : null}
            </div>
            <div>
              <Input
                label="Datum kraja"
                type="date"
                value={form.campaign_end_date}
                onChange={(e) => setForm((f) => ({ ...f, campaign_end_date: e.target.value }))}
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.end_include_time}
                  onChange={(e) => setForm((f) => ({ ...f, end_include_time: e.target.checked }))}
                />
                Uključi vrijeme
              </label>
              {form.end_include_time ? (
                <Input
                  className="mt-2"
                  type="time"
                  value={form.campaign_end_time}
                  onChange={(e) => setForm((f) => ({ ...f, campaign_end_time: e.target.value }))}
                />
              ) : null}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Aktivna kampanja (vidljiva u listama i portalu kao aktivna)
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={deleteTarget != null}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Obrisati kampanju?"
        size="sm"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Odustani
            </Button>
            <Button type="button" variant="danger" onClick={() => void confirmDelete()} disabled={deleting}>
              {deleting ? '…' : 'Obriši'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          {deleteTarget
            ? `Kampanja „${deleteTarget.name}” bit će uklonjena. Povezani kreativi zadržat će sadržaj, a polje kampanje će se isprazniti.`
            : null}
        </p>
      </Modal>
    </div>
  );
}
