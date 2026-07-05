import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOwnedItems, addOwnedItem } from '../data/store';
import { itemStatuses, useFrequencies } from '../utils/categories';
import { getItemStatusLabel } from '../utils/categories';
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
  marginBottom: 16,
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

// ==================== Step 4 主组件 ====================
export default function NewWishStep4() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevState = { ...getNewWishDraft(), ...(location.state || {}) };

  const category = prevState.category || '';

  const [ownedItems, setOwnedItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState(prevState.existingItems || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemStatus, setNewItemStatus] = useState('');
  const [newItemFrequency, setNewItemFrequency] = useState('');

  useEffect(() => {
    saveNewWishDraft({ existingItems: checkedItems });
  }, [checkedItems]);

  // 加载同类物品
  useEffect(() => {
    const allItems = getOwnedItems();
    const sameCategory = allItems.filter(
      (item) => item.category === category
    );
    setOwnedItems(sameCategory);
  }, [category]);

  const toggleCheck = (itemName) => {
    setCheckedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((n) => n !== itemName)
        : [...prev, itemName]
    );
  };

  // 新增已有物品
  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemStatus) return;

    addOwnedItem({
      name: newItemName.trim(),
      category,
      status: newItemStatus,
      frequency: newItemFrequency || '',
    });

    // 刷新列表
    const allItems = getOwnedItems();
    const sameCategory = allItems.filter(
      (item) => item.category === category
    );
    setOwnedItems(sameCategory);

    // 重置表单
    setNewItemName('');
    setNewItemStatus('');
    setNewItemFrequency('');
    setShowAddForm(false);
  };

  // 跳过
  const handleSkip = () => {
    const nextState = {
      ...prevState,
      existingItems: checkedItems,
    };
    saveNewWishDraft(nextState);
    // 生成购买建议 -> 导航到结果页
    navigate('/new/result', { state: nextState });
  };

  // 生成购买建议
  const handleGenerate = () => {
    const nextState = {
      ...prevState,
      existingItems: checkedItems,
    };
    saveNewWishDraft(nextState);
    navigate('/new/result', { state: nextState });
  };

  const handlePrev = () => {
    const nextState = {
      ...prevState,
      existingItems: checkedItems,
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
        <button style={backBtnStyle} onClick={handlePrev}>
          &#8592;
        </button>
        <span style={titleStyle}>记录想买 (4/4)</span>
        <StepIndicator current={4} />
      </div>

      {/* 内容区域 */}
      <div style={{ padding: '20px' }}>
        {/* 标题 + 新增按钮 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text }}>
              同类已有物品
            </div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>
              分类：{category || '未选择'}
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '8px 14px',
              borderRadius: 20,
              border: `1px solid ${COLORS.primary}`,
              background: showAddForm ? COLORS.primary : COLORS.card,
              color: showAddForm ? '#FFFFFF' : COLORS.primary,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            + 新增已有物品
          </button>
        </div>

        {/* 新增已有物品表单（内联） */}
        {showAddForm && (
          <div
            style={{
              background: COLORS.card,
              borderRadius: COLORS.radiusCard,
              boxShadow: COLORS.shadowCard,
              padding: 16,
              marginBottom: 16,
              border: `1px solid ${COLORS.primary}`,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 12 }}>
              新增已有物品
            </div>

            <div style={fieldGroupStyle}>
              <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 }}>
                名称
              </div>
              <input
                type="text"
                style={inputStyle}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="物品名称"
              />
            </div>

            <div style={fieldGroupStyle}>
              <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 }}>
                状态
              </div>
              <select
                style={selectStyle}
                value={newItemStatus}
                onChange={(e) => setNewItemStatus(e.target.value)}
              >
                <option value="">选择状态</option>
                {itemStatuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={fieldGroupStyle}>
              <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 }}>
                使用频率
              </div>
              <select
                style={selectStyle}
                value={newItemFrequency}
                onChange={(e) => setNewItemFrequency(e.target.value)}
              >
                <option value="">选择频率</option>
                {useFrequencies.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleAddItem}
              style={{
                width: '100%',
                padding: '12px 0',
                border: 'none',
                borderRadius: 12,
                background: COLORS.primary,
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              保存
            </button>
          </div>
        )}

        {/* 已有物品列表 */}
        <div
          style={{
            background: COLORS.card,
            borderRadius: COLORS.radiusCard,
            boxShadow: COLORS.shadowCard,
            padding: 20,
          }}
        >
          {ownedItems.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px 0',
                color: COLORS.textSecondary,
                fontSize: 14,
              }}
            >
              暂无同类物品记录
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ownedItems.map((item) => {
                const isChecked = checkedItems.includes(item.name);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: isChecked ? COLORS.primaryLight : COLORS.divider,
                      border: isChecked
                        ? `1px solid ${COLORS.primary}`
                        : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border: isChecked
                          ? `2px solid ${COLORS.primary}`
                          : `2px solid ${COLORS.border}`,
                        background: isChecked ? COLORS.primary : COLORS.card,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isChecked && (
                        <span style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 1 }}>
                          &#10003;
                        </span>
                      )}
                    </div>

                    {/* 物品信息 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: COLORS.text,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        {/* 状态标签 */}
                        <span
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 10,
                            background: item.status === 'frequent'
                              ? '#E8F5E9'
                              : item.status === 'idle'
                              ? '#FFF8E6'
                              : item.status === 'used_up' || item.status === 'expired'
                              ? '#FFF0F0'
                              : '#F0F4FF',
                            color: item.status === 'frequent'
                              ? '#4CAF50'
                              : item.status === 'idle'
                              ? '#F5A623'
                              : item.status === 'used_up' || item.status === 'expired'
                              ? '#E8736C'
                              : '#89C4E1',
                          }}
                        >
                          {getItemStatusLabel(item.status)}
                        </span>
                        {/* 使用频率 */}
                        {item.frequency && (
                          <span
                            style={{
                              fontSize: 11,
                              color: COLORS.textSecondary,
                              padding: '2px 8px',
                              borderRadius: 10,
                              background: '#F5F5F5',
                            }}
                          >
                            {item.frequency}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 已勾选统计 */}
          {checkedItems.length > 0 && (
            <div
              style={{
                marginTop: 12,
                padding: '8px 0',
                fontSize: 12,
                color: COLORS.primary,
                fontWeight: 500,
              }}
            >
              已选择 {checkedItems.length} 件物品作为参考
            </div>
          )}
        </div>

        {/* 按钮组 */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button
            onClick={handleSkip}
            style={{
              flex: 1,
              padding: '14px 0',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 12,
              background: COLORS.card,
              color: COLORS.textSecondary,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            跳过
          </button>
          <button
            onClick={handleGenerate}
            style={{
              flex: 1,
              padding: '14px 0',
              border: 'none',
              borderRadius: 12,
              background: COLORS.primary,
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            生成购买建议
          </button>
        </div>
      </div>
    </div>
  );
}
