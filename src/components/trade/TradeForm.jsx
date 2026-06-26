import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CHECKLISTS, computeScore, MISTAKE_FLAGS } from '../../lib/score';
import { getRecommendedContracts, DOWNSIZE_RULES } from '../../lib/sizing';
import { useSettings } from '../../hooks/useSettings';
import { useTrades } from '../../hooks/useTrades';
import { useDailyPlan } from '../../hooks/useDailyPlan';
import Checklist from '../checklist/Checklist';
import VerdictBar from '../checklist/VerdictBar';
import SizingPanel from './SizingPanel';

// All 14 DB column slots, defaulted false — covers every setup type's checklist.
const ALL_CHECK_IDS = [...new Set(Object.values(CHECKLISTS).flatMap((list) => list.map((c) => c.id)))];
const emptyChecks = ALL_CHECK_IDS.reduce((acc, id) => ({ ...acc, [id]: false }), {});

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  entry_time: '',
  setup_type: 'FB',
  flush_depth: 'shallow',
  fb_level: '',
  entry_price: '',
  stop_price: '',
  t1_price: '',
  exit_price: '',
  result: 'open',
  pnl_points: '',
  actual_contracts: '',
  runner_hit: false,
  runner_points: '',
  thesis: '',
  post_review: '',
  mistake_flag: '',
  plan_id: null,
  plan_level_price: '',
};

export default function TradeForm({ tradeId = null }) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { createTrade, updateTrade, getTrade } = useTrades();
  const { plan, loadPlan } = useDailyPlan();

  const [form, setForm] = useState(emptyForm);
  const [checks, setChecks] = useState(emptyChecks);
  const [adjustments, setAdjustments] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tradeId) return;
    getTrade(tradeId).then((trade) => {
      setForm({
        date: trade.date ?? emptyForm.date,
        entry_time: trade.entry_time ?? '',
        setup_type: trade.setup_type ?? 'FB',
        flush_depth: trade.flush_depth ?? 'shallow',
        fb_level: trade.fb_level ?? '',
        entry_price: trade.entry_price ?? '',
        stop_price: trade.stop_price ?? '',
        t1_price: trade.t1_price ?? '',
        exit_price: trade.exit_price ?? '',
        result: trade.result ?? 'open',
        pnl_points: trade.pnl_points ?? '',
        actual_contracts: trade.actual_contracts ?? '',
        runner_hit: trade.runner_hit ?? false,
        runner_points: trade.runner_points ?? '',
        thesis: trade.thesis ?? '',
        post_review: trade.post_review ?? '',
        mistake_flag: trade.mistake_flag ?? '',
        plan_id: trade.plan_id ?? null,
        plan_level_price: trade.plan_level_price ?? '',
      });
      const loadedChecks = {};
      ALL_CHECK_IDS.forEach((id) => {
        loadedChecks[id] = !!trade[id];
      });
      setChecks(loadedChecks);
    });
  }, [tradeId]);

  useEffect(() => {
    if (form.date) loadPlan(form.date);
  }, [form.date, loadPlan]);

  const planLevels = useMemo(() => {
    if (!plan) return [];
    return (plan.direct_bid_levels ?? []).map((l) => ({
      price: l.price,
      label: `${l.price} — ${l.type}${l.condition ? `: ${l.condition}` : ''}`,
    }));
  }, [plan]);

  function selectPlanLevel(priceStr) {
    const price = priceStr === '' ? '' : parseFloat(priceStr);
    setForm((prev) => ({
      ...prev,
      fb_level: price,
      plan_level_price: price,
      plan_id: priceStr === '' ? null : plan?.id ?? null,
    }));
  }

  const score = useMemo(() => computeScore(checks, form.setup_type), [checks, form.setup_type]);
  const accountBalance = settings?.account_balance ?? 11600;

  const recommendedContracts = useMemo(() => {
    const base = getRecommendedContracts(accountBalance, score);
    if (base === 0) return 0;
    const totalAdjustment = DOWNSIZE_RULES.reduce(
      (sum, rule) => sum + (adjustments[rule.id] ? rule.adjustment : 0),
      0
    );
    return Math.max(1, base + totalAdjustment);
  }, [accountBalance, score, adjustments]);

  // Auto-calculate P&L from entry/exit unless user has manually overridden it
  useEffect(() => {
    if (form.entry_price !== '' && form.exit_price !== '') {
      const computed = (parseFloat(form.exit_price) - parseFloat(form.entry_price)).toFixed(2);
      setForm((prev) => (prev.pnl_points === '' || prev._autoFilled !== false ? { ...prev, pnl_points: computed, _autoFilled: true } : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.entry_price, form.exit_price]);

  function update(field, value) {
    if (field === 'setup_type') setChecks(emptyChecks);
    setForm((prev) => ({ ...prev, [field]: value, ...(field === 'pnl_points' ? { _autoFilled: false } : {}) }));
  }

  function toggleCheck(id) {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleAdjustment(id) {
    setAdjustments((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const numericFields = ['fb_level', 'entry_price', 'stop_price', 't1_price', 'exit_price', 'pnl_points', 'runner_points', 'plan_level_price'];
    const payload = { ...form };
    delete payload._autoFilled;
    numericFields.forEach((f) => {
      payload[f] = payload[f] === '' ? null : parseFloat(payload[f]);
    });
    payload.actual_contracts = payload.actual_contracts === '' ? null : parseInt(payload.actual_contracts, 10);
    payload.entry_time = payload.entry_time === '' ? null : payload.entry_time;
    payload.mistake_flag = payload.mistake_flag === '' ? null : payload.mistake_flag;

    payload.setup_score = score;
    payload.recommended_contracts = recommendedContracts;
    Object.assign(payload, checks);

    try {
      if (tradeId) {
        await updateTrade(tradeId, payload);
      } else {
        await createTrade(payload);
      }
      navigate('/journal');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <VerdictBar checks={checks} setupType={form.setup_type} depth={form.flush_depth} accountBalance={accountBalance} />

      <section className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-2 dark:border-gray-800">
        <Field label="Date">
          <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} required className={inputClass} />
        </Field>
        <Field label="Entry time">
          <input type="time" value={form.entry_time} onChange={(e) => update('entry_time', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Setup type">
          <select value={form.setup_type} onChange={(e) => update('setup_type', e.target.value)} className={inputClass}>
            <option value="FB">Failed Breakdown</option>
            <option value="LR">Level Reclaim</option>
            <option value="BT">Back-test</option>
            <option value="BD">Breakdown Short</option>
          </select>
        </Field>
        <Field label="Flush depth">
          <select value={form.flush_depth} onChange={(e) => update('flush_depth', e.target.value)} className={inputClass}>
            <option value="shallow">Shallow (&lt;20pts)</option>
            <option value="deep">Deep (&gt;20pts)</option>
          </select>
        </Field>
        <Field label={KEY_LEVEL_LABELS[form.setup_type] ?? 'Key level'}>
          <input type="number" step="0.25" value={form.fb_level} onChange={(e) => update('fb_level', e.target.value)} className={inputClass} />
          {planLevels.length > 0 && (
            <select
              value={form.plan_level_price}
              onChange={(e) => selectPlanLevel(e.target.value)}
              className={`${inputClass} mt-1`}
            >
              <option value="">Pick from today's plan…</option>
              {planLevels.map((l) => (
                <option key={l.price} value={l.price}>{l.label}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Entry price">
          <input type="number" step="0.25" value={form.entry_price} onChange={(e) => update('entry_price', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Stop price">
          <input type="number" step="0.25" value={form.stop_price} onChange={(e) => update('stop_price', e.target.value)} className={inputClass} />
        </Field>
        <Field label="T1 price">
          <input type="number" step="0.25" value={form.t1_price} onChange={(e) => update('t1_price', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Exit price">
          <input type="number" step="0.25" value={form.exit_price} onChange={(e) => update('exit_price', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Result">
          <select value={form.result} onChange={(e) => update('result', e.target.value)} className={inputClass}>
            <option value="open">Open</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
            <option value="be">Break-even</option>
          </select>
        </Field>
        <Field label="P&L (points)">
          <input type="number" step="0.25" value={form.pnl_points} onChange={(e) => update('pnl_points', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Actual contracts">
          <input type="number" value={form.actual_contracts} onChange={(e) => update('actual_contracts', e.target.value)} className={inputClass} />
        </Field>

        {form.result === 'win' && (
          <>
            <Field label="Runner hit">
              <input type="checkbox" checked={form.runner_hit} onChange={(e) => update('runner_hit', e.target.checked)} className="h-4 w-4 accent-purple-600" />
            </Field>
            {form.runner_hit && (
              <Field label="Runner points">
                <input type="number" step="0.25" value={form.runner_points} onChange={(e) => update('runner_points', e.target.value)} className={inputClass} />
              </Field>
            )}
          </>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Sizing</h2>
        <SizingPanel
          score={score}
          accountBalance={accountBalance}
          adjustments={adjustments}
          onToggleAdjustment={toggleAdjustment}
          actualContracts={form.actual_contracts === '' ? null : form.actual_contracts}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Checklist</h2>
        <Checklist checks={checks} onToggle={toggleCheck} setupType={form.setup_type} />
      </section>

      <section className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <Field label="Pre-trade thesis">
          <textarea rows={3} value={form.thesis} onChange={(e) => update('thesis', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Post-trade review">
          <textarea rows={3} value={form.post_review} onChange={(e) => update('post_review', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Mistake flag">
          <select value={form.mistake_flag} onChange={(e) => update('mistake_flag', e.target.value)} className={inputClass}>
            <option value="">None</option>
            {MISTAKE_FLAGS.map((flag) => (
              <option key={flag} value={flag}>{flag}</option>
            ))}
          </select>
        </Field>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {saving ? 'Saving…' : tradeId ? 'Update trade' : 'Save trade'}
      </button>
    </form>
  );
}

const inputClass = 'w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900';

const KEY_LEVEL_LABELS = {
  FB: 'FB level',
  LR: 'Shelf level',
  BT: 'Breakout/zone level',
  BD: 'Short level',
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      {children}
    </label>
  );
}
