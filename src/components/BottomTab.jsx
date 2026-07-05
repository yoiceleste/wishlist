import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import COLORS from '../theme';

// Tab 配置
const TABS = [
  { path: '/', icon: '\uD83C\uDFE0', label: '首页' },
  { path: '/wishlist', icon: '\uD83D\uDC9D', label: '想买' },
  { path: '/inventory', icon: '\uD83D\uDCE6', label: '库存' },
  { path: '/budget', icon: '\uD83D\uDCB0', label: '预算' },
];

// 不显示底部 Tab 的路径前缀
const HIDDEN_TAB_PREFIXES = [
  '/new/',       // 记录想买流程
  '/new/result', // 购买建议页（已在 /new/ 下）
  '/inventory/edit',
  '/inventory/add',
];

/**
 * 判断当前路径是否应该隐藏底部 Tab
 * @param {string} pathname - 当前路径
 * @returns {boolean}
 */
function shouldHideTab(pathname) {
  return HIDDEN_TAB_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

// ==================== 底部导航栏组件 ====================
export default function BottomTab() {
  const location = useLocation();
  const navigate = useNavigate();

  // 如果在需要隐藏 Tab 的页面，不渲染
  if (shouldHideTab(location.pathname)) {
    return null;
  }

  // 判断当前激活的 Tab
  // 使用精确匹配或前缀匹配（首页需要精确匹配，因为 / 是所有路径的前缀）
  const getActiveTab = () => {
    if (location.pathname === '/') return '/';
    return TABS.find((tab) =>
      tab.path !== '/' ? location.pathname.startsWith(tab.path) : false
    )?.path || '';
  };

  const activeTab = getActiveTab();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 60,
        background: '#FFFFFF',
        borderTop: '0.5px solid #E8E8ED',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)', // 适配 iPhone 底部安全区域
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.path;
        const color = isActive ? COLORS.primary : COLORS.textSecondary;

        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '8px 0',
              transition: 'color 0.2s ease',
            }}
          >
            <span
              style={{
                fontSize: 22,
                lineHeight: 1,
                filter: isActive ? 'none' : 'grayscale(100%)',
                transition: 'filter 0.2s ease',
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 600 : 400,
                color,
                transition: 'color 0.2s ease',
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
