import { useState } from 'react';
import type { StockItem } from '../types';

type Props = {
  item: StockItem;
  onConfirm: (price: number | null, recordToSetsu: boolean) => void;
  onClose: () => void;
};

// 「買った」→ 金額入力（任意）→ SE.TSU記帳
export default function BuyModal({ item, onConfirm, onClose }: Props) {
  const [priceStr, setPriceStr] = useState(item.lastPrice != null ? String(item.lastPrice) : '');
  const [record, setRecord] = useState(true);
  const price = priceStr.trim() === '' ? null : Number(priceStr);
  const priceValid = price === null || (Number.isFinite(price) && price >= 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <h2 className="font-bold text-gray-900 text-lg mb-1">{item.emoji} {item.name} を買った！</h2>
        <p className="text-xs text-gray-400 mb-4">在庫を「ある」に戻します</p>

        <label className="block text-xs font-bold text-gray-500 mb-1">金額（任意）</label>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-gray-400 font-bold">¥</span>
          <input
            value={priceStr}
            onChange={e => setPriceStr(e.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric"
            placeholder={item.lastPrice != null ? `前回 ¥${item.lastPrice.toLocaleString()}` : '0'}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
            autoFocus
          />
        </div>

        <button
          onClick={() => setRecord(r => !r)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 mb-5"
        >
          <span className="text-sm text-gray-600">🧾 SE.TSU（共同財布）に記帳する</span>
          <span className={`w-10 h-6 rounded-full relative transition-colors ${record && price ? 'bg-teal-500' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${record && price ? 'left-[18px]' : 'left-0.5'}`} />
          </span>
        </button>
        {record && !price && <p className="text-[11px] text-amber-600 -mt-3 mb-4">※ 金額を入れると記帳されます</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500 bg-gray-100">キャンセル</button>
          <button
            onClick={() => priceValid && onConfirm(price, record && !!price)}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-teal-500"
          >
            買った！
          </button>
        </div>
      </div>
    </div>
  );
}
