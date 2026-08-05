import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

const BUCKET = 'journal-images';

async function getSignedUrl(path) {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

function Thumbnail({ path, onRemove }) {
  const [url, setUrl] = useState(null);
  useEffect(() => { getSignedUrl(path).then(setUrl); }, [path]);

  if (!url) return (
    <div className="h-20 w-20 animate-pulse rounded border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800" />
  );

  return (
    <div className="relative inline-block">
      <a href={url} target="_blank" rel="noreferrer">
        <img src={url} alt="" className="h-20 w-20 rounded border border-gray-200 object-cover dark:border-gray-700" />
      </a>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(path)}
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow hover:bg-red-600"
          aria-label="Remove image"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default function JournalImageUpload({ journalDate, section, paths = [], onPathsChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  async function handleFiles(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newPaths = [];
      for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        const path = `${user.id}/${journalDate}/${section}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: err } = await supabase.storage.from(BUCKET).upload(path, file);
        if (err) throw err;
        newPaths.push(path);
      }
      onPathsChange([...paths, ...newPaths]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleRemove(path) {
    await supabase.storage.from(BUCKET).remove([path]);
    onPathsChange(paths.filter(p => p !== path));
  }

  return (
    <div className="space-y-2">
      {paths.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {paths.map(p => <Thumbnail key={p} path={p} onRemove={handleRemove} />)}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:border-purple-400 hover:text-purple-600 disabled:opacity-50 dark:border-gray-700 dark:hover:border-purple-600"
        >
          {uploading ? 'Uploading…' : '+ Attach image'}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}
