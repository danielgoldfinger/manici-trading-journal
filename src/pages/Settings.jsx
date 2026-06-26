import { useEffect, useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useDarkMode } from '../hooks/useDarkMode';
import { getContractStepSchedule, getSizingTier, getRecommendedContracts } from '../lib/sizing';
import WebullConnect from '../components/webull/WebullConnect';
import Spinner from '../components/shared/Spinner';

const TIMEZONES = ['America/Denver', 'America/New_York', 'America/Chicago', 'America/Los_Angeles'];

export default function Settings() {
  const { settings, loading, error, updateSettings } = useSettings();
  const [darkMode, setDarkMode] = useDarkMode();
  const [form, setForm] = useState(null);
  const [timezone, setTimezone] = useState(localStorage.getItem('timezone') ?? 'America/Denver');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (loading || !form) return <Spinner label="Loading settings…" />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    await updateSettings({
      account_balance: parseFloat(form.account_balance),
      base_contracts: parseInt(form.base_contracts, 10),
      instrument: form.instrument,
      risk_pct: parseFloat(form.risk_pct),
      daily_loss_limit: parseFloat(form.daily_loss_limit),
      weekly_loss_limit: parseFloat(form.weekly_loss_limit),
      monthly_loss_limit: parseFloat(form.monthly_loss_limit),
    });
    localStorage.setItem('timezone', timezone);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const schedule = getContractStepSchedule(parseFloat(form.account_balance) || 11600);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-lg font-semibold">Settings</h1>

      <form onSubmit={handleSave} className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Account</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Account balance">
            <input type="number" step="0.01" value={form.account_balance} onChange={(e) => update('account_balance', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Instrument">
            <select value={form.instrument} onChange={(e) => update('instrument', e.target.value)} className={inputClass}>
              <option value="MES">MES</option>
              <option value="ES">ES</option>
            </select>
          </Field>
          <Field label="Risk % per trade">
            <input type="number" step="0.1" value={form.risk_pct} onChange={(e) => update('risk_pct', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Base contracts">
            <input type="number" value={form.base_contracts} onChange={(e) => update('base_contracts', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Daily loss limit">
            <input type="number" step="0.01" value={form.daily_loss_limit} onChange={(e) => update('daily_loss_limit', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Weekly loss limit">
            <input type="number" step="0.01" value={form.weekly_loss_limit} onChange={(e) => update('weekly_loss_limit', e.target.value)} className={inputClass} />
          </Field>
          <Field label="Monthly drawdown limit">
            <input type="number" step="0.01" value={form.monthly_loss_limit} onChange={(e) => update('monthly_loss_limit', e.target.value)} className={inputClass} />
          </Field>
        </div>

        <h2 className="pt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Preferences</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Timezone">
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </Field>
          <Field label="Dark mode">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="h-4 w-4 accent-purple-600" />
              Enabled
            </label>
          </Field>
        </div>

        <button type="submit" className="rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
          Save settings
        </button>
        {saved && <span className="ml-3 text-sm text-green-600">Saved</span>}
      </form>

      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Sizing preview</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-gray-800">
              <th className="py-1.5 px-2">Tier</th>
              <th className="py-1.5 px-2">Contracts</th>
            </tr>
          </thead>
          <tbody>
            {[59, 65, 75, 90].map((score) => {
              const tier = getSizingTier(score);
              const contracts = getRecommendedContracts(parseFloat(form.account_balance) || 11600, score);
              return (
                <tr key={score} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-1.5 px-2">{tier.label}</td>
                  <td className="py-1.5 px-2">{contracts === 0 ? 'Pass' : contracts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <h3 className="mt-4 mb-2 text-xs font-semibold uppercase text-gray-500">Step-up schedule</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500 dark:border-gray-800">
              <th className="py-1.5 px-2">Balance</th>
              <th className="py-1.5 px-2">Contracts</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((step, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-1.5 px-2">${step.balance.toLocaleString()}</td>
                <td className="py-1.5 px-2">{step.contracts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <WebullConnect settings={settings} onUpdateSettings={updateSettings} />
    </div>
  );
}

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      {children}
    </label>
  );
}
