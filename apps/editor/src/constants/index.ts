/**
 * 编辑器应用常量定义
 * C端移动端低代码平台
 */

// 导出业务组件定义
export * from './business-components';

// 移动端画布配置
export const MOBILE_CANVAS_CONFIG = {
  // iPhone 尺寸
  DEFAULT_WIDTH: 375,
  DEFAULT_HEIGHT: 812,
  // Android 尺寸
  DEFAULT_WIDTH_ANDROID: 360,
  DEFAULT_HEIGHT_ANDROID: 760,
  // iPad 尺寸
  DEFAULT_WIDTH_TABLET: 768,
  DEFAULT_HEIGHT_TABLET: 1024,
} as const;

// 设备类型
export const DEVICE_TYPES = {
  IPHONE: 'iphone',
  ANDROID: 'android',
  IPAD: 'ipad',
  CUSTOM: 'custom',
} as const;

// 编辑器配置
export const EDITOR_CONFIG = {
  HISTORY: {
    MAX_SIZE: 50,
    DEBOUNCE_MS: 500,
  },
  AUTO_SAVE: {
    ENABLED: true,
    INTERVAL_MS: 30000,
  },
  // 预览模式
  PREVIEW_MODE: {
    REAL_TIME: true, // 实时预览
    AUTO_REFRESH: true, // 自动刷新
  },
} as const;

// ID 生成器
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

export function generateComponentId(type: string): string {
  return `comp_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
