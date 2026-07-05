import React, { useState, useEffect } from 'react';
import {
  getMonthlyBudget,
  setMonthlyBudget,
  getAnnualBudget,
  setAnnualBudget,
} from '../data/store';
import COLORS from '../theme';

const cardStyle = {
  background: COLORS.card,
  borderRadius: COLORS.radiusCard,
  boxShadow: COLORS.shadowCard,
  padding: 20,
  marginBottom: 16,
};

const inputStyle = {
  width: '100%',
  border: `1px solid ${COLORS.border}`,
  borderRadius: 12,
  padding: '12px 16px',
  fontSize: 14,
  color: COLORS.text,
  outline: 'none',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 13,
  color: COLORS.textSecondary,
  marginBottom: 6,
  fontWeight: 500,
};

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 12,
};

const saveBtnStyle = {
  width: '100%',
  padding: '14px 0',
  border: 'none',
  borderRadius: 12,
  background: COLORS.primary,
  color: '#FFFFFF',
  fontSize: 15,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

// ==================== 预算卡片子组件 ====================
function BudgetCardSection({ title, icon, budget, onSave }) {
  const [editableBudget, setEditableBudget] = useState(budget);

  useEffect(() => {
    setEditableBudget(budget);
  }, [budget]);

  const total = editableBudget.total || 0;
  const used = editableBudget.used || 0;
  const reserved = editableBudget.reserved || 0;
  const remaining = total - used - reserved;
  const usedPercent = total > 0 ? Math.min(((used + reserved) / total) * 100, 100) : 0;

  // 进度条颜色
  let barColor = COLORS.primary;
  if (usedPercent > 90) barColor = COLORS.danger;
  else if (usedPercent > 70) barColor = COLORS.warning;

  // 剩余颜色
  let remainColor = COLORS.primary;
  if (remaining < 0) remainColor = COLORS.danger;
  else if (total > 0 && remaining < total * 0.2) remainColor = COLORS.warning;

  const handleFieldChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setEditableBudget((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleNoteChange = (e) => {
    setEditableBudget((prev) => ({ ...prev, note: e.target.value }));
  };

  const handleSave = () => {
    onSave(editableBudget);
  };

  return (
    <div style={cardStyle}>
      {/* 标题 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 24, marginRight: 8 }}>{icon}</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: COLORS.text }}>
          {title}
        </span>
      </div>

      {/* 可自由消费预算 */}
      <div style={{ marginBottom: 14 }}>
        <div style={labelStyle}>本月可自由消费预算（元）</div>
        <input
          type="number"
          style={inputStyle}
          value={editableBudget.total}
          onChange={(e) => handleFieldChange('total', e.target.value)}
          placeholder="请输入总预算"
        />
      </div>

      {/* 已用 / 已计划 */}
      <div style={rowStyle}>
        <div>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>
            已使用
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text }}>
            {editableBudget.used.toLocaleString()} 元
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>
            已计划
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text }}>
            {editableBudget.reserved.toLocaleString()} 元
          </div>
        </div>
      </div>

      {/* 必须预留金额 */}
      <div style={{ marginBottom: 14 }}>
        <div style={labelStyle}>必须预留金额（元）</div>
        <input
          type="number"
          style={inputStyle}
          value={editableBudget.reserved}
          onChange={(e) => handleFieldChange('reserved', e.target.value)}
          placeholder="请输入预留金额"
        />
      </div>

      {/* 剩余 & 进度条 */}
      <div style={{ marginBottom: 14 }}>
        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 }}>
              剩余 = 总预算 - 已用 - 预留
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: remainColor }}>
              {remaining.toLocaleString()} 元
            </div>
          </div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary }}>
            已使用 {usedPercent.toFixed(0)}%
          </div>
        </div>
        {/* 进度条 */}
        <div
          style={{
            width: '100%',
            height: 10,
            background: COLORS.border,
            borderRadius: 5,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${usedPercent}%`,
              height: '100%',
              background: barColor,
              borderRadius: 5,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* 备注 */}
      <div style={{ marginBottom: 16 }}>
        <div style={labelStyle}>备注</div>
        <input
          type="text"
          style={inputStyle}
          value={editableBudget.note || ''}
          onChange={handleNoteChange}
          placeholder="添加备注..."
        />
      </div>

      {/* 保存按钮 */}
      <button style={saveBtnStyle} onClick={handleSave}>
        保存
      </button>
    </div>
  );
}

// ==================== 预算管理主组件 ====================
export default function Budget() {
  const [monthlyBudget, setMonthlyBudgetState] = useState(null);
  const [annualBudget, setAnnualBudgetState] = useState(null);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    setMonthlyBudgetState(getMonthlyBudget());
    setAnnualBudgetState(getAnnualBudget());
  }, []);

  const handleSaveMonthly = (budget) => {
    setMonthlyBudget(budget);
    setMonthlyBudgetState(budget);
    showSaved('月度预算已保存');
  };

  const handleSaveAnnual = (budget) => {
    setAnnualBudget(budget);
    setAnnualBudgetState(budget);
    showSaved('年度预算已保存');
  };

  const showSaved = (msg) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 1500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.bg,
        paddingBottom: 40,
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
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.text,
            margin: 0,
          }}
        >
          预算管理
        </h1>
      </div>

      {/* 保存成功提示 */}
      {savedMsg && (
        <div
          style={{
            textAlign: 'center',
            padding: '8px 0',
            fontSize: 14,
            color: COLORS.primary,
            fontWeight: 500,
          }}
        >
          {savedMsg}
        </div>
      )}

      <div style={{ padding: '0 20px' }}>
        {/* 月度预算卡片 */}
        {monthlyBudget && (
          <BudgetCardSection
            title="月度预算"
            icon="💰"
            budget={monthlyBudget}
            onSave={handleSaveMonthly}
          />
        )}

        {/* 年度预算卡片 */}
        {annualBudget && (
          <BudgetCardSection
            title="年度预算"
            icon="💎"
            budget={annualBudget}
            onSave={handleSaveAnnual}
          />
        )}
      </div>
    </div>
  );
}
