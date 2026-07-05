import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMonthlyBudget, getAnnualBudget } from '../data/store';
import COLORS from '../theme';

const navBarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  position: 'sticky',
  top: 0,
  background: COLORS.bg,
  zIndex: 10,
};

const titleStyle = {
  fontSize: 16,
  fontWeight: 600,
  color: COLORS.text,
};

const backBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: 20,
  cursor: 'pointer',
  color: COLORS.text,
  padding: 0,
  lineHeight: 1,
};

const inputStyle = {
  width: '100%',
  border: `1px solid ${COLORS.border}`,
  borderRadius: COLORS.radiusInput,
  padding: '12px 16px',
  fontSize: 14,
  color: COLORS.text,
  outline: 'none',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  boxSizing: 'border-box',
};

const labelStyle = {
  fontSize: 14,
  fontWeight: 500,
  color: COLORS.text,
  marginBottom: 8,
};

const fieldGroupStyle = {
  marginBottom: 20,
};

const nextBtnStyle = {
  flex: 1,
  padding: '14px 0',
  border: 'none',
  borderRadius: COLORS.radiusButton,
  background: COLORS.primary,
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const prevBtnStyle = {
  flex: 1,
  padding: '14px 0',
  border: `1px solid ${COLORS.border}`,
  borderRadius: COLORS.radiusButton,
  background: COLORS.card,
  color: COLORS.text,
  fontSize: 16,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

// ==================== 步骤进度指示器 ====================
function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {[1, 2, 3, 4].map((step) => (
        <div
          key={step}
          style={{
            width: step === current ? 24 : 10,
            height: 10,
            borderRadius: 5,
            background: step <= current ? COLORS.primary : '#E0E0DC',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

// ==================== Toggle 开关 ====================
function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        background: checked ? COLORS.primary : '#DDD',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s ease',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          background: '#FFFFFF',
          position: 'absolute',
          top: 3,
          left: checked ? 23 : 3,
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  );
}

// ==================== 预算信息展示 ====================
function BudgetInfoBar() {
  const monthly = getMonthlyBudget();
  const annual = getAnnualBudget();
  const monthlyRemaining = monthly.total - monthly.used - monthly.reserved;
  const annualRemaining = annual.total - annual.used - annual.reserved;

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 12,
        color: COLORS.textSecondary,
      }}
    >
      <div>
        月度剩余：<span style={{ color: COLORS.primary, fontWeight: 600 }}>
          {monthlyRemaining.toLocaleString()}
        </span> 元
      </div>
      <div>
        年度剩余：<span style={{ color: COLORS.primary, fontWeight: 600 }}>
          {annualRemaining.toLocaleString()}
        </span> 元
      </div>
    </div>
  );
}

// ==================== 单选卡片 ====================
function RadioOption({ label, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        border: selected
          ? `2px solid ${COLORS.primary}`
          : `1px solid ${COLORS.border}`,
        background: selected ? COLORS.primaryLight : COLORS.card,
        cursor: 'pointer',
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          border: selected
            ? `2px solid ${COLORS.primary}`
            : `2px solid ${COLORS.border}`,
          background: selected ? COLORS.primary : COLORS.card,
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {selected && (
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: '#FFFFFF',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>
      <span
        style={{
          fontSize: 14,
          color: COLORS.text,
          fontWeight: selected ? 500 : 400,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ==================== Step 3 主组件 ====================
export default function NewWishStep3() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevState = location.state || {};

  const [budgetType, setBudgetType] = useState(prevState.budgetType || '');
  const [monthlyPayment, setMonthlyPayment] = useState(prevState.monthlyPayment || '');
  const [annualPayment, setAnnualPayment] = useState(prevState.annualPayment || '');
  const [installment, setInstallment] = useState(prevState.installment || false);
  const [installmentMonths, setInstallmentMonths] = useState(prevState.installmentMonths || '');
  const [monthlyInstallment, setMonthlyInstallment] = useState(prevState.monthlyInstallment || 0);

  // 自动计算每期金额
  const computedMonthlyInstallment =
    installment && installmentMonths && annualPayment
      ? (parseFloat(annualPayment) / parseInt(installmentMonths, 10)).toFixed(2)
      : 0;

  const handlePrev = () => {
    navigate('/new/step2', {
      state: {
        ...prevState,
        budgetType,
        monthlyPayment: monthlyPayment ? parseFloat(monthlyPayment) : 0,
        annualPayment: annualPayment ? parseFloat(annualPayment) : 0,
        installment,
        installmentMonths: installmentMonths ? parseInt(installmentMonths, 10) : 0,
        monthlyInstallment: parseFloat(computedMonthlyInstallment) || 0,
      },
    });
  };

  const handleNext = () => {
    navigate('/new/step4', {
      state: {
        ...prevState,
        budgetType,
        monthlyPayment: monthlyPayment ? parseFloat(monthlyPayment) : 0,
        annualPayment: annualPayment ? parseFloat(annualPayment) : 0,
        installment,
        installmentMonths: installment && installmentMonths ? parseInt(installmentMonths, 10) : 0,
        monthlyInstallment: parseFloat(computedMonthlyInstallment) || 0,
      },
    });
  };

  const isBothBudget = budgetType === '同时影响月度和年度预算';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.bg,
        paddingBottom: 40,
      }}
    >
      {/* 顶部导航栏 */}
      <div style={navBarStyle}>
        <button style={backBtnStyle} onClick={() => navigate(-1)}>
          &#8592;
        </button>
        <span style={titleStyle}>记录想买 (3/4)</span>
        <StepIndicator current={3} />
      </div>

      {/* 表单内容 */}
      <div style={{ padding: '20px' }}>
        {/* 预算信息 */}
        <BudgetInfoBar />

        <div
          style={{
            background: COLORS.card,
            borderRadius: COLORS.radiusCard,
            boxShadow: COLORS.shadowCard,
            padding: 20,
          }}
        >
          {/* 预算类型选择 */}
          <div style={fieldGroupStyle}>
            <div style={labelStyle}>预算来源</div>
            <RadioOption
              label="占用月度预算"
              selected={budgetType === '占用月度预算'}
              onClick={() => setBudgetType('占用月度预算')}
            />
            <RadioOption
              label="占用年度预算"
              selected={budgetType === '占用年度预算'}
              onClick={() => setBudgetType('占用年度预算')}
            />
            <RadioOption
              label="同时影响月度和年度预算"
              selected={budgetType === '同时影响月度和年度预算'}
              onClick={() => setBudgetType('同时影响月度和年度预算')}
            />
          </div>

          {/* 同时影响月度和年度的详细配置 */}
          {isBothBudget && (
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: COLORS.divider,
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              {/* 本月实际支付金额 */}
              <div style={fieldGroupStyle}>
                <div style={labelStyle}>本月实际支付金额（元）</div>
                <input
                  type="number"
                  style={inputStyle}
                  value={monthlyPayment}
                  onChange={(e) => setMonthlyPayment(e.target.value)}
                  placeholder="请输入本月支付金额"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* 年度总占用金额 */}
              <div style={fieldGroupStyle}>
                <div style={labelStyle}>年度总占用金额（元）</div>
                <input
                  type="number"
                  style={inputStyle}
                  value={annualPayment}
                  onChange={(e) => setAnnualPayment(e.target.value)}
                  placeholder="请输入年度总金额"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* 是否分期 */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: installment ? 16 : 0,
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.text }}>
                  是否分期
                </div>
                <Toggle
                  checked={installment}
                  onChange={() => setInstallment(!installment)}
                />
              </div>

              {/* 分期期数（仅分期开启时显示） */}
              {installment && (
                <>
                  <div style={fieldGroupStyle}>
                    <div style={labelStyle}>分期期数</div>
                    <input
                      type="number"
                      style={inputStyle}
                      value={installmentMonths}
                      onChange={(e) => setInstallmentMonths(e.target.value)}
                      placeholder="请输入分期期数"
                      min="1"
                      step="1"
                    />
                  </div>

                  {/* 每期金额（自动计算） */}
                  {computedMonthlyInstallment > 0 && (
                    <div
                      style={{
                        padding: '12px 16px',
                        background: COLORS.primaryLight,
                        borderRadius: 12,
                        fontSize: 14,
                        color: COLORS.primary,
                        fontWeight: 600,
                      }}
                    >
                      每期金额：{parseFloat(computedMonthlyInstallment).toLocaleString()} 元
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* 按钮组 */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button style={prevBtnStyle} onClick={handlePrev}>
            上一步
          </button>
          <button style={nextBtnStyle} onClick={handleNext}>
            下一步
          </button>
        </div>
      </div>
    </div>
  );
}
