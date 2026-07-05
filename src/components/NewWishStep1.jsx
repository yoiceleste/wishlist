import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { purchaseCategories } from '../utils/categories';
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

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path fill=%22%23888888%22 d=%22M2 4l4 4 4-4%22/></svg>')",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 16px center',
  paddingRight: 36,
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
  width: '100%',
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

const errorMsgStyle = {
  fontSize: 12,
  color: '#E8736C',
  marginTop: 4,
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

// ==================== Step 1 主组件 ====================
export default function NewWishStep1() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevState = { ...getNewWishDraft(), ...(location.state || {}) };

  const [name, setName] = useState(prevState.name || '');
  const [category, setCategory] = useState(prevState.category || '');
  const [price, setPrice] = useState(prevState.price || '');
  const [purpose, setPurpose] = useState(prevState.purpose || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    saveNewWishDraft({
      name,
      category,
      price,
      purpose,
    });
  }, [name, category, price, purpose]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = '请输入物品名称';
    if (!category) newErrors.category = '请选择分类';
    if (!price || parseFloat(price) <= 0) newErrors.price = '请输入有效价格';
    if (!purpose.trim()) newErrors.purpose = '请输入购买目的';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    const nextState = {
      ...prevState,
      name: name.trim(),
      category,
      price: parseFloat(price),
      purpose: purpose.trim(),
    };
    saveNewWishDraft(nextState);

    navigate('/new/step2', { state: nextState });
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
        <span style={titleStyle}>记录想买 (1/4)</span>
        <StepIndicator current={1} />
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
          {/* 物品名称 */}
          <div style={fieldGroupStyle}>
            <div style={labelStyle}>
              物品名称 <span style={{ color: '#E8736C' }}>*</span>
            </div>
            <input
              type="text"
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：AirPods Pro"
            />
            {errors.name && <div style={errorMsgStyle}>{errors.name}</div>}
          </div>

          {/* 分类 */}
          <div style={fieldGroupStyle}>
            <div style={labelStyle}>
              分类 <span style={{ color: '#E8736C' }}>*</span>
            </div>
            <select style={selectStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">请选择分类</option>
              {purchaseCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <div style={errorMsgStyle}>{errors.category}</div>}
          </div>

          {/* 价格 */}
          <div style={fieldGroupStyle}>
            <div style={labelStyle}>
              价格（元） <span style={{ color: '#E8736C' }}>*</span>
            </div>
            <input
              type="number"
              style={inputStyle}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="请输入价格"
              min="0"
              step="0.01"
            />
            {errors.price && <div style={errorMsgStyle}>{errors.price}</div>}
          </div>

          {/* 购买目的 */}
          <div style={fieldGroupStyle}>
            <div style={labelStyle}>
              购买目的 <span style={{ color: '#E8736C' }}>*</span>
            </div>
            <input
              type="text"
              style={inputStyle}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="例如：通勤降噪、提升效率"
            />
            {errors.purpose && <div style={errorMsgStyle}>{errors.purpose}</div>}
          </div>
        </div>

        {/* 下一步按钮 */}
        <button style={nextBtnStyle} onClick={handleNext}>
          下一步
        </button>
      </div>
    </div>
  );
}
