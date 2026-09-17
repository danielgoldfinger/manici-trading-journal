import { useState } from 'react';

const CATEGORIES = [
  'Risk Management', 'Psychology', 'Process', 'Execution',
  'Market Structure', 'Mindset', 'Discipline', 'Other',
];

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900';

export default function PrincipleForm({ initial = {}, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    title:          initial.title          ?? '',
    body:           initial.body           ?? '',
    category:       initial.category       ?? '',
    display_number: initial.display_number ?? '',
    pinned:         initial.pinned         ?? false,
  });

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      display_number: form.display_number === '' ? null : parseInt(form.display_number, 10),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Title *</span>
            <input
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className={inputClass}
              placeholder="e.g. Never average into a losing position"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Category</span>
          <select value={form.category} onChange={e => set('category', e.target.value)} className={inputClass}>
            <option value="">— None —</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Number (for ordered list view)</span>
          <input
            type="number"
            min="1"
            value={form.display_number}
            onChange={e => set('display_number', e.target.value)}
            className={inputClass}
            placeholder="e.g. 1"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">Body</span>
        <textarea
          rows={5}
          value={form.body}
          onChange={e => set('body', e.target.value)}
          className={inputClass}
          placeholder="Explain the principle in your own words — the reasoning behind it, when it applies, how you've seen it play out."
        />
      </label>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={form.pinned}
          onChange={e => set('pinned', e.target.checked)}
          className="h-4 w-4 accent-purple-600"
        />
        <span className="text-sm">Pin to top</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : initial.id ? 'Update' : 'Add principle'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
