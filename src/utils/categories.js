/**
 * 分类和场景常量定义
 * 统一管理 App 中使用的所有分类、场景、频率、状态等选项
 */

// ==================== 购买分类 ====================

/**
 * 物品购买分类
 * 用于想买记录的分类字段
 */
export const purchaseCategories = [
  '美妆',
  '护肤',
  '衣服',
  '鞋包',
  '电子产品',
  '演出/追星',
  '旅行',
  '医美',
  '健康刚需',
  '工作工具',
  '日常生活',
  '学习/考试',
  '家具家电',
  '其他',
];

// ==================== 使用场景 ====================

/**
 * 使用场景选项
 * 用于想买记录的 usageScenes 数组字段
 */
export const usageScenes = [
  '上班',
  '通勤',
  '旅行',
  '拍照',
  '演唱会',
  '追星',
  '约会',
  '日常',
  '医美变美',
  '健康需要',
  '学习',
  '家用',
  '其他',
];

// ==================== 预期使用频率 ====================

/**
 * 想买物品的预期使用频率
 * 用于想买记录的 frequency 字段
 */
export const frequencies = [
  '几乎每天',
  '每周几次',
  '每月几次',
  '偶尔',
  '可能只用一次',
  '不确定',
];

// ==================== 已有物品状态 ====================

/**
 * 已有物品的使用状态
 * 用于已有物品的 status 字段
 */
export const itemStatuses = [
  { value: 'frequent', label: '常用' },
  { value: 'occasional', label: '偶尔用' },
  { value: 'idle', label: '闲置' },
  { value: 'running_low', label: '快用完' },
  { value: 'used_up', label: '已用完' },
  { value: 'expiring', label: '快过期' },
  { value: 'expired', label: '已过期' },
];

/**
 * 获取物品状态对应的中文标签
 * @param {string} value - 状态值
 * @returns {string} 中文标签
 */
export function getItemStatusLabel(value) {
  const status = itemStatuses.find((s) => s.value === value);
  return status ? status.label : value;
}

// ==================== 已有物品使用频率 ====================

/**
 * 已有物品的实际使用频率
 * 用于已有物品的 frequency 字段
 */
export const useFrequencies = [
  '几乎每天',
  '每周几次',
  '每月几次',
  '偶尔',
  '几乎不用',
];

// ==================== 预算类型 ====================

/**
 * 预算类型选项
 * 用于想买记录的 budgetType 字段
 */
export const budgetTypes = [
  '占用月度预算',
  '占用年度预算',
  '同时影响月度和年度预算',
];

// ==================== 购买状态 ====================

/**
 * 想买记录的状态
 * 用于想买记录的 status 字段和筛选
 */
export const purchaseStatuses = [
  { value: 'all', label: '全部' },
  { value: 'wishlist', label: '冷静期' },
  { value: 'buy', label: '建议购买' },
  { value: 'skip', label: '不建议现在买' },
  { value: 'purchased', label: '已购买' },
  { value: 'given_up', label: '已放弃' },
  { value: 'annual_plan', label: '年度计划' },
];

/**
 * 获取购买状态对应的中文标签
 * @param {string} value - 状态值
 * @returns {string} 中文标签
 */
export function getPurchaseStatusLabel(value) {
  const status = purchaseStatuses.find((s) => s.value === value);
  return status ? status.label : value;
}

/**
 * 购买状态颜色映射
 * 用于 UI 中给不同状态设置不同的视觉颜色
 */
export const purchaseStatusColors = {
  all: '#6B7280',        // 灰色 - 全部
  wishlist: '#F59E0B',   // 橙色 - 冷静期
  buy: '#10B981',        // 绿色 - 建议购买
  skip: '#EF4444',        // 红色 - 不建议现在买
  purchased: '#3B82F6',  // 蓝色 - 已购买
  given_up: '#9CA3AF',    // 浅灰 - 已放弃
  annual_plan: '#8B5CF6', // 紫色 - 年度计划
};

/**
 * 物品状态颜色映射
 * 用于 UI 中给不同物品状态设置不同的视觉颜色
 */
export const itemStatusColors = {
  frequent: '#10B981',    // 绿色 - 常用
  occasional: '#3B82F6',  // 蓝色 - 偶尔用
  idle: '#F59E0B',        // 橙色 - 闲置
  running_low: '#F97316', // 深橙 - 快用完
  used_up: '#EF4444',      // 红色 - 已用完
  expiring: '#EC4899',    // 粉色 - 快过期
  expired: '#6B7280',     // 灰色 - 已过期
};

/**
 * 满意度选项
 * 用于已有物品的 satisfaction 字段
 */
export const satisfactions = [
  '很满意',
  '满意',
  '一般',
  '不满意',
  '很不满意',
];
