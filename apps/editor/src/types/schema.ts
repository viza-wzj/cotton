/**
 * 本地 Schema 类型定义
 */

export interface PageSchema {
  /** 页面唯一标识 */
  id: string;
  /** 页面名称 */
  name: string;
  /** 页面描述 */
  description?: string;
  /** Schema 版本（用于数据迁移） */
  schemaVersion: string;
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
  styles?: Record<string, unknown>;
  /** 全局变量 */
  variables?: Record<string, unknown>;
}

export interface ThemeConfig {
  /** 主色调 */
  primaryColor?: string;
  /** 字体设置 */
  fontFamily?: string;
  /** 背景色 */
  backgroundColor?: string;
  /** 其他主题配置 */
  [key: string]: unknown;
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

export interface BaseComponentSchema<
  TType extends string = string,
  TProps extends object = Record<string, unknown>,
> {
  /** 组件唯一标识 */
  id: string;
  /** 组件类型 */
  type: TType;
  /** 组件名称 */
  name?: string;
  /** 组件属性 */
  props: TProps;
  /** 组件样式 */
  styles?: CSSProperties;
  /** 子组件 */
  children?: ComponentSchema[];
  /** 是否隐藏 */
  hidden?: boolean;
  /** 是否锁定 */
  locked?: boolean;
  /** 条件渲染 */
  condition?: string;
}

export type ComponentSchema = BaseComponentSchema;

export interface CSSProperties {
  [key: string]: string | number | undefined;
}


// 业务组件类型定义
export interface KingKongItem {
  id: string;
  icon: string;
  label: string;
  color?: string;
  url?: string;
  disabled?: boolean;
}

export interface KingKongGridProps {
  columns: number;
  rows: number;
  gap: number;
  backgroundColor: string;
  borderRadius: number;
  padding: number;
  itemSize: number;
  iconSize?: number;
  textSize?: number;
  items: KingKongItem[];
}

export interface CustomNavBarProps {
  title: string;
  leftContent?: unknown;
  rightContent?: unknown;
  backgroundColor: string;
  textColor: string;
  height: number;
  showBack: boolean;
}

export interface SearchBarProps {
  placeholder: string;
  backgroundColor: string;
  borderRadius: number;
  height: number;
}

export interface CardContainerProps {
  title: string;
  showHeader: boolean;
  backgroundColor: string;
  borderRadius: number;
  padding: number;
  shadow: boolean;
}

export interface BannerCarouselProps {
  height: number;
  autoplay?: number;
  indicator: boolean;
  images: string[];
}

export interface ButtonGroupItem {
  text: string;
  type?: 'primary' | 'default' | 'warning' | 'danger';
}

export interface ButtonGroupProps {
  buttons: ButtonGroupItem[];
  direction: 'row' | 'column';
  gap: number;
}

export interface ListItemProps {
  title: string;
  description: string;
  leftIcon: string;
  rightArrow: boolean;
  showDivider: boolean;
}

export interface CustomLabelProps {
  text: string;
  type: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size: 'large' | 'medium' | 'small';
  closable: boolean;
}

export interface WhiteSpaceProps {
  height: number;
}

export interface DividerProps {
  height: number;
  color: string;
  dashed: boolean;
  textPosition?: 'left' | 'center' | 'right';
  text: string;
}

export type BusinessComponentType =
  | 'KingKongGrid'
  | 'CustomNavBar'
  | 'SearchBar'
  | 'CardContainer'
  | 'BannerCarousel'
  | 'ButtonGroup'
  | 'ListItem'
  | 'CustomLabel'
  | 'WhiteSpace'
  | 'Divider';

export interface BusinessComponentPropsMap {
  KingKongGrid: KingKongGridProps;
  CustomNavBar: CustomNavBarProps;
  SearchBar: SearchBarProps;
  CardContainer: CardContainerProps;
  BannerCarousel: BannerCarouselProps;
  ButtonGroup: ButtonGroupProps;
  ListItem: ListItemProps;
  CustomLabel: CustomLabelProps;
  WhiteSpace: WhiteSpaceProps;
  Divider: DividerProps;
}

