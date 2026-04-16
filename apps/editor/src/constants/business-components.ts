/**
 * 业务组件库定义
 * 按业务场景分类
 */

export interface BusinessComponentMeta {
  type: string;
  displayName: string;
  category: string;
  subCategory?: string;
  icon: string;
  description?: string;
  defaultProps: Record<string, any>;
  configSchema?: PropConfig[];
  acceptChildren?: boolean;
}

export interface PropConfig {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'select' | 'image' | 'slider' | 'input';
  defaultValue?: any;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
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

// 金刚区项目类型
export interface KingKongItem {
  id: string;
  icon: string;
  label: string;
  color?: string;
  url?: string;
  disabled?: boolean;
}

// 金刚区组件配置
export interface KingKongGridConfig {
  columns: number;
  rows: number;
  gap: number;
  backgroundColor: string;
  borderRadius: number;
  padding: number;
  itemSize: number;
  iconSize: number;
  textSize: number;
  items: KingKongItem[];
}
