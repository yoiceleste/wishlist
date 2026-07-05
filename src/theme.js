/**
 * 心动清单 - 主题色配置
 * 温柔理性风格：柔和紫 + 奶油背景，保留清晰的消费决策语义色
 */

const THEME = {
  // 布局
  bg: '#F8F7FA',           // 页面背景 - 温柔灰紫
  card: '#FFFFFF',          // 卡片背景
  cardHover: '#FAFAFA',     // 卡片悬浮

  // 主色
  primary: '#7C6AF2',       // 柔和紫 - 按钮、选中态
  primaryDark: '#5E4FD8',   // 深紫 - 渐变终点
  primaryLight: '#F2EFFF',  // 极浅紫 - 标签背景/选中底色

  // 文字
  text: '#1D1D1F',          // 主文字 - Apple 近黑
  textSecondary: '#86868B', // 次要文字 - Apple 灰
  textTertiary: '#AEAEB2',  // 三级文字

  // 边框/分割
  border: '#E8E8ED',        // 边框
  divider: '#F2F2F7',       // 分割线/浅色区域背景

  // 语义色
  success: '#34C759',       // 正面/充足 - Apple 绿
  warning: '#FF9F0A',       // 警告/紧张 - Apple 橙
  danger: '#FF3B30',        // 危险/超支 - Apple 红

  // 标签色
  tagGreen: '#E8F8EA',
  tagGreenText: '#34C759',
  tagBlue: '#E8F2FF',
  tagBlueText: '#007AFF',
  tagOrange: '#FFF3E0',
  tagOrangeText: '#FF9F0A',
  tagPink: '#FFE8ED',
  tagPinkText: '#FF2D55',
  tagGray: '#F2F2F7',
  tagGrayText: '#86868B',
  tagPurple: '#F0E8FF',
  tagPurpleText: '#AF52DE',

  // 阴影
  shadowCard: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  shadowButton: '0 4px 14px rgba(124,106,242,0.22)',

  // 圆角
  radiusCard: 16,
  radiusButton: 14,
  radiusTag: 20,
  radiusInput: 8,
};

export default THEME;
