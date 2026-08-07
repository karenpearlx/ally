'use client';

import { useEffect, useState } from 'react';
import { Empty, ErrorState, Panel } from './ui';

type Item = { id: string; name: string; description?: string | null };
type Payload = { categories: Item[]; tags: Item[] };

export default function CategoriesManager() {
  const [data, setData] = useState<Payload | null>(null);
  const [kind, setKind] = useState<'category' | 'tag'>('category');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError(null);
    const response = await fetch('/api/admin/categories', { credentials: 'same-origin' });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error ?? 'Could not load categories.');
    setData(payload);
  };

  useEffect(() => {
    void Promise.resolve().then(load).catch((cause) => setError(cause instanceof Error ? cause.message : 'Could not load categories.'));
  }, []);

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setBusy(true); setError(null);
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ kind, name, description: kind === 'category' ? description : undefined }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? 'Could not save.');
      setName(''); setDescription(''); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save.'); }
    finally { setBusy(false); }
  };

  const remove = async (item: Item, itemKind: 'category' | 'tag') => {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    setBusy(true); setError(null);
    try {
      const response = await fetch(`/api/admin/categories/${item.id}?kind=${itemKind}`, { method: 'DELETE', credentials: 'same-origin' });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? 'Could not delete.');
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not delete.'); }
    finally { setBusy(false); }
  };

  return (
    <Panel title="Managed categories and tags" hint="These are curated labels you control, separate from skills scraped from listings.">
      <form onSubmit={add} className="grid gap-3 sm:grid-cols-[9rem_1fr_auto]">
        <select className="ad-input" value={kind} onChange={(event) => setKind(event.target.value as 'category' | 'tag')} aria-label="Content type">
          <option value="category">Category</option><option value="tag">Tag</option>
        </select>
        <input className="ad-input" value={name} onChange={(event) => setName(event.target.value)} placeholder={kind === 'category' ? 'e.g. Executive support' : 'e.g. Notion'} aria-label="Name" />
        <button className="ad-btn" data-variant="primary" disabled={busy || !name.trim()}>{busy ? 'Saving…' : 'Add'}</button>
        {kind === 'category' ? <input className="ad-input sm:col-start-2" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Short description, optional" aria-label="Description" /> : null}
      </form>
      {error ? <div className="mt-4"><ErrorState message={error} /></div> : null}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {(['category', 'tag'] as const).map((itemKind) => {
          const rows = itemKind === 'category' ? data?.categories ?? [] : data?.tags ?? [];
          return <div key={itemKind}><p className="ad-micro">{itemKind === 'category' ? 'Categories' : 'Tags'}</p>
            <div className="mt-2 space-y-2">{rows.length ? rows.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 border-b py-2" style={{ borderColor: 'var(--color-line)' }}><div><p className="text-sm font-semibold">{item.name}</p>{item.description ? <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>{item.description}</p> : null}</div><button type="button" className="ad-btn" data-variant="danger" disabled={busy} onClick={() => void remove(item, itemKind)}>Delete</button></div>) : <Empty>None yet.</Empty>}</div>
          </div>;
        })}
      </div>
    </Panel>
  );
}
