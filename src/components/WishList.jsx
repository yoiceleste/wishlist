import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPurchaseDecisions } from '../data/store';
import {
  purchaseStatuses,
  getPurchaseStatusLabel,
  purchaseStatusColors,
} from '../utils/categories';
import COLORS from '../theme';

const cardStyle = {
  background: COLORS.card,
  borderRadius: COLORS.radiusCard,
  boxShadow: COLORS.shadowCard,
  padding: 20,
  marginBottom: 16,
};

// ==================== 状态筛选标签栏 ====================
function FilterTabs({ activeTab, onTabChange }) {
  const tabsRef = useRef(null);

  const handleTabClick = (tabValue) => {
    onTabChange(tabValue);
    // 滚动到选中的标签居中位置
    if (tabsRef.current) {
      const tabElements = tabsRef.current.querySelectorAll('.filter-tab');
      tabElements.forEach((el) => {
        if (el.dataset.value === tabValue) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    }
  };

  return (
    <div
      ref={tabsRef}
      style={{
        display: 'flex',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        gap: 8,
        padding: '0 20px 16px',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {purchaseStatuses.map((tab) => {
        const isActive = activeTab === tab.value;
        const color = purchaseStatusColors[tab.value] || COLORS.textSecondary;
        return (
          <button
            key={tab.value}
            className="filter-tab"
            data-value={tab.value}
            onClick={() => handleTabClick(tab.value)}
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              border: 'none',
              borderRadius: COLORS.radiusTag,
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: isActive ? color : COLORS.card,
              color: isActive ? '#FFFFFF' : COLORS.textSecondary,
              boxShadow: isActive ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ==================== 想买记录卡片 ====================
function DecisionCard({ item }) {
  const navigate = useNavigate();

  const statusLabel = getPurchaseStatusLabel(item.status);
  const statusColor = purchaseStatusColors[item.status] || COLORS.textSecondary;

  // 格式化日期
  const createdDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  // 简要建议文本（取 recommendation.suggestion 的前几个字）
  const suggestionText =
    item.recommendation && item.recommendation.suggestion
      ? item.recommendation.suggestion
      : '';

  return (
    <div
      onClick={() => navigate(`/new/result/${item.id}`)}
      style={{
        ...cardStyle,
        cursor: 'pointer',
        marginBottom: 12,
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

      {/* 建议（如果有） */}
      {suggestionText && item.status === 'wishlist' && (
        <div
          style={{
            fontSize: 12,
            color: COLORS.warning,
            background: '#FFF8E6',
            padding: '8px 12px',
            borderRadius: 8,
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span>💡</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {suggestionText}
          </span>
        </div>
      )}

      {/* 底部：价格 + 日期 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          ¥{item.price.toLocaleString()}
        </span>
        {createdDate && (
          <span style={{ fontSize: 12, color: COLORS.textSecondary }}>
            {createdDate}
          </span>
        )}
      </div>
    </div>
  );
}

// ==================== 想买列表页主组件 ====================
export default function WishList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    setDecisions(getPurchaseDecisions());
  }, []);

  // 根据当前选中的标签筛选
  const filteredDecisions =
    activeTab === 'all'
      ? decisions
      : decisions.filter((d) => d.status === activeTab);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.bg,
        paddingBottom: 80,
      }}
    >
      {/* 顶部标题 */}
      <div
        style={{
          padding: '40px 20px 20px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: COLORS.text,
            margin: 0,
          }}
        >
          想买清单
        </h1>
        <p
          style={{
            fontSize: 13,
            color: COLORS.textSecondary,
            margin: '6px 0 0',
          }}
        >
          共 {decisions.length} 条记录
        </p>
      </div>

      {/* 状态筛选标签栏 */}
      <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 列表内容 */}
      <div style={{ padding: '0 20px' }}>
        {filteredDecisions.length > 0 ? (
          filteredDecisions.map((item) => (
            <DecisionCard key={item.id} item={item} />
          ))
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: COLORS.textSecondary,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 14 }}>
              {activeTab === 'all'
                ? '还没有想买记录，快去添加吧'
                : `没有${getPurchaseStatusLabel(activeTab)}的记录`}
            </div>
          </div>
        )}
      </div>

      {/* 悬浮按钮 */}
      <button
        onClick={() => navigate('/new/step1')}
        style={{
          position: 'fixed',
          bottom: 100,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          border: 'none',
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
          color: '#FFFFFF',
          fontSize: 24,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,122,255,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          transition: 'transform 0.2s ease',
        }}
      >
        +
      </button>
    </div>
  );
}
