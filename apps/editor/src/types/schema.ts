/**
 * 本地 Schema 类型定义
 * 避免从 @cotton/schema 导入时的解析问题
 */

export interface PageSchema {
  /** 页面唯一标识 */
  id: string;
  /** 页面名称 */
  name: string;
  /** 页面描述 */
  description?: string;
  /** 版本号 */
  version: string;
  /** 页面组件树 */
  components: ComponentSchema[];
  /** 全局配置 */
  globalConfig: GlobalConfig;
  /** 元数据 */
  metadata: PageMetadata;
}

export interface GlobalConfig {
  /** 主题配置 */
  theme?: ThemeConfig;
  /** 全局样式 */
  styles?: Record<string, any>;
  /** 全局变量 */
  variables?: Record<string, any>;
}

export interface ThemeConfig {
  /** 主色调 */
  primaryColor?: string;
  /** 字体设置 */
  fontFamily?: string;
  /** 背景色 */
  backgroundColor?: string;
  /** 其他主题配置 */
  [key: string]: any;
}

export interface PageMetadata {
  /** 创建时间 */
  createdAt: Date;
  /** 更新时间 */
  updatedAt: Date;
  /** 创建者 */
  createdBy: string;
  /** 最后更新者 */
  updatedBy?: string;
  /** 标签 */
  tags?: string[];
}

export interface ComponentSchema {
  /** 组件唯一标识 */
  id: string;
  /** 组件类型 */
  type: string;
  /** 组件名称 */
  name?: string;
  /** 组件属性 */
  props: Record<string, any>;
  /** 组件样式 */
  styles?: CSSProperties;
  /** 子组件 */
  children?: ComponentSchema[];
  /** 事件处理器 */
  events?: EventHandler[];
  /** 是否隐藏 */
  hidden?: boolean;
  /** 是否锁定 */
  locked?: boolean;
  /** 条件渲染 */
  condition?: string;
}

export interface CSSProperties {
  [key: string]: string | number | undefined;
}

export interface EventHandler {
  /** 事件名称 */
  name: string;
  /** 事件处理动作 */
  actions: EventAction[];
}

export interface EventAction {
  /** 动作类型 */
  type: 'navigation' | 'api' | 'state' | 'custom' | 'message';
  /** 动作配置 */
  config: Record<string, any>;
}

// 常量定义
export const COMPONENT_CATEGORIES = {
  BASIC: 'basic',
  FORM: 'form',
  DATA: 'data',
  LAYOUT: 'layout',
  ADVANCED: 'advanced',
} as const;
