import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPurchaseDecisionById,
  updatePurchaseDecision,
} from '../data/store';
import { generateRecommendation } from '../utils/recommendation';
import COLORS from '../theme';

// ==================== 导航栏 ====================
function NavBar({ title, onBack }) {
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
        onClick={onBack}
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

// ==================== 信息卡片 ====================
function InfoCard({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: `0.5px solid ${COLORS.border}`,
      }}
    >
      <span style={{ fontSize: 14, color: COLORS.textSecondary }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 500, color: COLORS.text }}>
        {value}
      </span>
    </div>
  );
}

// ==================== 阶段一：90 天后你还想买吗？ ====================
function ReviewPhase({ decision, onChoice }) {
  const wishlistDate = decision.wishlistDate ? new Date(decision.wishlistDate) : null;
  const today = new Date();
  const daysWaited = wishlistDate
    ? Math.floor((today - wishlistDate) / (1000 * 60 * 60 * 24))
    : 0;

  const originalSuggestion = decision.recommendation?.suggestion || '暂无建议';

  return (
    <div>
      {/* 物品信息卡片 */}
      <div
        style={{
          background: COLORS.card,
          borderRadius: COLORS.radiusCard,
          boxShadow: COLORS.shadowCard,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 16 }}>
          物品信息
        </div>
        <InfoCard label="物品" value={decision.name} />
        <InfoCard
          label="加入 Wishlist"
          value={daysWaited > 0 ? `${daysWaited} 天前` : '刚刚'}
        />
        <InfoCard label="价格" value={`¥${decision.price?.toLocaleString()}`} />
        <InfoCard label="当时购买建议" value={originalSuggestion} />
        {decision.purpose && (
          <InfoCard label="购买目的" value={decision.purpose} style={{ borderBottom: 'none' }} />
        )}
      </div>

      {/* 询问卡片 */}
      <div
        style={{
          background: COLORS.card,
          borderRadius: COLORS.radiusCard,
          boxShadow: COLORS.shadowCard,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>
          现在，你还想买吗？
        </div>
        <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 }}>
          诚实面对自己的内心就好，没有对错。
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={() => onChoice('still_want')}
            style={{
              width: '100%',
              padding: '14px 0',
              border: 'none',
              borderRadius: 12,
              background: COLORS.primary,
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            还是很想买
          </button>
          <button
            onClick={() => onChoice('less_interested')}
            style={{
              width: '100%',
              padding: '14px 0',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              background: COLORS.card,
              color: COLORS.text,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            没那么想了
          </button>
          <button
            onClick={() => onChoice('already_bought')}
            style={{
              width: '100%',
              padding: '14px 0',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              background: COLORS.card,
              color: COLORS.text,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            已经买了
          </button>
          <button
            onClick={() => onChoice('not_needed')}
            style={{
              width: '100%',
              padding: '14px 0',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              background: COLORS.card,
              color: COLORS.textSecondary,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            不需要了
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 阶段二：重新分析结果 ====================
function ReanalysisPhase({ decision, onFinalAction }) {
  const { recommendation } = decision;
  const suggestion = recommendation?.suggestion || '';
  const tags = recommendation?.tags || [];
  const reasons = recommendation?.reasons || [];
  const budgetImpact = recommendation?.budgetImpact || '';
  const inventoryImpact = recommendation?.inventoryImpact || '';

  // 判断建议颜色
  const colorMap = {
    '可以购买': '#007AFF',
    '建议继续观察': '#FF9F0A',
    '放入年度计划': '#AF52DE',
    '不建议购买': '#FF3B30',
  };
  const color = colorMap[suggestion] || COLORS.primary;

  // 长期需求分析文案（从 reasons 中提取或使用默认）
  const longTermReason = reasons.find((r) =>
    r.includes('90 天') || r.includes('长期') || r.includes('持续')
  ) || '经过一段时间的观察，系统已重新评估你的购买需求。';

  return (
    <div>
      {/* 重新分析标题 */}
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
        <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 }}>
          重新分析结果
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1.3 }}>
          {suggestion}
        </div>
      </div>

      {/* 长期需求分析 */}
      <div
        style={{
          background: COLORS.card,
          borderRadius: COLORS.radiusCard,
          boxShadow: COLORS.shadowCard,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>
          长期需求分析
        </div>
        <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.8 }}>
          {longTermReason}
        </div>
      </div>

      {/* 理由 */}
      {reasons.length > 0 && (
        <div
          style={{
            background: COLORS.card,
            borderRadius: COLORS.radiusCard,
            boxShadow: COLORS.shadowCard,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 14 }}>
            分析理由
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reasons.slice(0, 4).map((reason, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  background: COLORS.divider,
                  borderRadius: 10,
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: COLORS.primary,
                    color: '#FFF',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>
                <span style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6, flex: 1 }}>
                  {reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 预算影响 */}
      {budgetImpact && (
        <div
          style={{
            background: COLORS.card,
            borderRadius: COLORS.radiusCard,
            boxShadow: COLORS.shadowCard,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 10 }}>
            💰 预算影响
          </div>
          <div style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.7 }}>
            {budgetImpact}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
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
          <button
            onClick={() => onFinalAction('buy')}
            style={{
              width: '100%',
              padding: '14px 0',
              border: 'none',
              borderRadius: 12,
              background: COLORS.primary,
              color: '#FFFFFF',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            立即购买
          </button>
          <button
            onClick={() => onFinalAction('continue_wishlist')}
            style={{
              width: '100%',
              padding: '14px 0',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              background: COLORS.card,
              color: COLORS.text,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            继续 Wishlist
          </button>
          <button
            onClick={() => onFinalAction('give_up')}
            style={{
              width: '100%',
              padding: '14px 0',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              background: COLORS.card,
              color: COLORS.textSecondary,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            放弃
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 主组件 ====================
export default function WishlistReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('review'); // 'review' | 'reanalysis'
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    const found = getPurchaseDecisionById(id);
    if (!found) {
      navigate('/');
      return;
    }
    setDecision(found);
    setLoading(false);
  }, [id]);

  // 处理用户在复盘阶段的选择
  const handleReviewChoice = (choice) => {
    if (!decision) return;

    const now = new Date();

    switch (choice) {
      case 'already_bought':
        updatePurchaseDecision(decision.id, { status: 'purchased' });
        navigate('/wishlist');
        break;

      case 'not_needed':
        updatePurchaseDecision(decision.id, { status: 'given_up' });
        navigate('/wishlist');
        break;

      case 'less_interested':
        // 继续 Wishlist，30 天后再次提醒
        const nextReminder30 = new Date(now);
        nextReminder30.setDate(nextReminder30.getDate() + 30);
        updatePurchaseDecision(decision.id, {
          status: 'wishlist',
          nextReminderDate: nextReminder30.toISOString(),
          wishlistReminderCount: (decision.wishlistReminderCount || 0) + 1,
        });
        navigate('/wishlist');
        break;

      case 'still_want':
        // 进入重新分析
        setReanalyzing(true);
        setTimeout(() => {
          const recommendation = generateRecommendation(decision, true); // true = isReanalysis
          const updated = updatePurchaseDecision(decision.id, {
            recommendation,
            lastReanalysisDate: now.toISOString(),
            wishlistReminderCount: (decision.wishlistReminderCount || 0) + 1,
          });
          if (updated) setDecision(updated);
          setReanalyzing(false);
          setPhase('reanalysis');
        }, 500);
        break;

      default:
        break;
    }
  };

  // 处理重新分析后的最终决定
  const handleFinalAction = (action) => {
    if (!decision) return;

    switch (action) {
      case 'buy':
        updatePurchaseDecision(decision.id, { status: 'purchased' });
        navigate('/wishlist');
        break;

      case 'continue_wishlist': {
        const now = new Date();
        const next = new Date(now);
        next.setDate(next.getDate() + 30);
        updatePurchaseDecision(decision.id, {
          status: 'wishlist',
          nextReminderDate: next.toISOString(),
        });
        navigate('/wishlist');
        break;
      }

      case 'give_up':
        updatePurchaseDecision(decision.id, { status: 'given_up' });
        navigate('/wishlist');
        break;

      default:
        break;
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: 14, color: COLORS.textSecondary }}>加载中...</div>
      </div>
    );
  }

  if (!decision) return null;

  const title = phase === 'review'
    ? '90 天后，你还想买吗？'
    : '重新分析';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.bg,
        paddingBottom: 40,
      }}
    >
      <NavBar
        title={title}
        onBack={() => navigate('/wishlist')}
      />

      {/* 重新分析 loading 遮罩 */}
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
          <div style={{
            fontSize: 14,
            color: COLORS.textSecondary,
            background: COLORS.card,
            padding: '16px 24px',
            borderRadius: 12,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          }}>
            重新分析中...
          </div>
        </div>
      )}

      <div style={{ padding: '0 20px' }}>
        {phase === 'review' ? (
          <ReviewPhase decision={decision} onChoice={handleReviewChoice} />
        ) : (
          <ReanalysisPhase decision={decision} onFinalAction={handleFinalAction} />
        )}
      </div>
    </div>
  );
}
