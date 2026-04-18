/**
 * 业务组件库定义
 * 按业务场景分类
 */

import type {
  BusinessComponentPropsMap,
  BusinessComponentType,
} from '@/types/schema';

export interface BusinessComponentMeta<
  T extends BusinessComponentType = BusinessComponentType,
> {
  type: T;
  displayName: string;
  category: string;
  subCategory?: string;
  icon: string;
  description?: string;
  defaultProps: BusinessComponentPropsMap[T];
  configSchema?: PropConfig[];
  acceptChildren?: boolean;
}

export interface PropConfig {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'image' | 'slider' | 'input';
  defaultValue?: unknown;
  required?: boolean;
  options?: Array<{ label: string; value: unknown }>;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  group?: string;
}

// 业务分类
export const BUSINESS_CATEGORIES = {
  LAYOUT: 'layout',
  NAVIGATION: 'navigation',
  CONTENT: 'content',
  FORM: 'form',
  FEEDBACK: 'feedback',
  BUSINESS: 'business',
} as const;

// 业务组件元数据
export const BUSINESS_COMPONENTS: BusinessComponentMeta[] = [
  // 金刚区组件
  {
    type: 'KingKongGrid',
    displayName: '金刚区',
    category: BUSINESS_CATEGORIES.LAYOUT,
    subCategory: 'grid',
    icon: '⚡',
    description: '常用功能入口，支持自定义行列数',
    defaultProps: {
      columns: 4,              // 列数
      rows: 2,                // 行数
      gap: 10,                // 间距
      backgroundColor: '#fff', // 背景色
      borderRadius: 8,        // 圆角
      padding: 12,             // 内边距
      itemSize: 60,           // 每个格子大小
      items: [
        {
          id: '1',
          icon: '🏠',
          label: '首页',
          color: '#1296db',
          url: '',
        },
        {
          id: '2',
          icon: '🔍',
          label: '搜索',
          color: '#1296db',
          url: '',
        },
        {
          id: '3',
          icon: '📋',
          label: '订单',
          color: '#ff6b6b',
          url: '',
        },
        {
          id: '4',
          icon: '👤',
          label: '我的',
          color: '#1296db',
          url: '',
        },
      ],
    },
    configSchema: [
      {
        group: '基础配置',
        name: 'columns',
        label: '列数',
        type: 'slider',
        defaultValue: 4,
        min: 2,
        max: 6,
        step: 1,
        description: '每行显示的格子数量',
      },
      {
        group: '基础配置',
        name: 'rows',
        label: '行数',
        type: 'slider',
        defaultValue: 2,
        min: 1,
        max: 6,
        step: 1,
        description: '显示的行数',
      },
      {
        group: '样式配置',
        name: 'gap',
        label: '间距',
        type: 'slider',
        defaultValue: 10,
        min: 0,
        max: 30,
        step: 2,
        description: '格子之间的间距',
      },
      {
        group: '样式配置',
        name: 'backgroundColor',
        label: '背景颜色',
        type: 'color',
        defaultValue: '#ffffff',
        description: '组件背景色',
      },
      {
        group: '样式配置',
        name: 'borderRadius',
        label: '圆角',
        type: 'slider',
        defaultValue: 8,
        min: 0,
        max: 20,
        step: 1,
        description: '圆角大小',
      },
      {
        group: '样式配置',
        name: 'padding',
        label: '内边距',
        type: 'slider',
        defaultValue: 12,
        min: 0,
        max: 30,
        step: 2,
        description: '内边距大小',
      },
      {
        group: '样式配置',
        name: 'itemSize',
        label: '格子大小',
        type: 'slider',
        defaultValue: 60,
        min: 40,
        max: 100,
        step: 5,
        description: '每个格子的大小（px）',
      },
      {
        group: '样式配置',
        name: 'iconSize',
        label: '图标大小',
        type: 'slider',
        defaultValue: 28,
        min: 16,
        max: 48,
        step: 2,
        description: '图标大小（px）',
      },
      {
        group: '样式配置',
        name: 'textSize',
        label: '文字大小',
        type: 'slider',
        defaultValue: 12,
        min: 10,
        max: 18,
        step: 1,
        description: '文字大小（px）',
      },
    ],
  },

  // 导航栏组件
  {
    type: 'CustomNavBar',
    displayName: '自定义导航栏',
    category: BUSINESS_CATEGORIES.NAVIGATION,
    subCategory: 'header',
    icon: '🧭',
    description: '顶部导航栏，支持自定义样式',
    defaultProps: {
      title: '标题',
      leftContent: null,
      rightContent: null,
      backgroundColor: '#1989fa',
      textColor: '#fff',
      height: 44,
      showBack: false,
    },
    configSchema: [
      { group: '基础配置', name: 'title', label: '标题', type: 'input' },
      { group: '基础配置', name: 'showBack', label: '显示返回', type: 'boolean' },
      { group: '样式配置', name: 'backgroundColor', label: '背景颜色', type: 'color' },
      { group: '样式配置', name: 'textColor', label: '文字颜色', type: 'color' },
      { group: '样式配置', name: 'height', label: '高度', type: 'slider', min: 30, max: 60, step: 2 },
    ],
  },

  // 搜索框组件
  {
    type: 'SearchBar',
    displayName: '搜索框',
    category: BUSINESS_CATEGORIES.CONTENT,
    subCategory: 'input',
    icon: '🔍',
    description: '搜索输入框',
    defaultProps: {
      placeholder: '搜索',
      backgroundColor: '#f5f5f5',
      borderRadius: 20,
      height: 40,
    },
    configSchema: [
      { group: '基础配置', name: 'placeholder', label: '占位文字', type: 'input' },
      { group: '样式配置', name: 'backgroundColor', label: '背景颜色', type: 'color' },
      { group: '样式配置', name: 'borderRadius', label: '圆角', type: 'slider', min: 0, max: 30, step: 1 },
      { group: '样式配置', name: 'height', label: '高度', type: 'slider', min: 30, max: 60, step: 2 },
    ],
  },

  // 卡片容器组件
  {
    type: 'CardContainer',
    displayName: '卡片容器',
    category: BUSINESS_CATEGORIES.LAYOUT,
    subCategory: 'container',
    icon: '📦',
    description: '卡片容器，可放置其他组件',
    acceptChildren: true,
    defaultProps: {
      title: '卡片标题',
      showHeader: true,
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 12,
      shadow: true,
    },
    configSchema: [
      { group: '基础配置', name: 'title', label: '标题', type: 'input' },
      { group: '基础配置', name: 'showHeader', label: '显示标题栏', type: 'boolean' },
      { group: '基础配置', name: 'shadow', label: '显示阴影', type: 'boolean' },
      { group: '样式配置', name: 'backgroundColor', label: '背景颜色', type: 'color' },
      { group: '样式配置', name: 'borderRadius', label: '圆角', type: 'slider', min: 0, max: 20, step: 1 },
      { group: '样式配置', name: 'padding', label: '内边距', type: 'slider', min: 0, max: 30, step: 2 },
    ],
  },

  // Banner 轮播组件
  {
    type: 'BannerCarousel',
    displayName: 'Banner轮播',
    category: BUSINESS_CATEGORIES.CONTENT,
    subCategory: 'media',
    icon: '🎠',
    description: 'Banner图片轮播',
    defaultProps: {
      height: 160,
      autoplay: 3000,
      indicator: true,
      images: [
        'https://via.placeholder.com/750x320',
        'https://via.placeholder.com/750x320',
      ],
    },
    configSchema: [
      { group: '基础配置', name: 'indicator', label: '显示指示器', type: 'boolean' },
      { group: '样式配置', name: 'height', label: '高度', type: 'slider', min: 100, max: 300, step: 10 },
      { group: '样式配置', name: 'autoplay', label: '自动播放间隔(ms)', type: 'slider', min: 0, max: 10000, step: 500 },
    ],
  },

  // 按钮组组件
  {
    type: 'ButtonGroup',
    displayName: '按钮组',
    category: BUSINESS_CATEGORIES.FORM,
    subCategory: 'action',
    icon: '🔘',
    description: '一组操作按钮',
    defaultProps: {
      buttons: [
        { text: '主要按钮', type: 'primary' },
        { text: '次要按钮', type: 'default' },
      ],
      direction: 'row',
      gap: 10,
    },
    configSchema: [
      {
        group: '基础配置', name: 'direction', label: '排列方向', type: 'select',
        options: [{ label: '水平', value: 'row' }, { label: '垂直', value: 'column' }],
      },
      { group: '样式配置', name: 'gap', label: '间距', type: 'slider', min: 0, max: 30, step: 2 },
    ],
  },

  // 列表项组件
  {
    type: 'ListItem',
    displayName: '列表项',
    category: BUSINESS_CATEGORIES.CONTENT,
    subCategory: 'list',
    icon: '📄',
    description: '列表项组件',
    defaultProps: {
      title: '标题',
      description: '描述信息',
      leftIcon: '',
      rightArrow: true,
      showDivider: true,
    },
    configSchema: [
      { group: '基础配置', name: 'title', label: '标题', type: 'input' },
      { group: '基础配置', name: 'description', label: '描述', type: 'input' },
      { group: '基础配置', name: 'leftIcon', label: '左侧图标', type: 'input' },
      { group: '基础配置', name: 'rightArrow', label: '显示右箭头', type: 'boolean' },
      { group: '基础配置', name: 'showDivider', label: '显示分割线', type: 'boolean' },
    ],
  },

  // 标签组件
  {
    type: 'CustomLabel',
    displayName: '标签',
    category: BUSINESS_CATEGORIES.CONTENT,
    subCategory: 'tag',
    icon: '🏷️',
    description: '标签展示组件',
    defaultProps: {
      text: '标签',
      type: 'default',
      size: 'medium',
      closable: false,
    },
    configSchema: [
      { group: '基础配置', name: 'text', label: '文本', type: 'input' },
      {
        group: '基础配置', name: 'type', label: '类型', type: 'select',
        options: [
          { label: '默认', value: 'default' },
          { label: '主要', value: 'primary' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'danger' },
        ],
      },
      {
        group: '基础配置', name: 'size', label: '大小', type: 'select',
        options: [
          { label: '大', value: 'large' },
          { label: '中', value: 'medium' },
          { label: '小', value: 'small' },
        ],
      },
      { group: '基础配置', name: 'closable', label: '可关闭', type: 'boolean' },
    ],
  },

  // 空白占位组件
  {
    type: 'WhiteSpace',
    displayName: '空白占位',
    category: BUSINESS_CATEGORIES.LAYOUT,
    subCategory: 'space',
    icon: '⬜',
    description: '垂直空白占位',
    defaultProps: {
      height: 10,
    },
    configSchema: [
      { name: 'height', label: '高度', type: 'slider', min: 0, max: 100, step: 5 },
    ],
  },

  // 分割线组件
  {
    type: 'Divider',
    displayName: '分割线',
    category: BUSINESS_CATEGORIES.LAYOUT,
    subCategory: 'divider',
    icon: '➖',
    description: '水平分割线',
    defaultProps: {
      height: 1,
      color: '#e5e5e5',
      dashed: false,
      textPosition: 'center',
      text: '',
    },
    configSchema: [
      { group: '基础配置', name: 'text', label: '文本', type: 'input' },
      {
        group: '基础配置', name: 'textPosition', label: '文本位置', type: 'select',
        options: [
          { label: '左', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右', value: 'right' },
        ],
      },
      { group: '基础配置', name: 'dashed', label: '虚线', type: 'boolean' },
      { group: '样式配置', name: 'height', label: '线条粗细', type: 'slider', min: 1, max: 10, step: 1 },
      { group: '样式配置', name: 'color', label: '颜色', type: 'color' },
    ],
  },
];

// 业务分组（用于 Tab）
export const BUSINESS_GROUPS = [
  {
    id: 'layout',
    name: '布局',
    icon: '📐',
    components: BUSINESS_COMPONENTS.filter(c => c.category === BUSINESS_CATEGORIES.LAYOUT),
  },
  {
    id: 'navigation',
    name: '导航',
    icon: '🧭',
    components: BUSINESS_COMPONENTS.filter(c => c.category === BUSINESS_CATEGORIES.NAVIGATION),
  },
  {
    id: 'content',
    name: '内容',
    icon: '📄',
    components: BUSINESS_COMPONENTS.filter(c => c.category === BUSINESS_CATEGORIES.CONTENT),
  },
  {
    id: 'form',
    name: '表单',
    icon: '📝',
    components: BUSINESS_COMPONENTS.filter(c => c.category === BUSINESS_CATEGORIES.FORM),
  },
  {
    id: 'feedback',
    name: '反馈',
    icon: '💬',
    components: BUSINESS_COMPONENTS.filter(c => c.category === BUSINESS_CATEGORIES.FEEDBACK),
  },
  {
    id: 'business',
    name: '业务',
    icon: '💼',
    components: BUSINESS_COMPONENTS.filter(c => c.category === BUSINESS_CATEGORIES.BUSINESS),
  },
];
