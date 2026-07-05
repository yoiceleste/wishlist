import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMonthlyBudget,
  getAnnualBudget,
  getPurchaseDecisions,
  getOwnedItems,
} from '../data/store';
import { getNewWishDraft } from '../utils/newWishDraft';
import COLORS from '../theme';

const cardStyle = {
  background: COLORS.card,
  borderRadius: COLORS.radiusCard,
  boxShadow: COLORS.shadowCard,
  padding: 20,
  marginBottom: 16,
};

function getBudgetSnapshot(budget) {
  if (!budget) return { remaining: 0, label: '未设置', color: COLORS.textSecondary };
  const total = Number(budget.total) || 0;
  const used = Number(budget.used) || 0;
  const reserved = Number(budget.reserved) || 0;
  const remaining = total - used - reserved;

  if (remaining < 0) return { remaining, label: '已超支', color: COLORS.danger };
  if (total > 0 && remaining < total * 0.2) return { remaining, label: '偏紧张', color: COLORS.warning };
  return { remaining, label: '还安心', color: COLORS.success };
}

function getInventorySummary(items) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return items.reduce(
    (summary, item) => {
      if (!item.expiryDate) return summary;
      const expiry = new Date(item.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) summary.expired += 1;
      else if (diffDays <= 60) summary.expiring += 1;
      return summary;
    },
    { expiring: 0, expired: 0 }
  );
}

function TodayOverview({ wishlistItems, monthlyBudget, ownedItems }) {
  const navigate = useNavigate();
  const today = new Date();
  const dueItems = wishlistItems.filter((item) => {
    if (!item.nextReminderDate) return false;
    return new Date(item.nextReminderDate) <= today;
  });
  const budget = getBudgetSnapshot(monthlyBudget);
  const inventory = getInventorySummary(ownedItems);

  const rows = [
    {
      icon: '⏳',
      label: dueItems.length > 0 ? `${dueItems.length} 个心愿该重新看看` : '今天没有到期提醒',
      detail: dueItems.length > 0 ? '去复盘' : '可以慢慢来',
      color: dueItems.length > 0 ? COLORS.warning : COLORS.textSecondary,
      onClick: dueItems.length > 0 ? () => navigate(`/wishlist/review/${dueItems[0].id}`) : undefined,
    },
    {
      icon: '💰',
      label: `本月还可自由消费 ¥${budget.remaining.toLocaleString()}`,
      detail: budget.label,
      color: budget.color,
      onClick: () => navigate('/budget'),
    },
    {
      icon: '📦',
      label:
        inventory.expired + inventory.expiring > 0
          ? `${inventory.expired + inventory.expiring} 件库存需要关注`
          : '库存暂无过期压力',
      detail: inventory.expired > 0 ? `${inventory.expired} 件已过期` : '查看已有',
      color: inventory.expired > 0 ? COLORS.danger : COLORS.textSecondary,
      onClick: () => navigate('/inventory'),
    },
  ];

  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>
        今天建议关注
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map((row) => (
          <button
            key={row.label}
            onClick={row.onClick}
            style={{
              width: '100%',
              border: 'none',
              background: COLORS.divider,
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textAlign: 'left',
              cursor: row.onClick ? 'pointer' : 'default',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            <span style={{ fontSize: 20 }}>{row.icon}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: COLORS.text }}>{row.label}</span>
            <span style={{ fontSize: 12, color: row.color, fontWeight: 600 }}>{row.detail}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DraftCard({ draft }) {
  const navigate = useNavigate();
  if (!draft || !draft.name) return null;

  return (
    <button
      onClick={() => navigate('/new/step1', { state: draft })}
      style={{
        ...cardStyle,
        width: '100%',
        border: `1px solid ${COLORS.primary}26`,
        background: `linear-gradient(135deg, ${COLORS.primaryLight}, #FFFFFF)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div>
        <div style={{ fontSize: 13, color: COLORS.primary, fontWeight: 700, marginBottom: 4 }}>
          继续上次草稿
        </div>
        <div style={{ fontSize: 15, color: COLORS.text, fontWeight: 600 }}>{draft.name}</div>
      </div>
      <span style={{ color: COLORS.primary, fontSize: 20 }}>›</span>
    </button>
  );
}

function WishPreview({ items }) {
  const navigate = useNavigate();
  if (!items || items.length === 0) {
    return (
      <div style={cardStyle}>
        <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>
          冷静中的心愿
        </div>
        <div style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.7 }}>
          看到心动的东西，先放进这里冷静一下。我会帮你一起看看预算、已有物品和真实使用场景。
        </div>
        <button
          onClick={() => navigate('/new/step1')}
          style={{
            marginTop: 14,
            width: '100%',
            border: 'none',
            borderRadius: COLORS.radiusButton,
            background: COLORS.primary,
            color: '#FFFFFF',
            padding: '12px 0',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          记录第一个心愿
        </button>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => {
    const daysA = a.wishlistDate ? (new Date() - new Date(a.wishlistDate)) / (1000 * 60 * 60 * 24) : 0;
    const daysB = b.wishlistDate ? (new Date() - new Date(b.wishlistDate)) / (1000 * 60 * 60 * 24) : 0;
    return daysB - daysA;
  });

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>冷静中的心愿</div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3 }}>{items.length} 个正在等待答案</div>
        </div>
        <button
          onClick={() => navigate('/wishlist')}
          style={{ border: 'none', background: COLORS.primaryLight, color: COLORS.primary, borderRadius: 16, padding: '6px 10px', fontWeight: 700 }}
        >
          全部
        </button>
      </div>
      {sorted.slice(0, 3).map((item, index) => {
        const daysWaited = item.wishlistDate
          ? Math.floor((new Date() - new Date(item.wishlistDate)) / (1000 * 60 * 60 * 24))
          : 0;
        return (
          <div key={item.id}>
            <button
              onClick={() => navigate(`/wishlist/review/${item.id}`)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: '12px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{item.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 3 }}>已经冷静 {daysWaited} 天</div>
              </div>
              <div style={{ fontSize: 14, color: COLORS.textSecondary }}>¥{item.price?.toLocaleString()}</div>
            </button>
            {index < Math.min(sorted.length, 3) - 1 && <div style={{ height: 0.5, background: COLORS.border }} />}
          </div>
        );
      })}
    </div>
  );
}

function BudgetCard({ title, icon, budget }) {
  const total = Number(budget.total) || 0;
  const used = Number(budget.used) || 0;
  const reserved = Number(budget.reserved) || 0;
  const remaining = total - used - reserved;
  const usedPercent = total > 0 ? Math.min(((used + reserved) / total) * 100, 100) : 0;
  const snapshot = getBudgetSnapshot(budget);

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 22, marginRight: 8 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{title}</span>
        <span style={{ marginLeft: 'auto', color: snapshot.color, fontSize: 12, fontWeight: 700 }}>{snapshot.label}</span>
      </div>
      <div style={{ width: '100%', height: 8, background: COLORS.divider, borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ width: `${usedPercent}%`, height: '100%', background: snapshot.color, borderRadius: 8 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>总预算</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: COLORS.text }}>¥{total.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>剩余</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: snapshot.color }}>¥{remaining.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

function InventoryReminder({ items }) {
  const navigate = useNavigate();
  const summary = getInventorySummary(items);
  const hasPressure = summary.expiring + summary.expired > 0;

  return (
    <button
      onClick={() => navigate('/inventory')}
      style={{
        ...cardStyle,
        width: '100%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <span style={{ fontSize: 24 }}>📦</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>库存提醒</div>
        <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 3 }}>
          {hasPressure ? `${summary.expiring} 件快过期，${summary.expired} 件已过期` : '目前没有快过期或已过期物品'}
        </div>
      </div>
      <span style={{ color: COLORS.primary, fontSize: 20 }}>›</span>
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [monthlyBudget, setMonthlyBudget] = useState(null);
  const [annualBudget, setAnnualBudget] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [ownedItems, setOwnedItems] = useState([]);
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    setMonthlyBudget(getMonthlyBudget());
    setAnnualBudget(getAnnualBudget());
    const allDecisions = getPurchaseDecisions();
    setWishlistItems(allDecisions.filter((d) => d.status === 'wishlist'));
    setOwnedItems(getOwnedItems());
    setDraft(getNewWishDraft());
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, paddingBottom: 88 }}>
      <div style={{ padding: '44px 20px 24px' }}>
        <div style={{ fontSize: 13, color: COLORS.primary, fontWeight: 800, marginBottom: 8 }}>
          下单前，先冷静一下
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 850, color: COLORS.text, margin: 0, letterSpacing: 0.5 }}>
          心动清单
        </h1>
        <p style={{ fontSize: 15, color: COLORS.textSecondary, margin: '8px 0 0', lineHeight: 1.6 }}>
          记录一个心动，我会帮你看看预算、已有和真实使用价值。
        </p>
      </div>

      <div style={{ padding: '0 20px', marginBottom: 18 }}>
        <button
          onClick={() => navigate('/new/step1')}
          style={{
            width: '100%',
            padding: '16px 0',
            border: 'none',
            borderRadius: COLORS.radiusButton,
            background: COLORS.primary,
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: COLORS.shadowButton,
          }}
        >
          + 记录一个心动
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>
        <DraftCard draft={draft} />
        <TodayOverview wishlistItems={wishlistItems} monthlyBudget={monthlyBudget} ownedItems={ownedItems} />
        <WishPreview items={wishlistItems} />
        {monthlyBudget && <BudgetCard title="本月预算" icon="💰" budget={monthlyBudget} />}
        {annualBudget && <BudgetCard title="年度预算" icon="💎" budget={annualBudget} />}
        <InventoryReminder items={ownedItems} />
      </div>
    </div>
  );
}
