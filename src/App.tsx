import { useEffect, useMemo, useState } from 'react';
import type { StockItem, StockStatus, UserId } from './types';
import { CATEGORIES, CATEGORY_EMOJI, STATUS_CONFIG } from './types';
import { subscribeItems, saveItem, updateItem, deleteItem, recordPurchaseToSetsu } from './utils/storage';
import { loadUser, saveUser, USERS, USER_IDS, other } from './shared/users';
import { writeNotification } from './shared/notify';
import { localDateStr } from './shared/date';
import ItemFormModal from './components/ItemFormModal';
import BuyModal from './components/BuyModal';

type Tab = 'buy' | 'stock';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserId | null>(() => loadUser());
  const [items, setItems] = useState<StockItem[]>([]);
  const [tab, setTab] = useState<Tab>('buy');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<StockItem | undefined>(undefined);
  const [buyItem, setBuyItem] = useState<StockItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => subscribeItems(setItems), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const buyList = useMemo(() => items.filter(i => i.status === 'buy').sort((a, b) => b.updatedAt - a.updatedAt), [items]);
  const lowList = useMemo(() => items.filter(i => i.status === 'low').sort((a, b) => b.updatedAt - a.updatedAt), [items]);

  if (!currentUser) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6">
        <div className="text-6xl mb-3">🧺</div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent mb-1">STOCK</h1>
        <p className="text-gray-400 text-sm mb-8">買い物リスト＆日用品在庫</p>
        <p className="text-gray-500 text-sm font-medium mb-4">どちらで使いますか？</p>
        <div className="flex gap-4 w-full max-w-xs">
          {USER_IDS.map(u => (
            <button
              key={u}
              onClick={() => { saveUser(u); setCurrentUser(u); }}
              className="flex-1 bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-2 active:scale-95 transition-transform"
            >
              <span className="text-3xl">{USERS[u].emoji}</span>
              <span className="font-bold text-gray-900">{USERS[u].name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const cycleStatus = async (item: StockItem) => {
    const next: StockStatus = STATUS_CONFIG[item.status].next;
    await updateItem(item.id, { status: next, updatedBy: currentUser });
    if (next === 'buy') {
      writeNotification({
        toUser: other(currentUser),
        fromApp: 'stock',
        type: 'stock_need_buy',
        title: `🧺 買うものリストに追加`,
        body: `${item.emoji} ${item.name}（${USERS[currentUser].name}）`,
        linkedUrl: 'https://RESET3911.github.io/STOCK/',
        linkedId: item.id,
      }).catch(() => {});
    }
  };

  const handleBought = async (item: StockItem, price: number | null, record: boolean) => {
    await updateItem(item.id, {
      status: 'ok',
      lastBoughtAt: localDateStr(),
      lastPrice: price ?? item.lastPrice,
      updatedBy: currentUser,
    });
    if (record && price) {
      await recordPurchaseToSetsu(item, price, currentUser).catch(() => {});
      setToast('SE.TSUに記帳しました 🧾');
    } else {
      setToast('買い物おつかれさま！');
    }
    setBuyItem(null);
  };

  const handleSave = async (item: StockItem) => {
    const isNew = !items.some(i => i.id === item.id);
    await saveItem(item);
    setShowForm(false);
    setEditItem(undefined);
    if (isNew && item.status === 'buy') {
      writeNotification({
        toUser: other(currentUser),
        fromApp: 'stock',
        type: 'stock_added',
        title: `🧺 買うものが追加されました`,
        body: `${item.emoji} ${item.name}（${USERS[currentUser].name}）`,
        linkedUrl: 'https://RESET3911.github.io/STOCK/',
        linkedId: item.id,
      }).catch(() => {});
    }
  };

  const ItemRow = ({ item, showBuyBtn }: { item: StockItem; showBuyBtn?: boolean }) => (
    <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
      <span className="text-2xl">{item.emoji}</span>
      <button className="flex-1 min-w-0 text-left" onClick={() => { setEditItem(item); setShowForm(true); }}>
        <div className="text-sm font-bold text-gray-900 truncate">{item.name}</div>
        <div className="text-[11px] text-gray-400">
          {item.category}
          {item.memo ? ` · ${item.memo}` : ''}
          {item.lastBoughtAt ? ` · 前回 ${item.lastBoughtAt.slice(5).replace('-', '/')}` : ''}
        </div>
      </button>
      <button
        onClick={() => cycleStatus(item)}
        className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${STATUS_CONFIG[item.status].badge}`}
      >
        {STATUS_CONFIG[item.status].label}
      </button>
      {showBuyBtn && (
        <button
          onClick={() => setBuyItem(item)}
          className="text-xs font-bold text-white bg-teal-500 rounded-full px-3.5 py-2 active:scale-95 transition-transform"
        >
          買った
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-dvh max-w-md mx-auto px-4 pb-32 pt-14">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">🧺 STOCK</h1>
          <p className="text-[11px] text-gray-400">買い物リスト＆在庫</p>
        </div>
        <span className="text-xs font-bold text-teal-700 bg-teal-100 px-3 py-1.5 rounded-full">{USERS[currentUser].name}</span>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-1 shadow-sm mb-4">
        {([['buy', `🛒 買うもの${buyList.length > 0 ? ` (${buyList.length})` : ''}`], ['stock', '📦 在庫']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors ${tab === t ? 'bg-teal-500 text-white' : 'text-gray-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'buy' && (
        <div className="space-y-2">
          {buyList.length === 0 && lowList.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              <div className="text-4xl mb-3 opacity-50">🎉</div>
              買うものはありません
            </div>
          )}
          {buyList.map(i => <ItemRow key={i.id} item={i} showBuyBtn />)}
          {lowList.length > 0 && (
            <>
              <p className="text-[11px] font-bold text-amber-600 pt-3 pb-1 px-1">⚠️ 切れそう</p>
              {lowList.map(i => <ItemRow key={i.id} item={i} showBuyBtn />)}
            </>
          )}
        </div>
      )}

      {tab === 'stock' && (
        <div className="space-y-4">
          {items.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">
              <div className="text-4xl mb-3 opacity-50">📦</div>
              まだアイテムがありません。<br />右下の＋から定番品を登録しましょう
            </div>
          )}
          {CATEGORIES.map(cat => {
            const catItems = items.filter(i => i.category === cat).sort((a, b) => a.name.localeCompare(b.name, 'ja'));
            if (catItems.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-[11px] font-bold text-gray-400 pb-1.5 px-1">{CATEGORY_EMOJI[cat]} {cat}</p>
                <div className="space-y-2">
                  {catItems.map(i => <ItemRow key={i.id} item={i} />)}
                </div>
              </div>
            );
          })}
          {items.length > 0 && (
            <p className="text-[10px] text-gray-300 text-center pt-2">ステータスをタップ: ある → 切れそう → 買う</p>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setEditItem(undefined); setShowForm(true); }}
        className="fixed bottom-6 right-5 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-3xl font-light shadow-lg shadow-teal-200 flex items-center justify-center active:scale-90 transition-transform"
        aria-label="アイテムを追加"
      >
        ＋
      </button>

      {showForm && currentUser && (
        <ItemFormModal
          editItem={editItem}
          currentUser={currentUser}
          onSave={handleSave}
          onDelete={async id => { await deleteItem(id); setShowForm(false); setEditItem(undefined); }}
          onClose={() => { setShowForm(false); setEditItem(undefined); }}
        />
      )}
      {buyItem && (
        <BuyModal
          item={buyItem}
          onConfirm={(price, record) => handleBought(buyItem, price, record)}
          onClose={() => setBuyItem(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
