#!/usr/bin/env node

/**
 * 自动迁移脚本：将 var(--semi-color-*) 和 className 中的颜色迁移到 useThemeColors
 */

const fs = require('fs');
const path = require('path');

// 颜色映射表：CSS变量 -> Hook属性
const COLOR_MAP = {
  // 主色
  'var(--semi-color-primary)': 'colors.primary',
  'var(--semi-color-primary-hover)': 'colors.primaryHover',
  'var(--semi-color-primary-active)': 'colors.primaryActive',
  'var(--semi-color-primary-disabled)': 'colors.primaryDisabled',
  'var(--semi-color-primary-light-default)': 'colors.primaryLight',
  'var(--semi-color-primary-light-hover)': 'colors.primaryLightHover',
  'var(--semi-color-primary-light-active)': 'colors.primaryLightActive',

  // 次要色
  'var(--semi-color-secondary)': 'colors.secondary',
  'var(--semi-color-secondary-hover)': 'colors.secondaryHover',
  'var(--semi-color-secondary-active)': 'colors.secondaryActive',
  'var(--semi-color-secondary-disabled)': 'colors.secondaryDisabled',
  'var(--semi-color-secondary-light-default)': 'colors.secondaryLight',

  // 状态色
  'var(--semi-color-success)': 'colors.success',
  'var(--semi-color-success-hover)': 'colors.successHover',
  'var(--semi-color-success-active)': 'colors.successActive',
  'var(--semi-color-success-light-default)': 'colors.successLight',

  'var(--semi-color-warning)': 'colors.warning',
  'var(--semi-color-warning-hover)': 'colors.warningHover',
  'var(--semi-color-warning-active)': 'colors.warningActive',
  'var(--semi-color-warning-light-default)': 'colors.warningLight',

  'var(--semi-color-danger)': 'colors.danger',
  'var(--semi-color-danger-hover)': 'colors.dangerHover',
  'var(--semi-color-danger-active)': 'colors.dangerActive',
  'var(--semi-color-danger-light-default)': 'colors.dangerLight',

  'var(--semi-color-info)': 'colors.info',
  'var(--semi-color-info-hover)': 'colors.infoHover',
  'var(--semi-color-info-active)': 'colors.infoActive',
  'var(--semi-color-info-light-default)': 'colors.infoLight',

  // 背景色
  'var(--semi-color-bg-0)': 'colors.bgBase',
  'var(--semi-color-bg-1)': 'colors.bgElevated',
  'var(--semi-color-bg-2)': 'colors.bgOverlay',
  'var(--semi-color-bg-3)': 'colors.bgHighlight',
  'var(--semi-color-bg-4)': 'colors.bgEmphasis',

  // 填充色
  'var(--semi-color-fill-0)': 'colors.fill',
  'var(--semi-color-fill-1)': 'colors.fillHover',
  'var(--semi-color-fill-2)': 'colors.fillActive',

  // 文本色
  'var(--semi-color-text-0)': 'colors.textPrimary',
  'var(--semi-color-text-1)': 'colors.textSecondary',
  'var(--semi-color-text-2)': 'colors.textTertiary',
  'var(--semi-color-text-3)': 'colors.textDisabled',

  // 边框色
  'var(--semi-color-border)': 'colors.border',
  'var(--semi-color-focus-border)': 'colors.borderFocus',
  'var(--semi-color-disabled-border)': 'colors.borderDisabled',

  // 链接色
  'var(--semi-color-link)': 'colors.link',
  'var(--semi-color-link-hover)': 'colors.linkHover',
  'var(--semi-color-link-active)': 'colors.linkActive',

  // 禁用态
  'var(--semi-color-disabled-text)': 'colors.disabledText',
  'var(--semi-color-disabled-bg)': 'colors.disabledBg',

  // 特殊色
  'var(--semi-color-white)': 'colors.white',
  'var(--semi-color-black)': 'colors.black',
  'var(--semi-color-overlay-bg)': 'colors.overlay',
};

// className 映射表
const CLASS_MAP = {
  'text-semi-color-primary': 'colors.primary',
  'bg-semi-color-primary-light-default': 'colors.primaryLight',
  'bg-semi-color-fill-0': 'colors.fill',
  'bg-semi-color-fill-1': 'colors.fillHover',
  'hover:!bg-semi-color-fill-1': 'colors.fillHover',
  '!bg-semi-color-fill-1': 'colors.fillHover',
  'text-semi-color-text-0': 'colors.textPrimary',
  'text-semi-color-text-1': 'colors.textSecondary',
  'text-semi-color-text-2': 'colors.textTertiary',
};

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let needsHook = false;

  // 检查是否已经导入 useThemeColors
  const hasImport = /import.*useThemeColors.*from/.test(content);

  // 检查是否已经有 const colors = useThemeColors()
  const hasHook = /const\s+colors\s*=\s*useThemeColors\(\)/.test(content);

  // 替换 var(--semi-color-*) 为 colors.*
  for (const [cssVar, hookProp] of Object.entries(COLOR_MAP)) {
    const regex = new RegExp(cssVar.replace(/[()]/g, '\\$&'), 'g');
    if (regex.test(content)) {
      content = content.replace(regex, hookProp);
      modified = true;
      needsHook = true;
    }
  }

  // 如果需要 hook 但还没有导入
  if (needsHook && !hasImport && !filePath.includes('useThemeColors.js')) {
    // 找到 import 区域末尾
    const importMatch = content.match(/(import[\s\S]*?from\s+['"][^'"]+['"];?\n)(?=\n)/);
    if (importMatch) {
      const lastImportEnd = importMatch.index + importMatch[0].length;
      const importStatement = "import { useThemeColors } from '@/hooks/common/useThemeColors';\n";
      content = content.slice(0, lastImportEnd) + importStatement + content.slice(lastImportEnd);
    }
  }

  // 如果需要 hook 但函数组件中还没有声明
  if (needsHook && !hasHook && !filePath.includes('useThemeColors.js')) {
    // 在函数组件开头添加 hook
    // 匹配函数组件定义 (包括箭头函数和普通函数)
    const funcPatterns = [
      /(const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{)/,
      /(function\s+\w+\s*\([^)]*\)\s*{)/,
      /(export\s+(?:default\s+)?(?:const|function)\s+\w+\s*=?\s*\([^)]*\)\s*(?:=>)?\s*{)/
    ];

    for (const pattern of funcPatterns) {
      const match = content.match(pattern);
      if (match) {
        const funcStart = match.index + match[0].length;
        // 跳过已有的代码，找到合适的插入位置（第一个有效语句之前）
        const hookStatement = '\n  const colors = useThemeColors();\n';
        content = content.slice(0, funcStart) + hookStatement + content.slice(funcStart);
        break;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Migrated: ${filePath}`);
    return true;
  }

  return false;
}

// 获取所有需要迁移的文件
function getFilesToMigrate(dir) {
  const files = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory() && entry.name !== 'node_modules') {
        walk(fullPath);
      } else if (entry.isFile() && /\.(jsx|js)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (/var\(--semi-color|semi-color-/.test(content)) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

// 主函数
function main() {
  const srcDir = path.join(__dirname, 'src');
  const files = getFilesToMigrate(srcDir);

  console.log(`Found ${files.length} files to migrate\n`);

  let migratedCount = 0;
  for (const file of files) {
    if (migrateFile(file)) {
      migratedCount++;
    }
  }

  console.log(`\n✨ Migration complete: ${migratedCount}/${files.length} files migrated`);
}

main();
