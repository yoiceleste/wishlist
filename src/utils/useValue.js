/**
 * 使用价值计算工具
 *
 * 基于时间的轻量使用价值分析，不记录使用次数，不计算单次使用成本。
 * 所有计算都基于购买日期和今天日期的时间差。
 */

/**
 * 计算已拥有天数
 * @param {string} purchaseDate - 购买日期（YYYY-MM-DD 或 ISO 格式）
 * @returns {number} 已拥有天数（至少为 1）
 */
export function calcOwnedDays(purchaseDate) {
  if (!purchaseDate) return 0;
  const purchase = new Date(purchaseDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  purchase.setHours(0, 0, 0, 0);
  const diff = today.getTime() - purchase.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 1;
}

/**
 * 计算日均成本
 * @param {number} price - 购买价格
 * @param {string} purchaseDate - 购买日期
 * @returns {number|null} 日均成本（元），无法计算返回 null
 */
export function calcDailyCost(price, purchaseDate) {
  const days = calcOwnedDays(purchaseDate);
  if (days === 0 || !price) return null;
  return price / days;
}

/**
 * 计算扣除残值后的真实日均成本
 * @param {number} price - 购买价格
 * @param {number} estimatedResaleValue - 预计残值
 * @param {string} purchaseDate - 购买日期
 * @returns {number|null} 真实日均成本，无法计算返回 null
 */
export function calcRealDailyCost(price, estimatedResaleValue, purchaseDate) {
  if (estimatedResaleValue == null) return null;
  const days = calcOwnedDays(purchaseDate);
  if (days === 0 || !price) return null;
  return (price - estimatedResaleValue) / days;
}

/**
 * 计算目标日均成本
 * @param {number} price - 购买价格
 * @param {number} targetUseYears - 目标使用年限（年）
 * @returns {number|null} 目标日均成本，无法计算返回 null
 */
export function calcTargetDailyCost(price, targetUseYears) {
  if (!targetUseYears || !price) return null;
  return price / (targetUseYears * 365);
}

/**
 * 使用价值标签类型
 */
export const USE_VALUE_TAGS = {
  VERY_WORTH: '已经很值',
  AMORTIZING: '正在摊薄成本',
  NEED_MORE_TIME: '还需要多用一段时间',
  IDLE_SUGGEST_USE: '已闲置，建议先用它',
  EXPIRED: '已过期 / 已停用',
};

/**
 * 生成使用价值标签
 * 根据日均成本和物品状态综合判断
 * @param {Object} item - 已有物品对象
 * @returns {string} 使用价值标签
 */
export function getUseValueTag(item) {
  const { price, purchaseDate, status, isStillUsing } = item;

  // 已过期或已停用
  if (status === 'expired' || status === 'used_up') {
    return USE_VALUE_TAGS.EXPIRED;
  }

  // 闲置状态
  if (status === 'idle') {
    return USE_VALUE_TAGS.IDLE_SUGGEST_USE;
  }

  // 没有购买日期或价格，无法计算
  if (!purchaseDate || !price) {
    return USE_VALUE_TAGS.NEED_MORE_TIME;
  }

  const dailyCost = calcDailyCost(price, purchaseDate);
  if (dailyCost === null) return USE_VALUE_TAGS.NEED_MORE_TIME;

  // 如果有目标使用年限，用目标日均成本做参照
  const targetDailyCost = calcTargetDailyCost(price, item.targetUseYears);

  // 日均成本低于 5 元认为已经很值
  if (dailyCost <= 5) {
    return USE_VALUE_TAGS.VERY_WORTH;
  }

  // 日均成本低于 20 元认为正在摊薄
  if (dailyCost <= 20) {
    return USE_VALUE_TAGS.AMORTIZING;
  }

  // 有目标年限但日均成本还远高于目标
  if (targetDailyCost && dailyCost > targetDailyCost * 3) {
    return USE_VALUE_TAGS.NEED_MORE_TIME;
  }

  return USE_VALUE_TAGS.AMORTIZING;
}

/**
 * 生成使用价值描述文案
 * @param {Object} item - 已有物品对象
 * @returns {string[]} 描述文案数组
 */
export function getUseValueDescriptions(item) {
  const { price, purchaseDate } = item;
  const descriptions = [];

  if (!purchaseDate || !price) {
    descriptions.push('填写购买日期和价格后，可以查看使用价值分析。');
    return descriptions;
  }

  const days = calcOwnedDays(purchaseDate);
  const dailyCost = calcDailyCost(price, purchaseDate);

  // 主文案
  descriptions.push(
    `这件东西已经陪你 ${days} 天了，平均每天约 ${dailyCost.toFixed(2)} 元。`
  );

  // 残值文案
  if (item.estimatedResaleValue != null && item.estimatedResaleValue > 0) {
    const realDailyCost = calcRealDailyCost(price, item.estimatedResaleValue, purchaseDate);
    if (realDailyCost !== null) {
      descriptions.push(
        `扣除预计残值后，真实日均成本约 ${realDailyCost.toFixed(2)} 元/天。`
      );
    }
  }

  // 目标使用年限文案
  if (item.targetUseYears && item.targetUseYears > 0) {
    const targetDailyCost = calcTargetDailyCost(price, item.targetUseYears);
    if (targetDailyCost !== null) {
      descriptions.push(
        `如果目标用满 ${item.targetUseYears} 年，理想日均成本约 ${targetDailyCost.toFixed(2)} 元/天。`
      );
    }
  }

  return descriptions;
}

/**
 * 生成购买建议中的库存使用价值判断
 * 根据同类库存的使用价值情况给出建议文案
 * @param {Object[]} ownedItems - 同类已有物品数组
 * @returns {string|null} 使用价值相关的建议文案，不需要时返回 null
 */
export function getInventoryUseValueAdvice(ownedItems) {
  if (!ownedItems || ownedItems.length === 0) return null;

  const results = [];

  for (const item of ownedItems) {
    const { price, purchaseDate, status, isStillUsing } = item;

    // 已过期/已停用
    if (status === 'expired' || status === 'used_up') {
      results.push({
        type: 'expired',
        text: '已有物品已过期/停用，对这次购买的阻碍较小。',
      });
      continue;
    }

    // 闲置
    if (status === 'idle') {
      results.push({
        type: 'idle',
        text: '已有同类物品处于闲置状态，建议先确认这次不是重复购买。',
      });
      continue;
    }

    // 有购买日期和价格，计算日均成本
    if (purchaseDate && price) {
      const days = calcOwnedDays(purchaseDate);
      const dailyCost = calcDailyCost(price, purchaseDate);

      // 购买不久（少于 90 天），日均成本仍高
      if (days < 90 && isStillUsing !== false) {
        results.push({
          type: 'new_purchase',
          text: `已有同类物品购买仅 ${days} 天，日均成本仍偏高，建议先继续使用一段时间。`,
        });
        continue;
      }

      // 购买较久，日均成本已经很低
      if (dailyCost <= 10 && isStillUsing !== false) {
        results.push({
          type: 'worth_it',
          text: '已有同类物品已经基本用回本，新购买不一定是浪费，但需要看它是否解决新需求。',
        });
        continue;
      }
    }
  }

  // 优先返回最有价值的建议
  // 闲置 > 新购买 > 已用回本 > 已过期
  const priority = ['idle', 'new_purchase', 'worth_it', 'expired'];
  for (const p of priority) {
    const found = results.find((r) => r.type === p);
    if (found) return found.text;
  }

  return results.length > 0 ? results[0].text : null;
}
