/**
 * 购买建议生成逻辑
 *
 * 核心理念：不使用单一分数，而是通过多维标签 + 自然语言生成个性化建议
 * 每个消费决策都会被分析出 8 个维度的标签，然后综合判断给出建议
 */

import { getMonthlyBudget, getAnnualBudget, getOwnedItems } from '../data/store.js';
import { getInventoryUseValueAdvice } from './useValue';

// ==================== 消费画像维度定义 ====================

/**
 * 刚需度等级
 * 判断：物品是否为生活必需或高频使用的刚需品
 */
const NEED_LEVELS = {
  HIGH: '刚需度：高',
  MEDIUM: '刚需度：中',
  LOW: '刚需度：低',
};

/**
 * 替代性等级
 * 判断：是否已有物品可以替代该购买需求
 */
const ALTERNATIVE_LEVELS = {
  NONE: '替代性：不可替代',
  PARTIAL: '替代性：部分可替代',
  FULL: '替代性：可替代',
};

/**
 * 预算压力等级
 * 判断：购买该物品对当前预算造成的压力
 */
const BUDGET_PRESSURE_LEVELS = {
  HIGH: '预算压力：高',
  MEDIUM: '预算压力：中',
  LOW: '预算压力：低',
};

/**
 * 使用确定性等级
 * 判断：购买后真正使用的可能性
 */
const CERTAINTY_LEVELS = {
  HIGH: '使用确定性：高',
  MEDIUM: '使用确定性：中',
  LOW: '使用确定性：低',
};

/**
 * 库存重复风险等级
 * 判断：与已有物品的重复程度
 */
const INVENTORY_RISK_LEVELS = {
  HIGH: '库存重复风险：高',
  MEDIUM: '库存重复风险：中',
  LOW: '库存重复风险：低',
};

/**
 * 情绪价值/稀缺性等级
 * 判断：物品带来的情绪满足感和稀缺程度
 */
const EMOTIONAL_VALUE_LEVELS = {
  HIGH: '情绪价值/稀缺性：高',
  MEDIUM: '情绪价值/稀缺性：中',
  LOW: '情绪价值/稀缺性：低',
};

/**
 * 预算归属合理性
 * 判断：该消费更适合从月度预算还是年度预算支出
 */
const BUDGET_FIT = {
  MONTHLY: '月度预算更合理',
  ANNUAL: '年度预算更合理',
  BOTH: '两者都会影响',
};

/**
 * 购买时机
 * 判断：当前是否适合购买
 */
const TIMING = {
  NOW: '适合现在买',
  WAIT_SALE: '适合等优惠',
  ANNUAL_PLAN: '适合放入年度计划',
  DELAY: '适合暂缓',
};

// ==================== 建议类型常量 ====================

export const SUGGESTION_TYPES = {
  BUY_NOW: '现在可以买',
  BUY_WAIT_SALE: '可以买但建议等优惠',
  COOL_DOWN: '加入冷静期',
  DELAY_30: '暂缓30天',
  NOT_NOW: '不建议现在买',
  USE_EXISTING: '先用已有',
  ANNUAL_PLAN: '放入年度计划',
};

// ==================== 标签分析函数 ====================

/**
 * 分析刚需度
 * 根据分类、使用频率、购买目的判断刚需程度
 */
function analyzeNeedLevel(decision) {
  const { category, frequency, purpose } = decision;

  // 健康刚需、工作工具类默认高刚需
  const highNeedCategories = ['健康刚需', '工作工具'];
  if (highNeedCategories.includes(category)) return NEED_LEVELS.HIGH;

  // 高频使用 = 高刚需
  const highFrequency = ['几乎每天', '每周几次'];
  if (highFrequency.includes(frequency)) return NEED_LEVELS.HIGH;

  // 有明确且紧迫的目的
  if (purpose && (purpose.includes('必须') || purpose.includes('急需') || purpose.includes('换'))) {
    return NEED_LEVELS.HIGH;
  }

  // 中等频率或中等目的
  const mediumFrequency = ['每月几次'];
  if (mediumFrequency.includes(frequency)) return NEED_LEVELS.MEDIUM;

  // 低频使用 = 低刚需
  const lowFrequency = ['偶尔', '可能只用一次', '不确定'];
  if (lowFrequency.includes(frequency)) return NEED_LEVELS.LOW;

  return NEED_LEVELS.MEDIUM;
}

/**
 * 分析替代性
 * 根据已有物品和替代方案描述判断
 */
function analyzeAlternatives(decision) {
  const { existingItems, alternatives } = decision;

  // 没有已有同类物品且没有替代方案
  if ((!existingItems || existingItems.length === 0) && (!alternatives || alternatives === '')) {
    return ALTERNATIVE_LEVELS.NONE;
  }

  // 有已有同类物品
  if (existingItems && existingItems.length > 0) {
    // 多个已有同类物品说明替代性很高
    if (existingItems.length >= 2) {
      return ALTERNATIVE_LEVELS.FULL;
    }
    // 一个同类物品，看替代方案描述
    if (alternatives && alternatives.includes('已有')) {
      return ALTERNATIVE_LEVELS.FULL;
    }
    return ALTERNATIVE_LEVELS.PARTIAL;
  }

  // 没有已有物品但有替代方案
  if (alternatives && alternatives.length > 0) {
    return ALTERNATIVE_LEVELS.PARTIAL;
  }

  return ALTERNATIVE_LEVELS.NONE;
}

/**
 * 分析预算压力
 * 根据价格和剩余预算计算压力
 */
function analyzeBudgetPressure(decision) {
  const { price, budgetType } = decision;
  const monthlyBudget = getMonthlyBudget();
  const annualBudget = getAnnualBudget();

  const monthlyRemaining = monthlyBudget.total - monthlyBudget.used - monthlyBudget.reserved;
  const annualRemaining = annualBudget.total - annualBudget.used - annualBudget.reserved;

  // 根据预算类型判断
  if (budgetType === '占用月度预算') {
    const ratio = price / monthlyRemaining;
    if (ratio > 0.5) return BUDGET_PRESSURE_LEVELS.HIGH;
    if (ratio > 0.2) return BUDGET_PRESSURE_LEVELS.MEDIUM;
    return BUDGET_PRESSURE_LEVELS.LOW;
  }

  if (budgetType === '占用年度预算') {
    const ratio = price / annualRemaining;
    if (ratio > 0.5) return BUDGET_PRESSURE_LEVELS.HIGH;
    if (ratio > 0.2) return BUDGET_PRESSURE_LEVELS.MEDIUM;
    return BUDGET_PRESSURE_LEVELS.LOW;
  }

  // 同时影响月度和年度
  const monthlyRatio = price / monthlyRemaining;
  const annualRatio = price / annualRemaining;
  if (monthlyRatio > 0.3 || annualRatio > 0.3) return BUDGET_PRESSURE_LEVELS.HIGH;
  if (monthlyRatio > 0.1 || annualRatio > 0.1) return BUDGET_PRESSURE_LEVELS.MEDIUM;
  return BUDGET_PRESSURE_LEVELS.LOW;
}

/**
 * 分析使用确定性
 * 根据使用频率和场景数量判断
 */
function analyzeCertainty(decision) {
  const { frequency, usageScenes } = decision;

  // 高频 + 多场景 = 高确定性
  const highFrequency = ['几乎每天', '每周几次'];
  if (highFrequency.includes(frequency) && usageScenes && usageScenes.length >= 2) {
    return CERTAINTY_LEVELS.HIGH;
  }

  // 高频 = 高确定性
  if (highFrequency.includes(frequency)) return CERTAINTY_LEVELS.HIGH;

  // 中频 + 明确场景 = 中确定性
  const mediumFrequency = ['每月几次'];
  if (mediumFrequency.includes(frequency) && usageScenes && usageScenes.length >= 1) {
    return CERTAINTY_LEVELS.MEDIUM;
  }

  // 低频 = 低确定性
  const lowFrequency = ['偶尔', '可能只用一次', '不确定', '几乎不用'];
  if (lowFrequency.includes(frequency)) return CERTAINTY_LEVELS.LOW;

  return CERTAINTY_LEVELS.MEDIUM;
}

/**
 * 分析库存重复风险
 * 根据已有同类物品数量和使用状态判断
 */
function analyzeInventoryRisk(decision) {
  const { existingItems, category } = decision;

  // 没有已有同类物品，风险低
  if (!existingItems || existingItems.length === 0) {
    return INVENTORY_RISK_LEVELS.LOW;
  }

  // 查找已有物品的实际使用状态
  const allItems = getOwnedItems();
  const sameCategoryItems = allItems.filter((item) => item.category === category);

  // 同类物品中有闲置或快用完的情况
  const idleItems = sameCategoryItems.filter(
    (item) => item.status === 'idle' || item.status === 'used_up' || item.status === 'expired'
  );

  if (sameCategoryItems.length >= 3) {
    return INVENTORY_RISK_LEVELS.HIGH;
  }
  if (sameCategoryItems.length >= 2 || idleItems.length > 0) {
    return INVENTORY_RISK_LEVELS.MEDIUM;
  }
  if (existingItems.length === 1) {
    return INVENTORY_RISK_LEVELS.MEDIUM;
  }

  return INVENTORY_RISK_LEVELS.LOW;
}

/**
 * 分析情绪价值/稀缺性
 * 根据分类和使用场景判断情绪价值
 */
function analyzeEmotionalValue(decision) {
  const { category, usageScenes, purpose } = decision;

  // 演出追星、医美类情绪价值高
  const highEmotionCategories = ['演出/追星', '医美', '旅行'];
  if (highEmotionCategories.includes(category)) return EMOTIONAL_VALUE_LEVELS.HIGH;

  // 有限时属性的情绪价值高
  if (purpose && (purpose.includes('一定要') || purpose.includes('错过就没有') || purpose.includes('限量'))) {
    return EMOTIONAL_VALUE_LEVELS.HIGH;
  }

  // 拍照、约会场景情绪价值中
  const highEmotionScenes = ['拍照', '演唱会', '约会', '追星'];
  if (usageScenes && usageScenes.some((s) => highEmotionScenes.includes(s))) {
    return EMOTIONAL_VALUE_LEVELS.MEDIUM;
  }

  // 学习/考试、工作工具类情绪价值低
  const lowEmotionCategories = ['学习/考试', '工作工具', '日常生活', '健康刚需'];
  if (lowEmotionCategories.includes(category)) return EMOTIONAL_VALUE_LEVELS.LOW;

  return EMOTIONAL_VALUE_LEVELS.MEDIUM;
}

/**
 * 分析预算归属合理性
 * 根据价格和消费类型判断适合月度还是年度预算
 */
function analyzeBudgetFit(decision) {
  const { price, budgetType, category } = decision;

  // 如果用户已经选择了预算类型，就尊重用户选择（微调）
  if (budgetType === '同时影响月度和年度预算') return BUDGET_FIT.BOTH;

  // 大额消费（>=3000）更适合年度预算
  if (price >= 3000) return BUDGET_FIT.ANNUAL;

  // 旅行、医美、电子产品类通常更适合年度预算
  const annualCategories = ['旅行', '医美', '电子产品', '家具家电', '学习/考试'];
  if (annualCategories.includes(category) && price >= 1000) return BUDGET_FIT.ANNUAL;

  // 日常消费适合月度预算
  const monthlyCategories = ['美妆', '护肤', '衣服', '鞋包', '日常生活', '健康刚需'];
  if (monthlyCategories.includes(category) && price < 1000) return BUDGET_FIT.MONTHLY;

  return BUDGET_FIT.MONTHLY;
}

/**
 * 分析购买时机
 * 综合各维度标签判断当前是否适合购买
 */
function analyzeTiming(tags, decision) {
  const { price } = decision;

  // 如果有多个负面标签，建议暂缓
  const negativeCount = [
    tags.needLevel === NEED_LEVELS.LOW,
    tags.alternatives === ALTERNATIVE_LEVELS.FULL,
    tags.budgetPressure === BUDGET_PRESSURE_LEVELS.HIGH,
    tags.certainty === CERTAINTY_LEVELS.LOW,
    tags.inventoryRisk === INVENTORY_RISK_LEVELS.HIGH,
  ].filter(Boolean).length;

  // 如果有多个正面标签，适合现在买
  const positiveCount = [
    tags.needLevel === NEED_LEVELS.HIGH,
    tags.alternatives === ALTERNATIVE_LEVELS.NONE,
    tags.budgetPressure === BUDGET_PRESSURE_LEVELS.LOW,
    tags.certainty === CERTAINTY_LEVELS.HIGH,
    tags.inventoryRisk === INVENTORY_RISK_LEVELS.LOW,
    tags.emotionalValue === EMOTIONAL_VALUE_LEVELS.HIGH,
  ].filter(Boolean).length;

  if (negativeCount >= 3) return TIMING.DELAY;
  if (positiveCount >= 4) return TIMING.NOW;
  if (tags.budgetPressure === BUDGET_PRESSURE_LEVELS.HIGH && price >= 2000) return TIMING.ANNUAL_PLAN;
  if (tags.budgetPressure === BUDGET_PRESSURE_LEVELS.LOW && positiveCount >= 2) return TIMING.NOW;

  return TIMING.WAIT_SALE;
}

// ==================== 建议生成逻辑 ====================

/**
 * 根据标签组合生成最终建议类型
 * 使用自然语言而非分数来描述建议
 */
function generateSuggestionType(tags, timing, decision) {
  // 1. 不建议现在买：库存重复风险高 + 使用确定性低 + 有替代品
  if (
    tags.inventoryRisk === INVENTORY_RISK_LEVELS.HIGH &&
    tags.certainty === CERTAINTY_LEVELS.LOW &&
    tags.alternatives !== ALTERNATIVE_LEVELS.NONE
  ) {
    return SUGGESTION_TYPES.NOT_NOW;
  }

  // 2. 先用已有：完全可替代 + 刚需度低
  if (
    tags.alternatives === ALTERNATIVE_LEVELS.FULL &&
    tags.needLevel === NEED_LEVELS.LOW
  ) {
    return SUGGESTION_TYPES.USE_EXISTING;
  }

  // 3. 放入年度计划：购买时机为年度计划，或大额 + 高预算压力
  if (timing === TIMING.ANNUAL_PLAN || tags.budgetFit === BUDGET_FIT.BOTH) {
    return SUGGESTION_TYPES.ANNUAL_PLAN;
  }

  // 4. 暂缓30天：购买时机为暂缓
  if (timing === TIMING.DELAY) {
    return SUGGESTION_TYPES.DELAY_30;
  }

  // 5. 现在可以买：购买时机为现在买
  if (timing === TIMING.NOW) {
    return SUGGESTION_TYPES.BUY_NOW;
  }

  // 6. 可以买但建议等优惠：购买时机为等优惠
  if (timing === TIMING.WAIT_SALE) {
    return SUGGESTION_TYPES.BUY_WAIT_SALE;
  }

  // 7. 默认加入冷静期
  return SUGGESTION_TYPES.COOL_DOWN;
}

/**
 * 根据标签和决策信息生成自然语言理由
 * 返回 3-5 条理由
 */
function generateReasons(tags, decision) {
  const reasons = [];
  const { price, category, existingItems, frequency, alternatives, purpose } = decision;
  const monthlyBudget = getMonthlyBudget();
  const annualBudget = getAnnualBudget();
  const monthlyRemaining = monthlyBudget.total - monthlyBudget.used - monthlyBudget.reserved;
  const annualRemaining = annualBudget.total - annualBudget.used - annualBudget.reserved;

  // --- 刚需相关理由 ---
  if (tags.needLevel === NEED_LEVELS.HIGH) {
    reasons.push(`${category}属于高频使用品类，日常需求明确`);
  } else if (tags.needLevel === NEED_LEVELS.LOW) {
    reasons.push(`预期使用频率为"${frequency}"，实际使用场景可能有限`);
  }

  // --- 替代性相关理由 ---
  if (tags.alternatives === ALTERNATIVE_LEVELS.NONE) {
    reasons.push('没有找到合适的替代方案，该品类目前处于空白状态');
  } else if (tags.alternatives === ALTERNATIVE_LEVELS.PARTIAL && alternatives) {
    reasons.push(`存在替代方案：${alternatives.slice(0, 30)}...，可以综合考虑`);
  } else if (tags.alternatives === ALTERNATIVE_LEVELS.FULL) {
    reasons.push(`已有同类物品：${existingItems.join('、')}，功能重叠明显`);
  }

  // --- 预算相关理由 ---
  if (tags.budgetPressure === BUDGET_PRESSURE_LEVELS.LOW) {
    const budget = decision.budgetType === '占用月度预算' ? monthlyRemaining : annualRemaining;
    const budgetLabel = decision.budgetType === '占用月度预算' ? '月度' : '年度';
    reasons.push(`${budgetLabel}预算剩余 ${budget.toFixed(0)} 元，完全覆盖 ${price} 元的支出`);
  } else if (tags.budgetPressure === BUDGET_PRESSURE_LEVELS.HIGH) {
    const budget = decision.budgetType === '占用月度预算' ? monthlyRemaining : annualRemaining;
    const budgetLabel = decision.budgetType === '占用月度预算' ? '月度' : '年度';
    reasons.push(`${budgetLabel}预算剩余仅 ${budget.toFixed(0)} 元，${price} 元的支出会造成较大压力`);
  } else {
    reasons.push(`预算尚可覆盖，但建议预留空间给其他可能的消费`);
  }

  // --- 使用确定性相关理由 ---
  if (tags.certainty === CERTAINTY_LEVELS.HIGH) {
    reasons.push('有明确的使用场景和频率预期，购买后大概率会用上');
  } else if (tags.certainty === CERTAINTY_LEVELS.LOW) {
    reasons.push('使用频率较低，购买后闲置的风险需要考虑');
  }

  // --- 库存重复相关理由 ---
  if (tags.inventoryRisk === INVENTORY_RISK_LEVELS.HIGH) {
    reasons.push(`已有 ${existingItems.length} 件同类物品，新增可能导致重复和浪费`);
  }

  // --- 情绪价值相关理由 ---
  if (tags.emotionalValue === EMOTIONAL_VALUE_LEVELS.HIGH) {
    reasons.push('属于体验型/情绪型消费，带来的快乐和回忆是值得的');
  }

  // --- 分期相关理由 ---
  if (decision.installment && decision.installmentMonths > 0) {
    reasons.push(
      `分期 ${decision.installmentMonths} 个月，月供 ${decision.monthlyInstallment} 元，月度压力可控`
    );
  }

  // 确保返回 3-5 条理由
  return reasons.slice(0, 5);
}

/**
 * 生成预算影响文字描述
 */
function generateBudgetImpact(decision) {
  const { price, budgetType, installment, installmentMonths, monthlyInstallment } = decision;
  const monthlyBudget = getMonthlyBudget();
  const annualBudget = getAnnualBudget();
  const monthlyRemaining = monthlyBudget.total - monthlyBudget.used - monthlyBudget.reserved;
  const annualRemaining = annualBudget.total - annualBudget.used - annualBudget.reserved;

  let text = '';

  if (budgetType === '占用月度预算') {
    const ratio = ((price / monthlyRemaining) * 100).toFixed(1);
    text = `占月度剩余预算的 ${ratio}%`;
    if (parseFloat(ratio) > 30) {
      text += '，对月度预算影响较大，建议评估是否可以从其他支出中调整';
    } else if (parseFloat(ratio) > 10) {
      text += '，对月度预算有一定影响';
    } else {
      text += '，对月度预算影响很小';
    }
  } else if (budgetType === '占用年度预算') {
    const ratio = ((price / annualRemaining) * 100).toFixed(1);
    text = `占年度剩余预算的 ${ratio}%`;
    if (parseFloat(ratio) > 30) {
      text += '，年度预算空间会比较紧张';
    } else if (parseFloat(ratio) > 10) {
      text += '，年度预算可以覆盖';
    } else {
      text += '，对年度预算影响很小';
    }
  } else {
    // 同时影响月度和年度
    const monthlyRatio = ((price / monthlyRemaining) * 100).toFixed(1);
    const annualRatio = ((price / annualRemaining) * 100).toFixed(1);
    text = `月度影响 ${monthlyRatio}%，年度影响 ${annualRatio}%`;
    if (installment && installmentMonths > 0) {
      text += `，分期 ${installmentMonths} 个月月供 ${monthlyInstallment} 元`;
    }
    if (parseFloat(monthlyRatio) > 20 || parseFloat(annualRatio) > 20) {
      text += '，需要仔细规划预算';
    }
  }

  return text;
}

/**
 * 生成库存影响文字描述
 */
function generateInventoryImpact(decision) {
  const { existingItems, category, name } = decision;

  if (!existingItems || existingItems.length === 0) {
    return `${category}品类目前没有同类物品，新增属于补充品类空白`;
  }

  // 查看已有同类物品的使用状态
  const allItems = getOwnedItems();
  const existingItemsDetail = allItems.filter((item) =>
    existingItems.includes(item.name)
  );

  const activeItems = existingItemsDetail.filter(
    (item) => item.status === 'frequent' || item.status === 'occasional'
  );
  const idleItems = existingItemsDetail.filter(
    (item) => item.status === 'idle' || item.status === 'used_up' || item.status === 'expired'
  );

  let text = `已有 ${existingItems.length} 件同类物品：${existingItems.join('、')}`;

  if (activeItems.length > 0) {
    text += `，其中 ${activeItems.length} 件正在使用中`;
  }
  if (idleItems.length > 0) {
    text += `，${idleItems.length} 件已闲置/用完/过期，建议先消耗存量再考虑新增`;
  }

  if (activeItems.length >= 2) {
    text += '，新增后可能造成使用冲突，建议评估现有物品是否足够';
  }

  // 基于使用价值的建议判断
  const useValueAdvice = getInventoryUseValueAdvice(existingItemsDetail);
  if (useValueAdvice) {
    text += '\n' + useValueAdvice;
  }

  return text;
}

/**
 * 生成参考信息文字描述
 * 根据分类和当前时间给出购买建议参考
 */
function generateReferenceInfo(decision) {
  const { category, price } = decision;
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const references = [];

  // 根据当前月份推荐购买时机
  if (month === 6) {
    references.push('当前正值 618 大促期间，建议关注各平台优惠活动');
  } else if (month === 11) {
    references.push('当前正值双11大促期间，建议比价后下单');
  } else if (month >= 7 && month <= 8) {
    references.push('暑期可能有品牌清仓或季末促销，值得关注');
  } else if (month === 12 || month === 1) {
    references.push('年底/年初促销活动多，建议先加入心愿单等优惠');
  }

  // 根据分类给参考信息
  const categoryTips = {
    '美妆': '建议关注品牌官方直播间和丝芙兰会员日，通常有赠品或折扣',
    '护肤': '可以先到专柜领取小样试用，确认适合肤质后再买正装',
    '衣服': '建议等换季促销时购买，价格能低 30-50%',
    '鞋包': '如果不是刚需，建议等大型促销活动再入手',
    '电子产品': '建议关注教育优惠（7-8月）或618/双11，通常有较大折扣',
    '演出/追星': '通过官方渠道购票，注意开票时间提前准备',
    '旅行': '错峰出行性价比更高，建议避开节假日高峰',
    '医美': '建议选择正规机构，可以先做面诊咨询再决定项目',
    '健康刚需': '健康类消费建议尽快安排，不宜过度等待优惠',
    '工作工具': '如果公司有报销政策，优先走报销流程',
    '学习/考试': '投资自己是高回报行为，但建议确认学习计划后再投入',
  };

  if (categoryTips[category]) {
    references.push(categoryTips[category]);
  }

  // 价格区间参考
  if (price >= 2000) {
    references.push(`大额消费建议使用比价工具对比多个平台价格，价差可能达到 ${Math.round(price * 0.1)} 元以上`);
  }

  return references.join('；');
}

// ==================== 90 天复盘重新分析逻辑 ====================

/**
 * 生成重新分析的建议类型
 * 复盘后的建议更倾向于认可长期需求
 */
function generateReanalysisSuggestion(tags, timing, decision) {
  const { budgetPressure, inventoryRisk, needLevel, certainty } = tags;

  // 如果预算压力低、刚需高或确定性高 → 可以购买
  if (
    (budgetPressure === BUDGET_PRESSURE_LEVELS.LOW || budgetPressure === BUDGET_PRESSURE_LEVELS.MEDIUM) &&
    (needLevel === NEED_LEVELS.HIGH || certainty === CERTAINTY_LEVELS.HIGH)
  ) {
    return '可以购买';
  }

  // 如果库存重复风险高 → 建议继续观察
  if (inventoryRisk === INVENTORY_RISK_LEVELS.HIGH) {
    return '建议继续观察';
  }

  // 如果预算压力高 → 放入年度计划
  if (budgetPressure === BUDGET_PRESSURE_LEVELS.HIGH) {
    return '放入年度计划';
  }

  // 如果刚需低或确定性低 → 不建议购买
  if (needLevel === NEED_LEVELS.LOW && certainty === CERTAINTY_LEVELS.LOW) {
    return '不建议购买';
  }

  // 默认：可以购买（因为已经观察 90 天仍然想买）
  return '可以购买';
}

/**
 * 生成长期需求分析理由
 * 这些理由会放在理由列表最前面
 */
function generateLongTermReasons(decision, tags) {
  const reasons = [];
  const wishlistDate = decision.wishlistDate ? new Date(decision.wishlistDate) : null;
  const today = new Date();
  const daysWaited = wishlistDate
    ? Math.floor((today - wishlistDate) / (1000 * 60 * 60 * 24))
    : 90;

  if (daysWaited >= 90) {
    reasons.push(
      `这件商品已经在 Wishlist 中保留了 ${daysWaited} 天，说明它并不是短暂冲动消费，而是持续存在的需求。`
    );
  }

  // 根据库存情况
  if (tags.inventoryRisk === INVENTORY_RISK_LEVELS.HIGH) {
    reasons.push('但目前已有库存仍能满足需求，建议继续观察。');
  } else if (tags.inventoryRisk === INVENTORY_RISK_LEVELS.LOW) {
    reasons.push('且目前没有明显的库存冲突，购买障碍较小。');
  }

  // 根据预算压力
  if (tags.budgetPressure === BUDGET_PRESSURE_LEVELS.LOW) {
    reasons.push('经过一段时间的观察，且当前预算压力较小，可以优先考虑购买。');
  } else if (tags.budgetPressure === BUDGET_PRESSURE_LEVELS.HIGH) {
    reasons.push('不过当前预算压力较大，建议规划好预算后再购买。');
  }

  return reasons;
}

// ==================== 主函数 ====================

/**
 * 生成购买建议（核心函数）
 * @param {Object} decision - 想买记录对象
 * @returns {Object} 包含 suggestion, reasons, tags, budgetImpact, inventoryImpact, referenceInfo 的建议对象
 */
export function generateRecommendation(decision, isReanalysis = false) {
  // 1. 分析各个维度的标签
  const needLevel = analyzeNeedLevel(decision);
  const alternatives = analyzeAlternatives(decision);
  const budgetPressure = analyzeBudgetPressure(decision);
  const certainty = analyzeCertainty(decision);
  const inventoryRisk = analyzeInventoryRisk(decision);
  const emotionalValue = analyzeEmotionalValue(decision);
  const budgetFit = analyzeBudgetFit(decision);

  const tags = {
    needLevel,
    alternatives,
    budgetPressure,
    certainty,
    inventoryRisk,
    emotionalValue,
    budgetFit,
  };

  // 2. 分析购买时机
  const timing = analyzeTiming(tags, decision);
  tags.timing = timing;

  // 3. 生成建议类型（如果是重新分析，加入长期需求判断）
  let suggestion;
  if (isReanalysis) {
    suggestion = generateReanalysisSuggestion(tags, timing, decision);
  } else {
    suggestion = generateSuggestionType(tags, timing, decision);
  }

  // 4. 生成理由
  const reasons = generateReasons(tags, decision);

  // 如果是重新分析，在理由前加入长期需求分析
  if (isReanalysis) {
    const longTermReasons = generateLongTermReasons(decision, tags);
    reasons.unshift(...longTermReasons);
  }

  // 5. 生成预算影响描述
  const budgetImpact = generateBudgetImpact(decision);

  // 6. 生成库存影响描述
  const inventoryImpact = generateInventoryImpact(decision);

  // 7. 生成参考信息
  const referenceInfo = generateReferenceInfo(decision);

  // 如果是重新分析，建议类型映射为新的建议
  if (isReanalysis) {
    return {
      suggestion,
      reasons,
      tags: [
        tags.needLevel,
        tags.alternatives,
        tags.budgetPressure,
        tags.certainty,
        tags.inventoryRisk,
        tags.emotionalValue,
        tags.budgetFit,
        tags.timing,
      ],
      budgetImpact,
      inventoryImpact,
      referenceInfo,
    };
  }

  return {
    suggestion,
    reasons,
    tags: [
      tags.needLevel,
      tags.alternatives,
      tags.budgetPressure,
      tags.certainty,
      tags.inventoryRisk,
      tags.emotionalValue,
      tags.budgetFit,
      tags.timing,
    ],
    budgetImpact,
    inventoryImpact,
    referenceInfo,
  };
}

/**
 * 批量生成建议（用于重新计算所有记录的建议）
 * @param {Array} decisions - 想买记录数组
 * @returns {Array} 带有更新后 recommendation 的记录数组
 */
export function batchGenerateRecommendations(decisions) {
  return decisions.map((decision) => ({
    ...decision,
    recommendation: generateRecommendation(decision),
  }));
}
