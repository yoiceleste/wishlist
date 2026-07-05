import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOwnedItems } from '../data/store';
import { getItemStatusLabel, itemStatusColors } from '../utils/categories';
import COLORS from '../theme';

const cardStyle = {
  background: COLORS.card,
  borderRadius: COLORS.radiusCard,
  boxShadow: COLORS.shadowCard,
  padding: 20,
  marginBottom: 12,
};

// ==================== 搜索框 ====================
function SearchBar({ value, onChange }) {
  return (
    <div style={{ padding: '0 20px 16px' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: 14,
            fontSize: 16,
            color: COLORS.textSecondary,
            pointerEvents: 'none',
          }}
        >
          🔍
        </span>
        <input
          type="text"
          placeholder="搜索物品名称..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px 12px 40px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            fontSize: 14,
            color: COLORS.text,
            background: COLORS.card,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = COLORS.primary;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = COLORS.border;
          }}
        />
        {value && (
          <span
            onClick={() => onChange('')}
            style={{
              position: 'absolute',
              right: 14,
              fontSize: 14,
              color: COLORS.textSecondary,
              cursor: 'pointer',
            }}
          >
            ✕
          </span>
        )}
      </div>
    </div>
  );
}

// ==================== 物品卡片 ====================
function ItemCard({ item }) {
  const navigate = useNavigate();

  const statusLabel = getItemStatusLabel(item.status);
  const statusColor = itemStatusColors[item.status] || COLORS.textSecondary;

  return (
    <div
      onClick={() => navigate(`/inventory/edit/${item.id}`)}
      style={{
        ...cardStyle,
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.98)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* 顶部：名称 + 状态标签 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: COLORS.text,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: COLORS.textSecondary,
              marginTop: 4,
            }}
          >
            {item.category}
          </div>
        </div>
        <span
          style={{
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 500,
            color: statusColor,
            background: `${statusColor}15`,
            padding: '4px 10px',
            borderRadius: COLORS.radiusTag,
            border: `1px solid ${statusColor}30`,
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* 底部：价格 + 使用频率 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          ¥{item.price.toLocaleString()}
        </span>
        {item.frequency && (
          <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
            📊 {item.frequency}
          </span>
        )}
      </div>

      {/* 备注（如果有） */}
      {item.notes && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: COLORS.textSecondary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          📝 {item.notes}
        </div>
      )}
    </div>
  );
}

// ==================== 库存页主组件 ====================
export default function Inventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    setItems(getOwnedItems());
  }, []);

  // 搜索过滤
  const filteredItems = searchKeyword
    ? items.filter((item) =>
        item.name.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    : items;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.bg,
        paddingBottom: 80,
      }}
    >
      {/* 顶部标题栏 */}
      <div
        style={{
          padding: '40px 20px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: COLORS.text,
              margin: 0,
            }}
          >
            看看已有
          </h1>
          <p
            style={{
              fontSize: 13,
              color: COLORS.textSecondary,
              margin: '6px 0 0',
            }}
          >
            共 {items.length} 件物品
          </p>
        </div>
        <button
          onClick={() => navigate('/inventory/add')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: 12,
            background: COLORS.primary,
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,122,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 16 }}>+</span>
          新增
        </button>
      </div>

      {/* 搜索框 */}
      <SearchBar value={searchKeyword} onChange={setSearchKeyword} />

      {/* 物品列表 */}
      <div style={{ padding: '0 20px' }}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: COLORS.textSecondary,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>🫙</div>
            <div style={{ fontSize: 14 }}>
              {searchKeyword
                ? `没有找到包含"${searchKeyword}"的物品`
                : '还没有记录已有物品，快去添加吧'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
