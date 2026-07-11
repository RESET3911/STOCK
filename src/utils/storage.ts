import {
  collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, addDoc,
} from 'firebase/firestore';
import { v4 as uuid } from 'uuid';
import { db } from '../shared/firebase';
import { localDateStr } from '../shared/date';
import type { StockItem, UserId } from '../types';

const COLL = 'stock_items';

export function subscribeItems(cb: (items: StockItem[]) => void, onError?: () => void): () => void {
  return onSnapshot(collection(db, COLL),
    snap => cb(snap.docs.map(d => ({ ...(d.data() as StockItem), id: d.id }))),
    () => onError?.());
}

export async function saveItem(item: StockItem): Promise<void> {
  await setDoc(doc(db, COLL, item.id), item);
}

export async function updateItem(id: string, data: Partial<StockItem>): Promise<void> {
  await updateDoc(doc(db, COLL, id), { ...data, updatedAt: Date.now() });
}

export async function deleteItem(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL, id));
}

// 購入をSE.TSUの共同財布に記帳する（source:'stock' で重複防止・追跡可能）
export async function recordPurchaseToSetsu(item: StockItem, price: number, payer: UserId): Promise<void> {
  await addDoc(collection(db, 'setsu_transactions'), {
    id: uuid(),
    type: 'expense',
    amount: Math.round(price),
    categoryId: item.category === '食品' ? 'food' : 'daily',
    date: localDateStr(),
    scope: 'shared',
    owner: payer,
    payer,
    sourceId: null,
    memo: `${item.emoji} ${item.name}（STOCK）`,
    source: 'stock',
    linkedId: item.id,
    createdAt: Date.now(),
  });
}
