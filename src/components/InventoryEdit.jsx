import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getOwnedItemById,
  saveOwnedItem,
  deleteOwnedItem,
} from '../data/store';
import { purchaseCategories, itemStatuses, useFrequencies } from '../utils/categories';
import UseValueCard from './UseValueCard';
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
  display: 'block',
};

const fieldGroupStyle = {
  marginBottom: 16,
};

// ==================== 星级评分组件 ====================
function StarRating({ value, onChange }) {
  const [hoverValue, setHoverValue] = useState(0);

  const handleClick = (star) => {
    onChange(star);
  };

  const handleMouseEnter = (star) => {
    setHoverValue(star);
  };

  const handleMouseLeave = () => {
    setHoverValue(0);
  };

  const displayValue = hoverValue || value;

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          style={{
            fontSize: 28,
            cursor: 'pointer',
            color: star <= displayValue ? '#FFB800' : '#E0E0DC',
            transition: 'color 0.15s ease',
            lineHeight: 1,
          }}
        >
          {star <= displayValue ? '\u2605' : '\u2606'}
        </span>
      ))}
    </div>
  );
}

// ==================== 单选按钮组组件 ====================
function RadioGroup({ options, value, onChange, renderLabel }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => {
        const optionValue = typeof option === 'string' ? option : option.value;
        const optionLabel = renderLabel
          ? renderLabel(option)
          : typeof option === 'string'
            ? option
            : option.label;

        const isSelected = value === optionValue;

        return (
          <button
            key={optionValue}
            onClick={() => onChange(optionValue)}
            style={{
              padding: '8px 14px',
              borderRadius: 20,
              border: isSelected
                ? `1px solid ${COLORS.primary}`
                : `1px solid ${COLORS.border}`,
              background: isSelected ? COLORS.primaryLight : COLORS.card,
              color: isSelected ? COLORS.primary : COLORS.textSecondary,
              fontSize: 13,
              fontWeight: isSelected ? 500 : 400,
              cursor: 'pointer',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              transition: 'all 0.2s ease',
            }}
          >
            {optionLabel}
          </button>
        );
      })}
    </div>
  );
}

// ==================== 删除确认弹窗 ====================
function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
      }}
    >
      <div
        style={{
          background: COLORS.card,
          borderRadius: COLORS.radiusCard,
          padding: '24px 20px',
          width: '80%',
          maxWidth: 320,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: COLORS.text,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          确认删除
        </div>
        <div
          style={{
            fontSize: 14,
            color: COLORS.textSecondary,
            textAlign: 'center',
            marginBottom: 20,
          }}
        >
          删除后无法恢复，确定要删除这个物品吗？
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 0',
              border: `1px solid ${COLORS.border}`,
              borderRadius: COLORS.radiusButton,
              background: COLORS.card,
              color: COLORS.textSecondary,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px 0',
              border: 'none',
              borderRadius: COLORS.radiusButton,
              background: COLORS.danger,
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 主组件 ====================
export default function InventoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  // 表单状态
  const [form, setForm] = useState({
    name: '',
    category: '',
    purchaseDate: '',
    price: '',
    expiryDate: '',
    status: '',
    frequency: '',
    satisfaction: 0,
    notes: '',
    // 使用价值相关字段
    targetUseYears: '',
    estimatedResaleValue: '',
    isStillUsing: true,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadedItem, setLoadedItem] = useState(null);

  // 编辑模式：加载已有数据
  useEffect(() => {
    if (id) {
      const item = getOwnedItemById(id);
      if (item) {
        setLoadedItem(item);
        // 将日期格式化为 YYYY-MM-DD 供 input type="date" 使用
        const purchaseDate = item.purchaseDate
          ? new Date(item.purchaseDate).toISOString().split('T')[0]
          : '';
        const expiryDate = item.expiryDate
          ? new Date(item.expiryDate).toISOString().split('T')[0]
          : '';

        setForm({
          name: item.name || '',
          category: item.category || '',
          purchaseDate,
          price: item.price != null ? String(item.price) : '',
          expiryDate,
          status: item.status || '',
          frequency: item.frequency || '',
          satisfaction: item.satisfaction || 0,
          notes: item.notes || '',
          // 使用价值相关字段
          targetUseYears: item.targetUseYears != null ? String(item.targetUseYears) : '',
          estimatedResaleValue: item.estimatedResaleValue != null ? String(item.estimatedResaleValue) : '',
          isStillUsing: item.isStillUsing !== false && item.isStillUsing !== undefined ? true : Boolean(item.isStillUsing),
        });
      } else {
        // 未找到记录，返回列表
        navigate('/inventory');
      }
    }
  }, [id]);

  // 更新表单字段
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 验证表单
  const validate = () => {
    if (!form.name.trim()) {
      alert('请输入物品名称');
      return false;
    }
    if (!form.category) {
      alert('请选择分类');
      return false;
    }
    return true;
  };

  // 保存
  const handleSave = () => {
    if (!validate()) return;

    setSaving(true);

    const itemData = {
      name: form.name.trim(),
      category: form.category,
      purchaseDate: form.purchaseDate || null,
      price: form.price ? parseFloat(form.price) : 0,
      expiryDate: form.expiryDate || null,
      status: form.status || 'frequent',
      frequency: form.frequency || '',
      satisfaction: form.satisfaction,
      notes: form.notes || '',
      // 使用价值相关字段
      targetUseYears: form.targetUseYears ? parseFloat(form.targetUseYears) : undefined,
      estimatedResaleValue: form.estimatedResaleValue ? parseFloat(form.estimatedResaleValue) : undefined,
      isStillUsing: form.isStillUsing,
    };

    if (isEditMode) {
      itemData.id = id;
    }

    saveOwnedItem(itemData);

    setSaving(false);
    navigate('/inventory');
  };

  // 删除
  const handleDelete = () => {
    deleteOwnedItem(id);
    navigate('/inventory');
  };

  const pageTitle = isEditMode ? '编辑物品' : '新增物品';

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
        <button style={backBtnStyle} onClick={() => navigate('/inventory')}>
          &#8592;
        </button>
        <span style={titleStyle}>{pageTitle}</span>
        <div style={{ width: 20 }} />
      </div>

      {/* 表单内容 */}
      <div style={{ padding: '20px' }}>
        {/* 编辑模式：顶部展示使用价值卡片 */}
        {isEditMode && loadedItem && <UseValueCard item={loadedItem} />}

        {/* 物品名称 */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            物品名称 <span style={{ color: COLORS.danger }}>*</span>
          </label>
          <input
            type="text"
            style={inputStyle}
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="输入物品名称"
          />
        </div>

        {/* 分类 */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            分类 <span style={{ color: COLORS.danger }}>*</span>
          </label>
          <select
            style={selectStyle}
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
          >
            <option value="">选择分类</option>
            {purchaseCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 购买日期 */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>购买日期</label>
          <input
            type="date"
            style={inputStyle}
            value={form.purchaseDate}
            onChange={(e) => updateField('purchaseDate', e.target.value)}
          />
        </div>

        {/* 购买价格 */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>购买价格</label>
          <input
            type="number"
            style={inputStyle}
            value={form.price}
            onChange={(e) => updateField('price', e.target.value)}
            placeholder="输入价格（元）"
            min="0"
            step="0.01"
          />
        </div>

        {/* 保质期/过期日 */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>保质期/过期日</label>
          <input
            type="date"
            style={inputStyle}
            value={form.expiryDate}
            onChange={(e) => updateField('expiryDate', e.target.value)}
          />
        </div>

        {/* 当前状态 */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>当前状态</label>
          <RadioGroup
            options={itemStatuses}
            value={form.status}
            onChange={(val) => updateField('status', val)}
            renderLabel={(option) => option.label}
          />
        </div>

        {/* 使用频率 */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>使用频率</label>
          <RadioGroup
            options={useFrequencies}
            value={form.frequency}
            onChange={(val) => updateField('frequency', val)}
          />
        </div>

        {/* 满意度 */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>满意度</label>
          <StarRating
            value={form.satisfaction}
            onChange={(val) => updateField('satisfaction', val)}
          />
        </div>

        {/* 是否仍在使用 */}
        <div
          style={{
            ...fieldGroupStyle,
            padding: '14px 16px',
            background: '#F8F9FA',
            borderRadius: COLORS.radiusCard,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: COLORS.text }}>
              是否仍在使用
            </span>
            <div
              onClick={() => updateField('isStillUsing', !form.isStillUsing)}
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                background: form.isStillUsing ? COLORS.primary : '#DDD',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
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
                  left: form.isStillUsing ? 23 : 3,
                  transition: 'left 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
              />
            </div>
          </div>
        </div>

        {/* 目标使用年限（可选） */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            目标使用年限（可选）
          </label>
          <input
            type="number"
            style={inputStyle}
            value={form.targetUseYears}
            onChange={(e) => updateField('targetUseYears', e.target.value)}
            placeholder="例如：5（年）"
            min="0.5"
            step="0.5"
          />
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>
            适合电子产品、家具家电等
          </div>
        </div>

        {/* 预计残值（可选） */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>
            预计残值（可选）
          </label>
          <input
            type="number"
            style={inputStyle}
            value={form.estimatedResaleValue}
            onChange={(e) => updateField('estimatedResaleValue', e.target.value)}
            placeholder="例如：2000（元）"
            min="0"
            step="100"
          />
          <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>
            适合电脑、手机、相机、包等
          </div>
        </div>

        {/* 备注 */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>备注</label>
          <textarea
            style={{
              ...inputStyle,
              minHeight: 100,
              resize: 'vertical',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            }}
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="备注信息（可选）"
          />
        </div>

        {/* 按钮区 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              padding: '14px 0',
              border: 'none',
              borderRadius: COLORS.radiusButton,
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              boxShadow: '0 4px 16px rgba(124,106,242,0.22)',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? '保存中...' : '保存'}
          </button>

          {/* 删除按钮（仅编辑模式） */}
          {isEditMode && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: '100%',
                padding: '14px 0',
                border: `1px solid ${COLORS.danger}`,
                borderRadius: COLORS.radiusButton,
                background: COLORS.card,
                color: COLORS.danger,
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              删除物品
            </button>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <DeleteConfirm
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
