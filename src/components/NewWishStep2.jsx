import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usageScenes, frequencies } from '../utils/categories';
import { getNewWishDraft, saveNewWishDraft } from '../utils/newWishDraft';
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

const textareaStyle = {
  ...inputStyle,
  minHeight: 80,
  resize: 'vertical',
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

// ==================== Step 2 主组件 ====================
export default function NewWishStep2() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevState = { ...getNewWishDraft(), ...(location.state || {}) };

  const [selectedScenes, setSelectedScenes] = useState(prevState.usageScenes || []);
  const [frequency, setFrequency] = useState(prevState.frequency || '');
  const [alternatives, setAlternatives] = useState(prevState.alternatives || '');
  const [notes, setNotes] = useState(prevState.notes || '');

  useEffect(() => {
    saveNewWishDraft({
      usageScenes: selectedScenes,
      frequency,
      alternatives,
      notes,
    });
  }, [selectedScenes, frequency, alternatives, notes]);

  const toggleScene = (scene) => {
    setSelectedScenes((prev) =>
      prev.includes(scene)
        ? prev.filter((s) => s !== scene)
        : [...prev, scene]
    );
  };

  const handlePrev = () => {
    const nextState = {
      ...prevState,
      usageScenes: selectedScenes,
      frequency,
      alternatives,
      notes,
    };
    saveNewWishDraft(nextState);
    navigate('/new/step1', { state: nextState });
  };

  const handleNext = () => {
    const nextState = {
      ...prevState,
      usageScenes: selectedScenes,
      frequency,
      alternatives: alternatives.trim(),
      notes: notes.trim(),
    };
    saveNewWishDraft(nextState);
    navigate('/new/step3', { state: nextState });
  };

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
        <span style={titleStyle}>记录心愿 · 2/4</span>
        <StepIndicator current={2} />
      </div>

      {/* 表单内容 */}
      <div style={{ padding: '20px' }}>
        <div
          style={{
            background: COLORS.card,
            borderRadius: COLORS.radiusCard,
            boxShadow: COLORS.shadowCard,
            padding: 20,
          }}
        >
          {/* 你打算什么时候用？ - 多选标签 */}
          <div style={fieldGroupStyle}>
            <div style={labelStyle}>你打算什么时候用？</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {usageScenes.map((scene) => {
                const isSelected = selectedScenes.includes(scene);
                return (
                  <button
                    key={scene}
                    onClick={() => toggleScene(scene)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      border: isSelected
                        ? 'none'
                        : `1px solid ${COLORS.border}`,
                      background: isSelected
                        ? COLORS.primary
                        : COLORS.card,
                      color: isSelected
                        ? '#FFFFFF'
                        : COLORS.textSecondary,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {scene}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 大概多久用一次？ - 单选 */}
          <div style={fieldGroupStyle}>
            <div style={labelStyle}>大概多久用一次？</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {frequencies.map((freq) => {
                const isSelected = frequency === freq;
                return (
                  <button
                    key={freq}
                    onClick={() => setFrequency(freq)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 20,
                      border: isSelected
                        ? 'none'
                        : `1px solid ${COLORS.border}`,
                      background: isSelected
                        ? COLORS.primary
                        : COLORS.card,
                      color: isSelected
                        ? '#FFFFFF'
                        : COLORS.textSecondary,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {freq}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 已有替代或补充说明 */}
          <div style={fieldGroupStyle}>
            <div style={labelStyle}>已有替代或补充说明</div>
            <input
              type="text"
              style={inputStyle}
              value={alternatives}
              onChange={(e) => setAlternatives(e.target.value)}
              placeholder="例如：已有的旧耳机、其他品牌平替"
            />
          </div>

          {/* 还有什么想补充？ */}
          <div style={fieldGroupStyle}>
            <div style={labelStyle}>还有什么想补充？</div>
            <textarea
              style={textareaStyle}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="补充说明（可选）"
            />
          </div>
        </div>

        {/* 按钮组 */}
        <div style={{ display: 'flex', gap: 12 }}>
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
