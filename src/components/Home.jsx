import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMonthlyBudget,
  getAnnualBudget,
  getPurchaseDecisions,
  getOwnedItems,
  initializeStore,
} from '../data/store';
import mockData from '../data/mockData';
import COLORS from '../theme';

const cardStyle = {
  background: COLORS.card,
  borderRadius: COLORS.radiusCard,
  boxShadow: COLORS.shadowCard,
  padding: 20,
  marginBottom: 16,
};

// ==================== 预算卡片组件 ====================
function BudgetCard({ title, icon, budget }) {
  const total = budget.total;
  const used = budget.used;
  const reserved = budget.reserved;
  const remaining = total - used - reserved;
  const usedPercent = Math.min(((used + reserved) / total) * 100, 100);

  let remainColor = COLORS.success;
  let remainLabel = '充足';
  if (remaining < 0) {
    remainColor = COLORS.danger;
    remainLabel = '超支';
  } else if (remaining < total * 0.2) {
    remainColor = COLORS.warning;
    remainLabel = '紧张';
  }

  let barColor = COLORS.success;
  if (usedPercent > 90) {
    barColor = COLORS.danger;
  } else if (usedPercent > 70) {
    barColor = COLORS.warning;
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 22, marginRight: 8 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{title}</span>
      </div>

      <div style={{ width: '100%', height: 6, background: COLORS.border, borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ width: `${usedPercent}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 0.3s ease' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>总预算</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.text }}>¥{total.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>已用 / 已计划</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.text }}>¥{used.toLocaleString()} / ¥{reserved.toLocaleString()}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>剩余（{remainLabel}）</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: remainColor }}>¥{remaining.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

// ==================== Wishlist 提醒卡片 ====================
function WishlistReminder({ items }) {
  const navigate = useNavigate();
  const today = new Date();

  // 筛选到达提醒日期的 wishlist 物品
  const dueItems = items.filter((item) => {
    if (item.status !== 'wishlist' || !item.nextReminderDate) return false;
    return new Date(item.nextReminderDate) <= today;
  });

  if (dueItems.length === 0) return null;

  const text = dueItems.length === 1
    ? '有一件放了很久的心动物品，想重新看看吗？'
    : `有 ${dueItems.length} 件 Wishlist 已到达提醒时间。`;

  return (
    <div
      onClick={() => navigate(`/wishlist/review/${dueItems[0].id}`)}
      style={{
        ...cardStyle,
        cursor: 'pointer',
        background: `linear-gradient(135deg, ${COLORS.primaryLight}, ${COLORS.card})`,
        border: `1px solid ${COLORS.primary}20`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>💡</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.text, lineHeight: 1.5 }}>
            {text}
          </div>
        </div>
        <span style={{ fontSize: 16, color: COLORS.primary }}>&#8250;</span>
      </div>
    </div>
  );
}

// ==================== Wishlist 列表卡片 ====================
function WishlistList({ items }) {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  // 按等待天数排序（最久排最前）
  const sorted = [...items].sort((a, b) => {
    const daysA = a.wishlistDate ? (new Date() - new Date(a.wishlistDate)) / (1000 * 60 * 60 * 24) : 0;
    const daysB = b.wishlistDate ? (new Date() - new Date(b.wishlistDate)) / (1000 * 60 * 60 * 24) : 0;
    return daysB - daysA;
  });

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 22, marginRight: 8 }}>💝</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>Wishlist</span>
        <span style={{
          marginLeft: 8,
          fontSize: 12,
          color: COLORS.primary,
          background: COLORS.primaryLight,
          padding: '2px 8px',
          borderRadius: COLORS.radiusTag,
        }}>
          {items.length} 件
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {sorted.map((item, index) => {
          const wishlistDate = item.wishlistDate ? new Date(item.wishlistDate) : null;
          const daysWaited = wishlistDate
            ? Math.floor((new Date() - wishlistDate) / (1000 * 60 * 60 * 24))
            : 0;

          return (
            <div key={item.id}>
              <div
                onClick={() => navigate(`/wishlist/review/${item.id}`)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.text }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 2 }}>
                    等待 {daysWaited} 天
                  </div>
                </div>
                <div style={{ fontSize: 14, color: COLORS.textSecondary }}>
                  ¥{item.price?.toLocaleString()}
                </div>
              </div>
              {index < sorted.length - 1 && (
                <div style={{ height: 0.5, background: COLORS.border }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 库存提醒组件（优化版） ====================
function InventoryReminder({ items }) {
  const navigate = useNavigate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 计算快过期和已过期物品
  const expiringItems = [];
  const expiredItems = [];

  items.forEach((item) => {
    if (!item.expiryDate) return;
    const expiry = new Date(item.expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      expiredItems.push({ ...item, overdueDays: Math.abs(diffDays) });
    } else if (diffDays <= 60) {
      expiringItems.push({ ...item, remainingDays: diffDays });
    }
  });

  // 按天数排序
  expiringItems.sort((a, b) => a.remainingDays - b.remainingDays);
  expiredItems.sort((a, b) => b.overdueDays - a.overdueDays);

  // 没有需要提醒的
  if (expiringItems.length === 0 && expiredItems.length === 0) {
    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 22, marginRight: 8 }}>📦</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>库存提醒</span>
        </div>
        <div style={{ textAlign: 'center', padding: '12px 0', color: COLORS.textSecondary, fontSize: 14 }}>
          目前没有快过期或已过期物品。
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: 14, cursor: 'pointer' }}
        onClick={() => navigate('/inventory')}
      >
        <span style={{ fontSize: 22, marginRight: 8 }}>📦</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>库存提醒</span>
        <span style={{ marginLeft: 8, fontSize: 12, color: COLORS.textSecondary }}>
          点击查看全部
        </span>
      </div>

      {/* 快过期区域 */}
      {expiringItems.length > 0 && (
        <div style={{ marginBottom: expiredItems.length > 0 ? 14 : 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {expiringItems.slice(0, 3).map((item, index) => (
              <div key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: 14, color: COLORS.text }}>{item.name}</div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: COLORS.warning,
                    background: '#FFF8E6',
                    padding: '3px 10px',
                    borderRadius: COLORS.radiusTag,
                  }}>
                    还有 {item.remainingDays} 天
                  </span>
                </div>
                {index < Math.min(expiringItems.length, 3) - 1 && (
                  <div style={{ height: 0.5, background: COLORS.border }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 已过期区域 */}
      {expiredItems.length > 0 && (
        <div>
          {expiringItems.length > 0 && (
            <div style={{ height: 0.5, background: COLORS.border, margin: '0 0 12px' }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {expiredItems.slice(0, 3).map((item, index) => (
              <div key={item.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: 14, color: COLORS.text }}>{item.name}</div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: COLORS.danger,
                    background: '#FFF0F0',
                    padding: '3px 10px',
                    borderRadius: COLORS.radiusTag,
                  }}>
                    已过期 {item.overdueDays} 天
                  </span>
                </div>
                {index < Math.min(expiredItems.length, 3) - 1 && (
                  <div style={{ height: 0.5, background: COLORS.border }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 首页主组件 ====================
export default function Home() {
  const navigate = useNavigate();

  const [monthlyBudget, setMonthlyBudget] = useState(null);
  const [annualBudget, setAnnualBudget] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [ownedItems, setOwnedItems] = useState([]);

  useEffect(() => {
    // 首次加载时，如果 localStorage 没有数据则初始化
    const existingDecisions = getPurchaseDecisions();
    if (existingDecisions.length === 0) {
      initializeStore(mockData);
    }

    // 加载数据
    setMonthlyBudget(getMonthlyBudget());
    setAnnualBudget(getAnnualBudget());

    const allDecisions = getPurchaseDecisions();
    // wishlist 状态的物品
    const wishlist = allDecisions.filter((d) => d.status === 'wishlist');
    setWishlistItems(wishlist);

    setOwnedItems(getOwnedItems());
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, paddingBottom: 80 }}>
      {/* 顶部标题区域 */}
      <div style={{ padding: '40px 20px 30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: COLORS.text, margin: '0 0 8px', letterSpacing: 1 }}>
          心动清单
        </h1>
        <p style={{ fontSize: 14, color: COLORS.textSecondary, margin: 0 }}>
          下单前，先看看预算和已有
        </p>
      </div>

      {/* 主按钮 */}
      <div style={{ padding: '0 20px', marginBottom: 24 }}>
        <button
          onClick={() => navigate('/new/step1')}
          style={{
            width: '100%',
            padding: '16px 0',
            border: 'none',
            borderRadius: COLORS.radiusButton,
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,122,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 20 }}>✏️</span>
          记录想买
        </button>
      </div>

      {/* 内容区域 */}
      <div style={{ padding: '0 20px' }}>
        {/* Wishlist 提醒（到达提醒日期的） */}
        <WishlistReminder items={wishlistItems} />

        {/* Wishlist 列表 */}
        <WishlistList items={wishlistItems} />

        {/* 月度预算卡片 */}
        {monthlyBudget && <BudgetCard title="本月预算" icon="💰" budget={monthlyBudget} />}

        {/* 年度预算卡片 */}
        {annualBudget && <BudgetCard title="年度预算" icon="💎" budget={annualBudget} />}

        {/* 库存提醒（优化版） */}
        <InventoryReminder items={ownedItems} />
      </div>
    </div>
  );
}
