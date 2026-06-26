import { useState } from 'react';
import { useWebull } from '../../hooks/useWebull';
import { getAccountList } from '../../lib/webull';
import AccountWidget from './AccountWidget';
import SyncButton from './SyncButton';

export default function WebullConnect({ settings, onUpdateSettings }) {
  const { account, positions, fetchAccountData, syncTrades, syncing, unmatched, lastSynced, error } = useWebull();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const connected = settings?.webull_connected ?? false;

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      await getAccountList();
      await onUpdateSettings({ webull_connected: true });
      await fetchAccountData();
      setTestResult('success');
    } catch (err) {
      setTestResult(err.message);
    } finally {
      setTesting(false);
    }
  }

  async function handleDisconnect() {
    await onUpdateSettings({ webull_connected: false });
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Webull connection</h2>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${
          connected
            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
        }`}>
          {connected ? 'Connected' : 'Not connected'}
        </span>
      </div>

      <p className="text-xs text-gray-400">
        App Key and App Secret are configured server-side as Supabase Edge Function secrets — never entered here.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={handleTestConnection}
          disabled={testing}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 disabled:opacity-50"
        >
          {testing ? 'Testing…' : 'Test connection'}
        </button>
        {connected && (
          <button onClick={handleDisconnect} className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-600 dark:border-red-800">
            Disconnect
          </button>
        )}
      </div>

      {testResult === 'success' && <p className="text-sm text-green-600">Connection successful.</p>}
      {testResult && testResult !== 'success' && <p className="text-sm text-red-600">{testResult}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {connected && (
        <>
          <AccountWidget account={account} positions={positions} />
          <SyncButton onSync={syncTrades} syncing={syncing} lastSynced={lastSynced} unmatched={unmatched} />
        </>
      )}
    </div>
  );
}
