import React from 'react';
import {
  calcOwnedDays,
  calcDailyCost,
  calcRealDailyCost,
  calcTargetDailyCost,
  getUseValueTag,
  getUseValueDescriptions,
  USE_VALUE_TAGS,
} from '../utils/useValue';
import COLORS from '../theme';

// 使用价值标签颜色映射
const TAG_STYLES = {
  [USE_VALUE_TAGS.VERY_WORTH]: { bg: COLORS.tagGreen, color: COLORS.tagGreenText },
  [USE_VALUE_TAGS.AMORTIZING]: { bg: COLORS.tagBlue, color: COLORS.tagBlueText },
  [USE_VALUE_TAGS.NEED_MORE_TIME]: { bg: COLORS.tagOrange, color: COLORS.tagOrangeText },
  [USE_VALUE_TAGS.IDLE_SUGGEST_USE]: { bg: COLORS.tagPink, color: COLORS.tagPinkText },
  [USE_VALUE_TAGS.EXPIRED]: { bg: COLORS.tagGray, color: COLORS.tagGrayText },
};

/**
 * 使用价值卡片组件
 * 在库存详情页展示基于时间的使用价值分析
 */
export default function UseValueCard({ item }) {
  if (!item) return null;

  const { price, purchaseDate, targetUseYears, estimatedResaleValue } = item;

  // 无法计算时显示提示
  if (!purchaseDate || !price) {
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
            display: 'flex',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 20, marginRight: 8 }}>💰</span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: COLORS.text,
            }}
          >
            使用价值
          </span>
        </div>
        <div
          style={{
            fontSize: 14,
            color: COLORS.textSecondary,
            textAlign: 'center',
            padding: '16px 0',
            lineHeight: 1.6,
          }}
        >
          填写购买日期和价格后，可以查看使用价值分析。
        </div>
      </div>
    );
  }

  const days = calcOwnedDays(purchaseDate);
  const dailyCost = calcDailyCost(price, purchaseDate);
  const tag = getUseValueTag(item);
  const descriptions = getUseValueDescriptions(item);
  const tagStyle = TAG_STYLES[tag] || TAG_STYLES[USE_VALUE_TAGS.NEED_MORE_TIME];

  const realDailyCost = calcRealDailyCost(price, estimatedResaleValue, purchaseDate);
  const targetDailyCost = calcTargetDailyCost(price, targetUseYears);

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: COLORS.radiusCard,
        boxShadow: COLORS.shadowCard,
        padding: 20,
        marginBottom: 16,
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      {/* 标题 + 使用价值标签 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 20, marginRight: 8 }}>💰</span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: COLORS.text,
            }}
          >
            使用价值
          </span>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: tagStyle.color,
            background: tagStyle.bg,
            padding: '4px 10px',
            borderRadius: 20,
            border: `1px solid ${tagStyle.color}30`,
          }}
        >
          {tag}
        </span>
      </div>

      {/* 叙述文案 */}
      {descriptions.length > 0 && (
        <div
          style={{
            fontSize: 14,
            color: COLORS.text,
            lineHeight: 1.8,
            marginBottom: 16,
            padding: '12px 14px',
            background: '#FDFDFC',
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {descriptions.map((desc, idx) => (
            <div key={idx}>{desc}</div>
          ))}
        </div>
      )}

      {/* 数据指标网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}
      >
        {/* 已拥有天数 */}
        <div
          style={{
            background: '#F8F9FA',
            borderRadius: 12,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>
            已拥有
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>
            {days}
            <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>天</span>
          </div>
        </div>

        {/* 购买价格 */}
        <div
          style={{
            background: '#F8F9FA',
            borderRadius: 12,
            padding: '12px 14px',
          }}
        >
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>
            购买价格
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>
            ¥{price.toLocaleString()}
          </div>
        </div>

        {/* 日均成本 */}
        {dailyCost !== null && (
          <div
            style={{
              background: '#F8F9FA',
              borderRadius: 12,
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>
              日均成本
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>
              ¥{dailyCost.toFixed(2)}
              <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>/天</span>
            </div>
          </div>
        )}

        {/* 扣除残值后的日均成本 / 目标日均成本 */}
        {realDailyCost !== null ? (
          <div
            style={{
              background: '#F8F9FA',
              borderRadius: 12,
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>
              真实日均成本
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.tagBlueText }}>
              ¥{realDailyCost.toFixed(2)}
              <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>/天</span>
            </div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
              已扣除残值 ¥{estimatedResaleValue.toLocaleString()}
            </div>
          </div>
        ) : targetDailyCost !== null ? (
          <div
            style={{
              background: '#F8F9FA',
              borderRadius: 12,
              padding: '12px 14px',
            }}
          >
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 }}>
              目标日均成本
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.tagPurpleText }}>
              ¥{targetDailyCost.toFixed(2)}
              <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 2 }}>/天</span>
            </div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
              目标用满 {targetUseYears} 年
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#F8F9FA',
              borderRadius: 12,
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 12, color: COLORS.textSecondary }}>
              可填写残值或目标年限
            </div>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>
              查看更多使用价值分析
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
