import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { StockItem, Category, UserId } from '../types';
import { CATEGORIES, CATEGORY_EMOJI, EMOJI_CHOICES } from '../types';

type Props = {
  editItem?: StockItem;
  currentUser: UserId;
  onSave: (item: StockItem) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
};

export default function ItemFormModal({ editItem, currentUser, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState(editItem?.name ?? '');
  const [emoji, setEmoji] = useState(editItem?.emoji ?? '📦');
  const [category, setCategory] = useState<Category>(editItem?.category ?? '食品');
  const [memo, setMemo] = useState(editItem?.memo ?? '');

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      id: editItem?.id ?? uuid(),
      name: name.trim(),
      emoji,
      category,
      status: editItem?.status ?? 'buy',
      memo: memo.trim() || null,
      lastBoughtAt: editItem?.lastBoughtAt ?? null,
      lastPrice: editItem?.lastPrice ?? null,
      updatedBy: currentUser,
      createdAt: editItem?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
        <div className="w-9 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
        <h2 className="font-bold text-gray-900 text-lg mb-4">{editItem ? 'アイテムを編集' : 'アイテムを追加'}</h2>

        <label className="block text-xs font-bold text-gray-500 mb-1">名前</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="例: トイレットペーパー"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-300"
          autoFocus={!editItem}
        />

        <label className="block text-xs font-bold text-gray-500 mb-1">カテゴリ</label>
        <div className="flex gap-2 mb-4">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${category === c ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-500 border-gray-200'}`}
            >
              {CATEGORY_EMOJI[c]} {c}
            </button>
          ))}
        </div>

        <label className="block text-xs font-bold text-gray-500 mb-1">アイコン</label>
        <div className="flex flex-wrap gap-1.5 mb-4 max-h-24 overflow-y-auto">
          {EMOJI_CHOICES.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center ${emoji === e ? 'bg-teal-100 ring-2 ring-teal-400' : 'bg-gray-50'}`}
            >
              {e}
            </button>
          ))}
        </div>

        <label className="block text-xs font-bold text-gray-500 mb-1">メモ（任意）</label>
        <input
          value={memo}
          onChange={e => setMemo(e.target.value)}
          placeholder="例: いつもの銘柄、2個パック"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-teal-300"
        />

        <div className="flex gap-2">
          {editItem && onDelete && (
            <button
              onClick={() => { if (confirm(`「${editItem.name}」を削除しますか？`)) onDelete(editItem.id); }}
              className="px-4 py-3 rounded-xl text-sm font-bold text-rose-500 bg-rose-50"
            >
              削除
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500 bg-gray-100">キャンセル</button>
          <button
            onClick={submit}
            disabled={!name.trim()}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-teal-500 disabled:opacity-40"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
