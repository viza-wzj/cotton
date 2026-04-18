/**
 * 编辑器应用常量定义
 * C端移动端低代码平台
 */

// 导出业务组件定义
export * from './business-components';

// 页面 Schema 版本
export const CURRENT_SCHEMA_VERSION = '1.0.0';

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
} as const;

export function generateComponentId(type: string): string {
  return `comp_${type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
