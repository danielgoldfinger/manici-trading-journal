import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

const EMOTIONS = ['FOMO', 'Fear', 'Frustration', 'Greed', 'Hesitation', 'Overconfidence', 'Relief', 'Other'];
const BUCKET = 'journal-images';

function etNow() {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'America/New_York',
  });
}

function EventImage({ path, onRemove }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
      .then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [path]);

  if (!url) return <div className="h-12 w-12 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />;
  return (
    <div className="relative inline-block">
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt="" className="h-12 w-12 rounded border border-gray-200 object-cover dark:border-gray-700" />
      </a>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(path)}
          className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
        >✕</button>
      )}
    </div>
  );
}

export default function EmotionalEventLogger({ events = [], onAdd, onRemove, onEdit, journalDate, onUpdateImages }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ time: etNow(), emotion: 'FOMO', trigger: '', images: [] });
  const [editForm, setEditForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const editFileRef = useRef(null);

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newPaths = [];
      for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        const path = `${user.id}/${journalDate}/events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file);
        if (!error) newPaths.push(path);
      }
      setForm(p => ({ ...p, images: [...p.images, ...newPaths] }));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function removeFormImage(path) {
    supabase.storage.from(BUCKET).remove([path]);
    setForm(p => ({ ...p, images: p.images.filter(i => i !== path) }));
  }

  function handleAdd() {
    if (!form.trigger.trim()) return;
    onAdd(form);
    setForm({ time: etNow(), emotion: 'FOMO', trigger: '', images: [] });
    setOpen(false);
  }

  async function removeEventImage(eventId, path) {
    await supabase.storage.from(BUCKET).remove([path]);
    onUpdateImages?.(eventId, path);
  }

  function startEdit(e) {
    setEditingId(e.id);
    setEditForm({ time: e.time, emotion: e.emotion, trigger: e.trigger, images: e.images ?? [] });
  }

  function cancelEdit() { setEditingId(null); setEditForm(null); }

  async function saveEdit(id) {
    await onEdit?.(id, editForm);
    setEditingId(null);
    setEditForm(null);
  }

  async function handleEditFileSelect(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newPaths = [];
      for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        const path = `${user.id}/${journalDate}/events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file);
        if (!error) newPaths.push(path);
      }
      setEditForm(p => ({ ...p, images: [...p.images, ...newPaths] }));
    } finally {
      setUploading(false);
      if (editFileRef.current) editFileRef.current.value = '';
    }
  }

  function removeEditFormImage(path) {
    supabase.storage.from(BUCKET).remove([path]);
    setEditForm(p => ({ ...p, images: p.images.filter(i => i !== path) }));
  }

  const inputClass = 'w-full rounded border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-900';

  return (
    <div className="space-y-2">
      {events.map(e => (
        <div key={e.id} className="rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-800">
          {editingId === e.id && editForm ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-xs text-gray-500">Time (ET)</span>
                  <input type="time" value={editForm.time} onChange={ev => setEditForm(p => ({ ...p, time: ev.target.value }))} className={inputClass} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-gray-500">Emotion</span>
                  <select value={editForm.emotion} onChange={ev => setEditForm(p => ({ ...p, emotion: ev.target.value }))} className={inputClass}>
                    {EMOTIONS.map(em => <option key={em} value={em}>{em}</option>)}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">What triggered it?</span>
                <textarea rows={2} value={editForm.trigger} onChange={ev => setEditForm(p => ({ ...p, trigger: ev.target.value }))} className={inputClass} />
              </label>
              <div>
                {editForm.images?.length > 0 && (
                  <div className="mb-1.5 flex flex-wrap gap-1.5">
                    {editForm.images.map(p => <EventImage key={p} path={p} onRemove={removeEditFormImage} />)}
                  </div>
                )}
                <input ref={editFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleEditFileSelect} />
                <button type="button" onClick={() => editFileRef.current?.click()} disabled={uploading} className="rounded border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-500 hover:border-purple-400 disabled:opacity-50 dark:border-gray-700">
                  {uploading ? 'Uploading…' : '+ Image'}
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveEdit(e.id)} className="rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white">Save</button>
                <button onClick={cancelEdit} className="rounded border border-gray-300 px-3 py-1.5 text-xs dark:border-gray-700">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">{e.emotion}</span>
                <span className="mx-1.5 text-xs text-gray-400">{e.time} ET</span>
                <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">{e.trigger}</p>
                {e.images?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {e.images.map(path => (
                      <EventImage key={path} path={path} onRemove={p => removeEventImage(e.id, p)} />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => startEdit(e)} className="text-xs text-gray-400 hover:text-purple-500">Edit</button>
                <button onClick={() => onRemove(e.id)} className="text-xs text-gray-400 hover:text-red-500">✕</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {open ? (
        <div className="space-y-2 rounded-lg border border-purple-200 p-3 dark:border-purple-800">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-xs text-gray-500">Time (ET)</span>
              <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-gray-500">Emotion</span>
              <select value={form.emotion} onChange={e => setForm(p => ({ ...p, emotion: e.target.value }))} className={inputClass}>
                {EMOTIONS.map(em => <option key={em} value={em}>{em}</option>)}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs text-gray-500">What triggered it?</span>
            <textarea
              rows={2}
              value={form.trigger}
              onChange={e => setForm(p => ({ ...p, trigger: e.target.value }))}
              className={inputClass}
              placeholder="Price ran without me, missed the entry, revenge trade urge..."
            />
          </label>
          {/* Images for this event */}
          <div>
            <span className="mb-1 block text-xs text-gray-500">Attach image (optional)</span>
            {form.images.length > 0 && (
              <div className="mb-1.5 flex flex-wrap gap-1.5">
                {form.images.map(p => <EventImage key={p} path={p} onRemove={removeFormImage} />)}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-500 hover:border-purple-400 hover:text-purple-600 disabled:opacity-50 dark:border-gray-700"
            >
              {uploading ? 'Uploading…' : '+ Image'}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.trigger.trim()} className="rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50">Add</button>
            <button onClick={() => setOpen(false)} className="rounded border border-gray-300 px-3 py-1.5 text-xs dark:border-gray-700">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => { setForm(p => ({ ...p, time: etNow() })); setOpen(true); }}
          className="rounded border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 dark:border-gray-700 dark:hover:border-purple-600"
        >
          + Add emotional event
        </button>
      )}
    </div>
  );
}
