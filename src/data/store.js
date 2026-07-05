/**
 * 数据存储层 - 基于 localStorage 的持久化存储
 *
 * 存储的数据结构：
 * - purchaseDecisions: 想买记录数组
 * - ownedItems: 已有物品数组
 * - monthlyBudget: 月度预算
 * - annualBudget: 年度预算
 */

// localStorage 中使用的 key 前缀，避免与其他应用冲突
const STORAGE_PREFIX = 'heartbeat_list_';

// 数据 key 常量
const KEYS = {
  PURCHASE_DECISIONS: `${STORAGE_PREFIX}purchase_decisions`,
  OWNED_ITEMS: `${STORAGE_PREFIX}owned_items`,
  MONTHLY_BUDGET: `${STORAGE_PREFIX}monthly_budget`,
  ANNUAL_BUDGET: `${STORAGE_PREFIX}annual_budget`,
};

/**
 * 从 localStorage 读取数据
 * @param {string} key - 存储的 key
 * @param {*} defaultValue - 数据不存在时的默认值
 * @returns {*} 解析后的数据，解析失败则返回默认值
 */
function get(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`[store] 读取 ${key} 失败:`, e);
    try {
      const corrupted = localStorage.getItem(key);
      if (corrupted !== null) {
        localStorage.setItem(
          `${key}_corrupted_${Date.now()}`,
          corrupted
        );
      }
    } catch (backupError) {
      console.error(`[store] 备份损坏数据 ${key} 失败:`, backupError);
    }
    return defaultValue;
  }
}

/**
 * 向 localStorage 写入数据
 * @param {string} key - 存储的 key
 * @param {*} value - 要存储的值（会被 JSON 序列化）
 */
function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`[store] 写入 ${key} 失败:`, e);
    return false;
  }
}

/**
 * 从 localStorage 中移除数据
 * @param {string} key - 存储的 key
 */
function remove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`[store] 移除 ${key} 失败:`, e);
    return false;
  }
}

// ==================== 想买记录 (purchaseDecisions) ====================

/**
 * purchaseDecisions 结构定义：
 * {
 *   id: string,               // 唯一标识，使用时间戳+随机数
 *   name: string,             // 物品名称
 *   category: string,         // 分类（美妆、护肤、衣服等）
 *   price: number,            // 价格（元）
 *   purpose: string,          // 购买目的
 *   usageScenes: string[],    // 使用场景数组
 *   frequency: string,        // 预期使用频率
 *   alternatives: string,     // 替代方案描述
 *   notes: string,            // 备注
 *   budgetType: string,       // 预算类型：占用月度预算/占用年度预算/同时影响月度和年度预算
 *   monthlyPayment: number,   // 月均分摊费用
 *   annualPayment: number,    // 年均分摊费用
 *   installment: boolean,     // 是否分期
 *   installmentMonths: number,// 分期月数
 *   monthlyInstallment: number,// 月供金额
 *   existingItems: string[],  // 已有的同类物品
 *   recommendation: {
 *     suggestion: string,     // 建议类型文字
 *     reasons: string[],       // 建议理由数组
 *     tags: string[],          // 消费画像标签
 *     budgetImpact: string,    // 预算影响描述
 *     inventoryImpact: string, // 库存影响描述
 *     referenceInfo: string,   // 参考信息
 *   },
 *   status: string,           // 状态：wishlist|buy|skip|purchased|given_up|annual_plan
 *   wishlistDate?: string,   // 加入 Wishlist 的日期（ISO格式）
 *   nextReminderDate?: string, // 下一次提醒日期（ISO格式）
 *   wishlistDays?: number,    // 已等待天数（自动计算）
 *   wishlistReminderCount?: number, // 已提醒次数
 *   lastReanalysisDate?: string, // 最后一次重新分析日期（ISO格式）
 *   createdAt: string,        // 创建时间（ISO格式）
 *   updatedAt: string,        // 更新时间（ISO格式）
 * }
 */

/**
 * 获取所有想买记录
 * @returns {Array} 想买记录数组
 */
export function getPurchaseDecisions() {
  return get(KEYS.PURCHASE_DECISIONS, []);
}

/**
 * 保存所有想买记录
 * @param {Array} decisions - 想买记录数组
 */
export function setPurchaseDecisions(decisions) {
  return set(KEYS.PURCHASE_DECISIONS, decisions);
}

/**
 * 根据 id 获取单条想买记录
 * @param {string} id - 记录 id
 * @returns {Object|null} 对应的想买记录，未找到返回 null
 */
export function getPurchaseDecisionById(id) {
  const list = getPurchaseDecisions();
  return list.find((item) => item.id === id) || null;
}

/**
 * 添加一条想买记录
 * @param {Object} decision - 想买记录对象（需包含必要字段）
 * @returns {Object} 带有 id 和时间戳的完整记录
 */
export function addPurchaseDecision(decision) {
  const list = getPurchaseDecisions();
  const now = new Date().toISOString();
  const newItem = {
    ...decision,
    id: decision.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: decision.createdAt || now,
    updatedAt: now,
  };
  list.unshift(newItem); // 新记录放到最前面
  if (!setPurchaseDecisions(list)) return null;
  return newItem;
}

/**
 * 更新一条想买记录
 * @param {string} id - 记录 id
 * @param {Object} updates - 要更新的字段
 * @returns {Object|null} 更新后的记录，未找到返回 null
 */
export function updatePurchaseDecision(id, updates) {
  const list = getPurchaseDecisions();
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return null;

  list[index] = {
    ...list[index],
    ...updates,
    id: list[index].id, // 保持 id 不被覆盖
    createdAt: list[index].createdAt, // 保持创建时间不被覆盖
    updatedAt: new Date().toISOString(),
  };
  if (!setPurchaseDecisions(list)) return null;
  return list[index];
}

/**
 * 删除一条想买记录
 * @param {string} id - 记录 id
 * @returns {boolean} 是否删除成功
 */
export function removePurchaseDecision(id) {
  const list = getPurchaseDecisions();
  const filtered = list.filter((item) => item.id !== id);
  if (filtered.length === list.length) return false;
  setPurchaseDecisions(filtered);
  return true;
}

/**
 * 根据状态筛选想买记录
 * @param {string} status - 要筛选的状态
 * @returns {Array} 符合条件的记录数组
 */
export function getPurchaseDecisionsByStatus(status) {
  const list = getPurchaseDecisions();
  if (!status || status === '全部') return list;
  return list.filter((item) => item.status === status);
}

// ==================== 已有物品 (ownedItems) ====================

/**
 * ownedItems 结构定义：
 * {
 *   id: string,               // 唯一标识
 *   name: string,             // 物品名称
 *   category: string,         // 分类
 *   purchaseDate: string,      // 购买日期（ISO格式或 YYYY-MM-DD）
 *   price: number,            // 价格
 *   expiryDate: string,       // 过期日期（ISO格式），可选
 *   status: string,           // 状态：frequent|occasional|idle|running_low|used_up|expiring|expired
 *   frequency: string,        // 使用频率
 *   satisfaction: string,     // 满意度
 *   notes: string,            // 备注
 *   targetUseYears?: number,  // 目标使用年限（年），适合电子产品、家具家电等
 *   estimatedResaleValue?: number, // 预计残值（元），适合电脑、手机、相机、包等
 *   isStillUsing?: boolean,   // 是否仍在使用
 *   createdAt: string,         // 创建时间（ISO格式）
 * }
 */

/**
 * 获取所有已有物品
 * @returns {Array} 已有物品数组
 */
export function getOwnedItems() {
  return get(KEYS.OWNED_ITEMS, []);
}

/**
 * 保存所有已有物品
 * @param {Array} items - 已有物品数组
 */
export function setOwnedItems(items) {
  return set(KEYS.OWNED_ITEMS, items);
}

/**
 * 根据 id 获取单条已有物品
 * @param {string} id - 物品 id
 * @returns {Object|null} 对应的物品，未找到返回 null
 */
export function getOwnedItemById(id) {
  const list = getOwnedItems();
  return list.find((item) => item.id === id) || null;
}

/**
 * 添加一条已有物品
 * @param {Object} item - 已有物品对象
 * @returns {Object} 带有 id 和时间戳的完整记录
 */
export function addOwnedItem(item) {
  const list = getOwnedItems();
  const now = new Date().toISOString();
  const newItem = {
    ...item,
    id: item.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: item.createdAt || now,
  };
  list.unshift(newItem);
  if (!setOwnedItems(list)) return null;
  return newItem;
}

/**
 * 更新一条已有物品
 * @param {string} id - 物品 id
 * @param {Object} updates - 要更新的字段
 * @returns {Object|null} 更新后的物品，未找到返回 null
 */
export function updateOwnedItem(id, updates) {
  const list = getOwnedItems();
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return null;

  list[index] = {
    ...list[index],
    ...updates,
    id: list[index].id,
    createdAt: list[index].createdAt,
  };
  if (!setOwnedItems(list)) return null;
  return list[index];
}

/**
 * 删除一条已有物品
 * @param {string} id - 物品 id
 * @returns {boolean} 是否删除成功
 */
export function removeOwnedItem(id) {
  const list = getOwnedItems();
  const filtered = list.filter((item) => item.id !== id);
  if (filtered.length === list.length) return false;
  if (!setOwnedItems(filtered)) return false;
  return true;
}

/**
 * 根据分类筛选已有物品
 * @param {string} category - 分类名称
 * @returns {Array} 符合条件的物品数组
 */
export function getOwnedItemsByCategory(category) {
  const list = getOwnedItems();
  if (!category) return list;
  return list.filter((item) => item.category === category);
}

/**
 * 根据名称关键词搜索已有物品（模糊匹配）
 * @param {string} keyword - 搜索关键词
 * @returns {Array} 匹配的物品数组
 */
export function searchOwnedItems(keyword) {
  const list = getOwnedItems();
  if (!keyword) return list;
  const lowerKeyword = keyword.toLowerCase();
  return list.filter((item) => item.name.toLowerCase().includes(lowerKeyword));
}

// ==================== 月度预算 (monthlyBudget) ====================

/**
 * monthlyBudget 结构定义：
 * {
 *   total: number,   // 月度总预算（元）
 *   used: number,    // 已使用（元）
 *   reserved: number,// 已预留（元）
 *   note: string,    // 备注
 * }
 */

/**
 * 获取月度预算
 * @returns {Object} 月度预算对象
 */
export function getMonthlyBudget() {
  return get(KEYS.MONTHLY_BUDGET, {
    total: 3000,
    used: 0,
    reserved: 0,
    note: '',
  });
}

/**
 * 设置月度预算
 * @param {Object} budget - 月度预算对象
 */
export function setMonthlyBudget(budget) {
  return set(KEYS.MONTHLY_BUDGET, budget);
}

/**
 * 获取月度剩余可用预算
 * @returns {number} 剩余预算金额
 */
export function getMonthlyRemaining() {
  const budget = getMonthlyBudget();
  return budget.total - budget.used - budget.reserved;
}

// ==================== 年度预算 (annualBudget) ====================

/**
 * annualBudget 结构定义：
 * {
 *   total: number,   // 年度总预算（元）
 *   used: number,    // 已使用（元）
 *   reserved: number,// 已预留（元）
 *   note: string,    // 备注
 * }
 */

/**
 * 获取年度预算
 * @returns {Object} 年度预算对象
 */
export function getAnnualBudget() {
  return get(KEYS.ANNUAL_BUDGET, {
    total: 30000,
    used: 0,
    reserved: 0,
    note: '',
  });
}

/**
 * 设置年度预算
 * @param {Object} budget - 年度预算对象
 */
export function setAnnualBudget(budget) {
  return set(KEYS.ANNUAL_BUDGET, budget);
}

/**
 * 获取年度剩余可用预算
 * @returns {number} 剩余预算金额
 */
export function getAnnualRemaining() {
  const budget = getAnnualBudget();
  return budget.total - budget.used - budget.reserved;
}

// ==================== 数据初始化和重置 ====================

/**
 * 初始化数据 - 如果 localStorage 中没有数据，则写入默认值
 * @param {Object} initialData - 初始数据对象
 */
export function initializeStore(initialData = {}) {
  // 仅在数据不存在时才初始化，避免覆盖用户已有数据
  if (get(KEYS.MONTHLY_BUDGET) === null && initialData.monthlyBudget) {
    setMonthlyBudget(initialData.monthlyBudget);
  }
  if (get(KEYS.ANNUAL_BUDGET) === null && initialData.annualBudget) {
    setAnnualBudget(initialData.annualBudget);
  }
  if (get(KEYS.OWNED_ITEMS) === null && initialData.ownedItems) {
    setOwnedItems(initialData.ownedItems);
  }
  if (get(KEYS.PURCHASE_DECISIONS) === null && initialData.purchaseDecisions) {
    setPurchaseDecisions(initialData.purchaseDecisions);
  }
}

/**
 * 清空所有存储数据（谨慎使用！）
 */
export function clearAllData() {
  remove(KEYS.PURCHASE_DECISIONS);
  remove(KEYS.OWNED_ITEMS);
  remove(KEYS.MONTHLY_BUDGET);
  remove(KEYS.ANNUAL_BUDGET);
}

/**
 * 导出所有数据（用于备份）
 * @returns {Object} 包含所有数据的对象
 */
export function exportAllData() {
  return {
    purchaseDecisions: getPurchaseDecisions(),
    ownedItems: getOwnedItems(),
    monthlyBudget: getMonthlyBudget(),
    annualBudget: getAnnualBudget(),
    exportedAt: new Date().toISOString(),
  };
}

/**
 * 导入数据（恢复备份）
 * @param {Object} data - 包含所有数据的对象
 * @param {boolean} overwrite - 是否覆盖已有数据，默认 false（合并）
 */
export function importData(data, overwrite = false) {
  if (overwrite) {
    // 覆盖模式：直接替换所有数据
    if (data.purchaseDecisions) setPurchaseDecisions(data.purchaseDecisions);
    if (data.ownedItems) setOwnedItems(data.ownedItems);
    if (data.monthlyBudget) setMonthlyBudget(data.monthlyBudget);
    if (data.annualBudget) setAnnualBudget(data.annualBudget);
  } else {
    // 合并模式：保留已有数据，追加新数据
    if (data.purchaseDecisions) {
      const existing = getPurchaseDecisions();
      const existingIds = new Set(existing.map((item) => item.id));
      const newItems = data.purchaseDecisions.filter(
        (item) => !existingIds.has(item.id)
      );
      setPurchaseDecisions([...newItems, ...existing]);
    }
    if (data.ownedItems) {
      const existing = getOwnedItems();
      const existingIds = new Set(existing.map((item) => item.id));
      const newItems = data.ownedItems.filter(
        (item) => !existingIds.has(item.id)
      );
      setOwnedItems([...newItems, ...existing]);
    }
    // 预算数据直接覆盖（因为通常只有一个）
    if (data.monthlyBudget) setMonthlyBudget(data.monthlyBudget);
    if (data.annualBudget) setAnnualBudget(data.annualBudget);
  }
}

// ==================== 便捷别名（供组件导入使用）====================

/**
 * savePurchaseDecision - 保存一条想买记录（等同于 addPurchaseDecision）
 * 用于新创建的购买建议保存到 localStorage
 */
export const savePurchaseDecision = addPurchaseDecision;

/**
 * saveOwnedItem - 保存已有物品（根据是否有 id 决定新增或更新）
 * @param {Object} item - 已有物品对象
 * @returns {Object} 完整的物品记录
 */
export function saveOwnedItem(item) {
  if (item.id) {
    return updateOwnedItem(item.id, item);
  }
  return addOwnedItem(item);
}

/**
 * deleteOwnedItem - 删除已有物品（等同于 removeOwnedItem）
 */
export const deleteOwnedItem = removeOwnedItem;

// 导出通用的 get/set/remove 供高级用法使用
export { get, set, remove };
