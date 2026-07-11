export type { UserId } from './shared/users';
import type { UserId } from './shared/users';

export type Category = '食品' | '日用品' | 'その他';
export const CATEGORIES: Category[] = ['食品', '日用品', 'その他'];
export const CATEGORY_EMOJI: Record<Category, string> = {
  '食品': '🍚', '日用品': '🧴', 'その他': '📦',
};

// 在庫ステータス: ok=ある → low=切れそう → buy=買う
export type StockStatus = 'ok' | 'low' | 'buy';
export const STATUS_CONFIG: Record<StockStatus, { label: string; badge: string; next: StockStatus }> = {
  ok:  { label: 'ある',     badge: 'bg-emerald-100 text-emerald-700', next: 'low' },
  low: { label: '切れそう', badge: 'bg-amber-100 text-amber-700',     next: 'buy' },
  buy: { label: '買う',     badge: 'bg-rose-100 text-rose-700',       next: 'ok'  },
};

export interface StockItem {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  status: StockStatus;
  memo: string | null;
  lastBoughtAt: string | null;  // YYYY-MM-DD
  lastPrice: number | null;
  updatedBy: UserId;
  createdAt: number;
  updatedAt: number;
}

export const EMOJI_CHOICES = [
  '🍚','🥛','🥚','🍞','🧻','🧴','🧼','🪥','🧺','🧹','💊','🍫','☕','🍜','🥤',
  '🧂','🫙','🍳','🧀','🥬','🍌','🧊','🔋','💡','🗑️','🐶','✨','📦',
];
