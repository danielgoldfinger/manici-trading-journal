import { useSearchParams } from 'react-router-dom';
import TradeForm from '../components/trade/TradeForm';

export default function Log() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id') ?? null;

  return (
    <div>
      <h1 className="mb-6 text-lg font-semibold">
        {editId ? 'Edit trade' : 'Log trade'}
      </h1>
      <TradeForm tradeId={editId} key={editId ?? 'new'} />
    </div>
  );
}
