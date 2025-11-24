/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import { useMemo } from 'react';
import { useActualTheme } from '../../context/Theme';

/**
 * 主题颜色 Hook - 统一管理所有主题相关颜色
 *
 * @example
 * const colors = useThemeColors();
 *
 * // 使用语义化颜色
 * <div style={{ color: colors.primary }}>主色文本</div>
 * <div style={{ backgroundColor: colors.bgElevated }}>卡片背景</div>
 *
 * // 判断当前主题
 * {colors.isDark && <DarkModeIcon />}
 */
export const useThemeColors = () => {
  const theme = useActualTheme();

  return useMemo(
    () => ({
      // ==================== 品牌主色 ====================
      primary: 'var(--semi-color-primary)',
      primaryHover: 'var(--semi-color-primary-hover)',
      primaryActive: 'var(--semi-color-primary-active)',
      primaryDisabled: 'var(--semi-color-primary-disabled)',
      primaryLight: 'var(--semi-color-primary-light-default)',
      primaryLightHover: 'var(--semi-color-primary-light-hover)',
      primaryLightActive: 'var(--semi-color-primary-light-active)',

      // ==================== 次要色 ====================
      secondary: 'var(--semi-color-secondary)',
      secondaryHover: 'var(--semi-color-secondary-hover)',
      secondaryActive: 'var(--semi-color-secondary-active)',
      secondaryDisabled: 'var(--semi-color-secondary-disabled)',
      secondaryLight: 'var(--semi-color-secondary-light-default)',

      // ==================== 中性色 ====================
      tertiary: 'var(--semi-color-tertiary)',
      tertiaryHover: 'var(--semi-color-tertiary-hover)',
      tertiaryActive: 'var(--semi-color-tertiary-active)',
      tertiaryLight: 'var(--semi-color-tertiary-light-default)',

      // ==================== 状态色 ====================
      success: 'var(--semi-color-success)',
      successHover: 'var(--semi-color-success-hover)',
      successActive: 'var(--semi-color-success-active)',
      successDisabled: 'var(--semi-color-success-disabled)',
      successLight: 'var(--semi-color-success-light-default)',

      warning: 'var(--semi-color-warning)',
      warningHover: 'var(--semi-color-warning-hover)',
      warningActive: 'var(--semi-color-warning-active)',
      warningLight: 'var(--semi-color-warning-light-default)',

      danger: 'var(--semi-color-danger)',
      dangerHover: 'var(--semi-color-danger-hover)',
      dangerActive: 'var(--semi-color-danger-active)',
      dangerLight: 'var(--semi-color-danger-light-default)',

      info: 'var(--semi-color-info)',
      infoHover: 'var(--semi-color-info-hover)',
      infoActive: 'var(--semi-color-info-active)',
      infoDisabled: 'var(--semi-color-info-disabled)',
      infoLight: 'var(--semi-color-info-light-default)',

      // ==================== 背景色 ====================
      bgBase: 'var(--semi-color-bg-0)', // 页面背景
      bgElevated: 'var(--semi-color-bg-1)', // 卡片/弹窗背景
      bgOverlay: 'var(--semi-color-bg-2)', // 悬浮层背景
      bgHighlight: 'var(--semi-color-bg-3)', // 高亮背景
      bgEmphasis: 'var(--semi-color-bg-4)', // 强调背景

      // ==================== 填充色 ====================
      fill: 'var(--semi-color-fill-0)', // 默认填充
      fillHover: 'var(--semi-color-fill-1)', // 悬停填充
      fillActive: 'var(--semi-color-fill-2)', // 激活填充

      // ==================== 文本色 ====================
      textPrimary: 'var(--semi-color-text-0)', // 主要文本
      textSecondary: 'var(--semi-color-text-1)', // 次要文本
      textTertiary: 'var(--semi-color-text-2)', // 辅助文本
      textDisabled: 'var(--semi-color-text-3)', // 禁用文本

      // ==================== 边框色 ====================
      border: 'var(--semi-color-border)',
      borderFocus: 'var(--semi-color-focus-border)',
      borderDisabled: 'var(--semi-color-disabled-border)',

      // ==================== 链接色 ====================
      link: 'var(--semi-color-link)',
      linkHover: 'var(--semi-color-link-hover)',
      linkActive: 'var(--semi-color-link-active)',
      linkVisited: 'var(--semi-color-link-visited)',

      // ==================== 禁用态 ====================
      disabledText: 'var(--semi-color-disabled-text)',
      disabledBorder: 'var(--semi-color-disabled-border)',
      disabledBg: 'var(--semi-color-disabled-bg)',
      disabledFill: 'var(--semi-color-disabled-fill)',

      // ==================== 特殊色 ====================
      white: 'var(--semi-color-white)',
      black: 'var(--semi-color-black)',
      shadow: 'var(--semi-color-shadow)',
      overlay: 'var(--semi-color-overlay-bg)',
      nav: 'var(--semi-color-nav-bg)',
      highlight: 'var(--semi-color-highlight)',
      highlightBg: 'var(--semi-color-highlight-bg)',

      // ==================== 数据可��化色 ====================
      data: [
        'var(--semi-color-data-0)',
        'var(--semi-color-data-1)',
        'var(--semi-color-data-2)',
        'var(--semi-color-data-3)',
        'var(--semi-color-data-4)',
        'var(--semi-color-data-5)',
        'var(--semi-color-data-6)',
        'var(--semi-color-data-7)',
        'var(--semi-color-data-8)',
        'var(--semi-color-data-9)',
        'var(--semi-color-data-10)',
        'var(--semi-color-data-11)',
        'var(--semi-color-data-12)',
        'var(--semi-color-data-13)',
        'var(--semi-color-data-14)',
        'var(--semi-color-data-15)',
        'var(--semi-color-data-16)',
        'var(--semi-color-data-17)',
        'var(--semi-color-data-18)',
        'var(--semi-color-data-19)',
      ],

      // ==================== 主题状态 ====================
      isDark: theme === 'dark',
      isLight: theme === 'light',
      theme,
    }),
    [theme]
  );
};

/**
 * 获取状态色（简化版）
 *
 * @example
 * const statusColor = useStatusColor('success');
 * <Tag style={{ backgroundColor: statusColor.light, color: statusColor.base }}>
 */
export const useStatusColor = (status) => {
  const colors = useThemeColors();

  return useMemo(() => {
    const statusMap = {
      success: {
        base: colors.success,
        hover: colors.successHover,
        active: colors.successActive,
        light: colors.successLight,
      },
      warning: {
        base: colors.warning,
        hover: colors.warningHover,
        active: colors.warningActive,
        light: colors.warningLight,
      },
      danger: {
        base: colors.danger,
        hover: colors.dangerHover,
        active: colors.dangerActive,
        light: colors.dangerLight,
      },
      info: {
        base: colors.info,
        hover: colors.infoHover,
        active: colors.infoActive,
        light: colors.infoLight,
      },
      primary: {
        base: colors.primary,
        hover: colors.primaryHover,
        active: colors.primaryActive,
        light: colors.primaryLight,
      },
    };

    return statusMap[status] || statusMap.primary;
  }, [colors, status]);
};

export default useThemeColors;
