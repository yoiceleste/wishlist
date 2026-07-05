import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  savePurchaseDecision,
  getPurchaseDecisionById,
  updatePurchaseDecision,
} from '../data/store';
import { generateRecommendation } from '../utils/recommendation';
import COLORS from '../theme';

// 建议类型 -> 颜色映射
const SUGGESTION_COLORS = {
  '现在可以买': '#007AFF',
  '可以买但建议等优惠': '#5AC8FA',
  '加入冷静期': '#FF9F0A',
  '暂缓30天': '#FF9F0A',
  '不建议现在买': '#FF3B30',
  '先用已有': '#5AC8FA',
  '放入年度计划': '#AF52DE',
};

// 标签颜色映射 - 根据标签维度和值判断颜色
const TAG_COLOR_MAP = {
  // 刚需度
  '刚需度：高': '#007AFF',
  '刚需度：中': '#FF9F0A',
  '刚需度：低': '#FF3B30',
  // 替代性
  '替代性：不可替代': '#007AFF',
  '替代性：部分可替代': '#FF9F0A',
  '替代性：可替代': '#FF3B30',
  // 预算压力
  '预算压力：高': '#FF3B30',
  '预算压力：中': '#FF9F0A',
  '预算压力：低': '#007AFF',
  // 使用确定性
  '使用确定性：高': '#007AFF',
  '使用确定性：中': '#FF9F0A',
  '使用确定性：低': '#FF3B30',
  // 库存重复风险
  '库存重复风险：高': '#FF3B30',
  '库存重复风险：中': '#FF9F0A',
  '库存重复风险：低': '#007AFF',
  // 情绪价值/稀缺性
  '情绪价值/稀缺性：高': '#FF2D55',
  '情绪价值/稀缺性：中': '#FF9F0A',
  '情绪价值/稀缺性：低': '#9CA3AF',
};

// 默认标签颜色（用于预算归属合理性和购买时机等文字标签）
const DEFAULT_TAG_COLOR = '#5AC8FA';

// ==================== 导航栏 ====================
function NavBar({ title }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        background: COLORS.bg,
        zIndex: 10,
      }}
    >
      <button
        onClick={() => navigate('/wishlist')}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 20,
          cursor: 'pointer',
          color: COLORS.text,
          padding: 0,
          lineHeight: 1,
        }}
      >
        &#8592;
      </button>
      <span
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: COLORS.text,
        }}
      >
        {title}
      </span>
      <div style={{ width: 20 }} />
    </div>
  );
}

// ==================== 建议卡片 ====================
function SuggestionCard({ suggestion, itemName }) {
  const color = SUGGESTION_COLORS[suggestion] || COLORS.primary;

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: COLORS.radiusCard,
        boxShadow: COLORS.shadowCard,
        padding: '24px 20px',
        marginBottom: 16,
        borderLeft: `6px solid ${color}`,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: COLORS.textSecondary,
          marginBottom: 6,
        }}
      >
        {itemName} 的购买建议
      </div>
      <div
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: color,
          lineHeight: 1.3,
        }}
      >
        {suggestion}
      </div>
    </div>
  );
}

// ==================== 消费画像标签 ====================
function ProfileTags({ tags }) {
  if (!tags || tags.length === 0) return null;

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: COLORS.radiusCard,
        boxShadow: COLORS.shadowCard,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: COLORS.text,
          marginBottom: 14,
        }}
      >
        消费画像
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {tags.map((tag, index) => {
          const tagColor = TAG_COLOR_MAP[tag] || DEFAULT_TAG_COLOR;
          return (
            <span
              key={index}
              style={{
                display: 'inline-block',
                fontSize: 12,
                fontWeight: 500,
                color: tagColor,
                background: `${tagColor}18`,
                padding: '6px 12px',
                borderRadius: 20,
                border: `1px solid ${tagColor}30`,
                whiteSpace: 'nowrap',
              }}
            >
              {tag}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ==================== 理由卡片列表 ====================
function ReasonCards({ reasons }) {
  if (!reasons || reasons.length === 0) return null;

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: COLORS.radiusCard,
        boxShadow: COLORS.shadowCard,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: COLORS.text,
          marginBottom: 14,
        }}
      >
        为什么这样建议
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {reasons.map((reason, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: '12px 14px',
              background: COLORS.divider,
              borderRadius: 12,
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: COLORS.primary,
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {index + 1}
            </span>
            <span
              style={{
                fontSize: 14,
                color: COLORS.text,
                lineHeight: 1.6,
                flex: 1,
              }}
            >
              {reason}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== 文字说明区块 ====================
function TextBlock({ title, text, icon }) {
  if (!text) return null;

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: COLORS.radiusCard,
        boxShadow: COLORS.shadowCard,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: COLORS.text,
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <div
        style={{
          fontSize: 14,
          color: COLORS.textSecondary,
          lineHeight: 1.7,
        }}
      >
        {text}
      </div>
    </div>
  );
}

// ==================== 折叠区域 ====================
function CollapsibleSection({ title, children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: COLORS.radiusCard,
        boxShadow: COLORS.shadowCard,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontSize: 15,
          fontWeight: 600,
          color: COLORS.text,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <span>{title}</span>
        <span
          style={{
            fontSize: 14,
            color: COLORS.textSecondary,
            transition: 'transform 0.2s ease',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          &#9654;
        </span>
      </button>
      {expanded && (
        <div
          style={{
            padding: '0 20px 16px',
            fontSize: 14,
            color: COLORS.textSecondary,
            lineHeight: 1.7,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ==================== 操作按钮区 ====================
function ActionButtons({ suggestion, decisionId, onUpdateStatus, onReanalyze }) {
  const navigate = useNavigate();

  // 根据建议类型显示不同的按钮
  const getButtons = () => {
    const buttons = [];

    switch (suggestion) {
      case '现在可以买':
        buttons.push(
          { label: '标记已购买', status: 'purchased', color: COLORS.primary },
          { label: '加入冷静期', status: 'watching', color: COLORS.warning },
          { label: '暂时不买', status: 'skip', color: COLORS.danger }
        );
        break;

      case '可以买但建议等优惠':
        buttons.push(
          { label: '加入冷静期', status: 'watching', color: COLORS.warning },
          { label: '标记已购买', status: 'purchased', color: COLORS.primary },
          { label: '暂时不买', status: 'skip', color: COLORS.danger }
        );
        break;

      case '加入冷静期':
        buttons.push(
          { label: '加入冷静期', status: 'watching', color: COLORS.warning },
          { label: '标记已购买', status: 'purchased', color: COLORS.primary },
          { label: '暂时不买', status: 'skip', color: COLORS.danger }
        );
        break;

      case '暂缓30天':
        buttons.push(
          { label: '加入冷静期', status: 'watching', color: COLORS.warning },
          { label: '暂时不买', status: 'skip', color: COLORS.danger },
          { label: '标记已购买', status: 'purchased', color: COLORS.primary }
        );
        break;

      case '不建议现在买':
        buttons.push(
          { label: '暂时不买', status: 'skip', color: COLORS.danger },
          { label: '放弃', status: 'given_up', color: '#9CA3AF' },
          { label: '加入冷静期', status: 'watching', color: COLORS.warning }
        );
        break;

      case '先用已有':
        buttons.push(
          { label: '暂时不买', status: 'skip', color: COLORS.danger },
          { label: '放弃', status: 'given_up', color: '#9CA3AF' }
        );
        break;

      case '放入年度计划':
        buttons.push(
          { label: '放入年度计划', status: 'annual_plan', color: '#AF52DE' },
          { label: '加入冷静期', status: 'watching', color: COLORS.warning },
          { label: '暂时不买', status: 'skip', color: COLORS.danger }
        );
        break;

      default:
        buttons.push(
          { label: '加入冷静期', status: 'watching', color: COLORS.warning },
          { label: '暂时不买', status: 'skip', color: COLORS.danger },
          { label: '标记已购买', status: 'purchased', color: COLORS.primary }
        );
        break;
    }

    return buttons;
  };

  const buttons = getButtons();

  const handleAction = (status) => {
    onUpdateStatus(status);
  };

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: COLORS.radiusCard,
        boxShadow: COLORS.shadowCard,
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {buttons.map((btn) => (
          <button
            key={btn.status}
            onClick={() => handleAction(btn.status)}
            style={{
              width: '100%',
              padding: '14px 0',
              border: btn.status === buttons[0].status
                ? 'none'
                : `1px solid ${COLORS.border}`,
              borderRadius: 12,
              background:
                btn.status === buttons[0].status
                  ? btn.color
                  : COLORS.card,
              color: btn.status === buttons[0].status
                ? '#FFFFFF'
                : COLORS.text,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              transition: 'all 0.2s ease',
            }}
          >
            {btn.label}
          </button>
        ))}

        {/* 重新分析按钮 */}
        <button
          onClick={onReanalyze}
          style={{
            width: '100%',
            padding: '12px 0',
            border: `1px dashed ${COLORS.border}`,
            borderRadius: 12,
            background: COLORS.card,
            color: COLORS.textSecondary,
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          重新分析
        </button>
      </div>
    </div>
  );
}

// ==================== 主组件 ====================
export default function PurchaseAdvice() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    if (id) {
      // 从 localStorage 读取已有记录
      const found = getPurchaseDecisionById(id);
      if (found) {
        setDecision(found);
      } else {
        // 未找到记录，返回列表
        navigate('/wishlist');
      }
    } else {
      // 新生成的建议（从 step4 传来的 state）
      const stateDecision = location.state;

      if (!stateDecision) {
        // 没有传数据也没有 id，返回列表
        navigate('/wishlist');
        return;
      }

      // 生成购买建议
      const recommendation = generateRecommendation(stateDecision);

      const newDecision = {
        ...stateDecision,
        recommendation,
        status: 'watching', // 默认加入冷静期
      };

      // 保存到 localStorage
      const saved = savePurchaseDecision(newDecision);
      setDecision(saved);
    }

    setLoading(false);
  }, [id, location.state]);

  // 更新状态
  const handleUpdateStatus = (status) => {
    if (!decision) return;

    const now = new Date();
    const updates = { status };

    // 如果状态改为 watching（冷静期），自动记录 wishlist 信息
    if (status === 'watching' || status === 'wishlist') {
      const finalStatus = 'wishlist'; // 统一用 wishlist 状态
      updates.status = finalStatus;
      updates.wishlistDate = now.toISOString();
      // 第一次默认 90 天后提醒
      const nextReminder = new Date(now);
      nextReminder.setDate(nextReminder.getDate() + 90);
      updates.nextReminderDate = nextReminder.toISOString();
      updates.wishlistReminderCount = 0;
    }

    const updated = updatePurchaseDecision(decision.id, updates);
    if (updated) {
      setDecision(updated);
    }

    // 短暂延迟后返回想买列表，让用户看到状态变化
    setTimeout(() => {
      navigate('/wishlist');
    }, 500);
  };

  // 重新分析
  const handleReanalyze = () => {
    if (!decision) return;

    setReanalyzing(true);

    // 用 setTimeout 避免阻塞 UI
    setTimeout(() => {
      const recommendation = generateRecommendation(decision);
      const updated = updatePurchaseDecision(decision.id, { recommendation });
      if (updated) {
        setDecision(updated);
      }
      setReanalyzing(false);
    }, 300);
  };

  // 提取展示数据
  const suggestion = decision?.recommendation?.suggestion || '';
  const tags = decision?.recommendation?.tags || [];
  const reasons = decision?.recommendation?.reasons || [];
  const budgetImpact = decision?.recommendation?.budgetImpact || '';
  const inventoryImpact = decision?.recommendation?.inventoryImpact || '';
  const referenceInfo = decision?.recommendation?.referenceInfo || '';

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: COLORS.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 14, color: COLORS.textSecondary }}>
          加载中...
        </div>
      </div>
    );
  }

  if (!decision) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: COLORS.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 14, color: COLORS.textSecondary }}>
          未找到该记录
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.bg,
        paddingBottom: 40,
      }}
    >
      {/* 顶部导航 */}
      <NavBar title="购买建议" />

      {/* 加载遮罩（重新分析时） */}
      {reanalyzing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: COLORS.textSecondary,
              background: COLORS.card,
              padding: '16px 24px',
              borderRadius: 12,
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            }}
          >
            重新分析中...
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div style={{ padding: '0 20px' }}>
        {/* 建议卡片 */}
        <SuggestionCard suggestion={suggestion} itemName={decision.name} />

        {/* 消费画像标签 */}
        <ProfileTags tags={tags} />

        {/* 为什么这样建议 */}
        <ReasonCards reasons={reasons} />

        {/* 预算影响 */}
        <TextBlock title="预算影响" text={budgetImpact} icon="💰" />

        {/* 库存影响 */}
        <TextBlock title="库存影响" text={inventoryImpact} icon="📦" />

        {/* 参考信息（折叠区域） */}
        {referenceInfo && (
          <CollapsibleSection title="参考信息">
            {referenceInfo}
          </CollapsibleSection>
        )}

        {/* 操作按钮区 */}
        <ActionButtons
          suggestion={suggestion}
          decisionId={decision.id}
          onUpdateStatus={handleUpdateStatus}
          onReanalyze={handleReanalyze}
        />
      </div>
    </div>
  );
}
