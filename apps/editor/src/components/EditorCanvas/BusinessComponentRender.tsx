import type {
  BannerCarouselProps,
  ButtonGroupItem,
  ButtonGroupProps,
  CardContainerProps,
  ComponentSchema,
  CustomLabelProps,
  CustomNavBarProps,
  DividerProps,
  KingKongGridProps,
  KingKongItem,
  ListItemProps,
  SearchBarProps,
  WhiteSpaceProps,
} from '@/types/schema';
import ErrorBoundary from '@/components/ErrorBoundary';

interface BusinessComponentRenderProps {
  component: ComponentSchema;
  isSelected: boolean;
  onClick: (e: React.MouseEvent, id: string) => void;
  isPreview: boolean;
  onDropToContainer?: (parentId: string, e: React.DragEvent) => void;
}

export default function BusinessComponentRender({
  component,
  isSelected,
  onClick,
  isPreview,
  onDropToContainer,
}: BusinessComponentRenderProps) {
  const renderComponent = () => {
    switch (component.type) {
      case 'KingKongGrid':
        return renderKingKongGrid(component);

      case 'CustomNavBar':
        return renderCustomNavBar(component);

      case 'SearchBar':
        return renderSearchBar(component);

      case 'CardContainer':
        return renderCardContainer(component, isPreview, onClick);

      case 'BannerCarousel':
        return renderBannerCarousel(component);

      case 'ButtonGroup':
        return renderButtonGroup(component);

      case 'ListItem':
        return renderListItem(component);

      case 'CustomLabel':
        return renderCustomLabel(component);

      case 'WhiteSpace':
        return renderWhiteSpace(component);

      case 'Divider':
        return renderDivider(component);

      default:
        return (
          <div className="p-4 bg-gray-100 border border-gray-300 rounded m-4">
            <div className="text-sm text-gray-600">
              未知组件: {component.type}
            </div>
          </div>
        );
    }
  };

  // 金刚区渲染器
  const renderKingKongGrid = (comp: ComponentSchema) => {
    const props = comp.props as Partial<KingKongGridProps>;
    const {
      columns = 4,
      rows = 2,
      gap = 10,
      backgroundColor = '#fff',
      borderRadius = 8,
      padding = 12,
      itemSize = 60,
      iconSize = 28,
      textSize = 12,
      items = [],
    } = props;

    // 默认示例数据
    const defaultItems: KingKongItem[] = [
      { id: '1', icon: '🏠', label: '首页', color: '#1296db' },
      { id: '2', icon: '🔍', label: '搜索', color: '#1296db' },
      { id: '3', icon: '📋', label: '订单', color: '#ff6b6b' },
      { id: '4', icon: '👤', label: '我的', color: '#1296db' },
    ];

    const gridItems = items.length > 0 ? items : defaultItems;

    return (
      <div
        className="kingkong-grid"
        style={{
          backgroundColor,
          borderRadius: borderRadius,
          padding,
        }}
      >
        <div
          className="grid-container"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: gap,
          }}
        >
          {gridItems.slice(0, rows * columns).map((item: KingKongItem, index: number) => (
            <div
              key={item.id || index}
              className="kingkong-item"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onClick={(e) => {
                if (!isPreview) {
                  e.stopPropagation();
                  // 可以在这里触发配置面板
                }
              }}
            >
              {/* 图标 */}
              <div
                className="kingkong-icon"
                style={{
                  fontSize: iconSize,
                  width: itemSize,
                  height: itemSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: item.color ? `${item.color}15` : 'transparent',
                  borderRadius: 12,
                }}
              >
                {item.icon}
              </div>

              {/* 文字 */}
              <div
                className="kingkong-label"
                style={{
                  fontSize: textSize,
                  color: '#333',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 自定义导航栏
  const renderCustomNavBar = (comp: ComponentSchema) => {
    const props = comp.props as Partial<CustomNavBarProps>;
    const {
      title = '标题',
      leftContent = null,
      rightContent = null,
      backgroundColor = '#1989fa',
      textColor = '#fff',
      height = 44,
      showBack = false,
    } = props;
    const navLeftContent = leftContent as React.ReactNode;
    const navRightContent = rightContent as React.ReactNode;

    return (
      <div
        className="custom-navbar"
        style={{
          backgroundColor,
          color: textColor,
          height,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* 左侧内容 */}
        <div className="navbar-left" style={{ flex: 1 }}>
          {showBack && (
            <span style={{ cursor: 'pointer' }}>←</span>
          )}
          {navLeftContent}
        </div>

        {/* 标题 */}
        <div
          className="navbar-title"
          style={{
            flex: 2,
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          {title}
        </div>

        {/* 右侧内容 */}
        <div className="navbar-right" style={{ flex: 1, textAlign: 'right' }}>
          {navRightContent}
        </div>
      </div>
    );
  };

  // 搜索框
  const renderSearchBar = (comp: ComponentSchema) => {
    const props = comp.props as Partial<SearchBarProps>;
    const {
      placeholder = '搜索',
      backgroundColor = '#f5f5f5',
      borderRadius = 20,
      height = 40,
    } = props;

    return (
      <div className="search-bar" style={{ padding: '12px 16px' }}>
        <div
          style={{
            backgroundColor,
            borderRadius,
            height,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
          }}
        >
          <span style={{ fontSize: 18, marginRight: 8 }}>🔍</span>
          <input
            type="text"
            placeholder={placeholder}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 14,
            }}
          />
        </div>
      </div>
    );
  };

  // 卡片容器
  const renderCardContainer = (
    comp: ComponentSchema,
    preview: boolean,
    clickHandler: (e: React.MouseEvent, id: string) => void
  ) => {
    const props = comp.props as Partial<CardContainerProps>;
    const {
      title = '卡片标题',
      showHeader = true,
      backgroundColor = '#fff',
      borderRadius = 8,
      padding = 12,
      shadow = true,
    } = props;

    const hasChildren = comp.children && comp.children.length > 0;
    const isDropTarget = !preview && onDropToContainer;

    const handleDragOver = (e: React.DragEvent) => {
      if (!isDropTarget) return;
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      if (!isDropTarget) return;
      e.preventDefault();
      e.stopPropagation();
      onDropToContainer(comp.id, e);
    };

    return (
      <div
        className="card-container"
        style={{
          backgroundColor,
          borderRadius,
          padding,
          margin: '12px',
          boxShadow: shadow ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
        }}
        onClick={(e) => !preview && clickHandler(e, comp.id || '')}
      >
        {showHeader && (
          <div
            className="card-header"
            style={{
              fontSize: 16,
              fontWeight: 500,
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            {title}
          </div>
        )}
        <div
          className="card-body"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            minHeight: hasChildren ? undefined : 40,
            border: !preview && !hasChildren ? '2px dashed #d1d5db' : 'none',
            borderRadius: 4,
            display: 'flex',
            alignItems: hasChildren ? undefined : 'center',
            justifyContent: hasChildren ? undefined : 'center',
          }}
        >
          {hasChildren ? (
            comp.children!.map((child) => (
              <BusinessComponentRender
                key={child.id}
                component={child}
                isSelected={false}
                onClick={clickHandler}
                isPreview={preview}
                onDropToContainer={onDropToContainer}
              />
            ))
          ) : (
            !preview && (
              <span className="text-xs text-gray-400">拖拽组件到此处</span>
            )
          )}
        </div>
      </div>
    );
  };

  // Banner 轮播
  const renderBannerCarousel = (comp: ComponentSchema) => {
    const props = comp.props as Partial<BannerCarouselProps>;
    const {
      height = 160,
      indicator = true,
      images = [],
    } = props;

    const defaultImages = [
      'https://via.placeholder.com/750x320/1989fa/ffffff?text=Banner+1',
      'https://via.placeholder.com/750x320/ff6b6b/ffffff?text=Banner+2',
      'https://via.placeholder.com/750x320/1296db/ffffff?text=Banner+3',
    ];

    const bannerImages = images.length > 0 ? images : defaultImages;

    return (
      <div className="banner-carousel" style={{ padding: '12px 16px' }}>
        <div
          style={{
            height,
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {bannerImages.map((src: string, index: number) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: index === 0 ? 1 : 0,
                transition: 'opacity 0.5s',
              }}
            >
              <img
                src={src}
                alt={`banner-${index}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          ))}
          {indicator && (
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 6,
              }}
            >
              {bannerImages.map((_: string, index: number) => (
                <div
                  key={index}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: index === 0 ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 按钮组
  const renderButtonGroup = (comp: ComponentSchema) => {
    const props = comp.props as Partial<ButtonGroupProps>;
    const {
      buttons = [
        { text: '主要按钮', type: 'primary' },
        { text: '次要按钮', type: 'default' },
      ],
      direction = 'row',
      gap = 10,
    } = props;

    const getButtonStyle = (type: string) => {
      const styles = {
        primary: { backgroundColor: '#1989fa', color: '#fff' },
        default: { backgroundColor: '#f5f5f5', color: '#333' },
        warning: { backgroundColor: '#ff976a', color: '#fff' },
        danger: { backgroundColor: '#ee0a24', color: '#fff' },
      };
      return styles[type as keyof typeof styles] || styles.default;
    };

    return (
      <div
        className="button-group"
        style={{
          padding: '12px 16px',
          display: 'flex',
          flexDirection: direction === 'row' ? 'row' : 'column',
          gap,
        }}
      >
        {buttons.map((btn: ButtonGroupItem, index: number) => (
          <button
            key={index}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              ...getButtonStyle(btn.type || 'default'),
            }}
          >
            {btn.text}
          </button>
        ))}
      </div>
    );
  };

  // 列表项
  const renderListItem = (comp: ComponentSchema) => {
    const props = comp.props as Partial<ListItemProps>;
    const {
      title = '标题',
      description = '描述信息',
      leftIcon = '',
      rightArrow = true,
      showDivider = true,
    } = props;

    return (
      <div
        className="list-item"
        style={{
          padding: '12px 16px',
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          borderBottom: showDivider ? '1px solid #f0f0f0' : 'none',
          cursor: 'pointer',
        }}
      >
        {leftIcon && (
          <span style={{ fontSize: 20, marginRight: 12 }}>{leftIcon}</span>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, color: '#333' }}>{title}</div>
          {description && (
            <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
              {description}
            </div>
          )}
        </div>
        {rightArrow && <span style={{ marginLeft: 8, color: '#c8c9cc' }}>›</span>}
      </div>
    );
  };

  // 标签
  const renderCustomLabel = (comp: ComponentSchema) => {
    const props = comp.props as Partial<CustomLabelProps>;
    const {
      text = '标签',
      type = 'default',
      size = 'medium',
      closable = false,
    } = props;

    const getTypeStyle = () => {
      const styles = {
        default: { backgroundColor: '#f5f5f5', color: '#333' },
        primary: { backgroundColor: '#1989fa', color: '#fff' },
        success: { backgroundColor: '#07c160', color: '#fff' },
        warning: { backgroundColor: '#ff976a', color: '#fff' },
        danger: { backgroundColor: '#ee0a24', color: '#fff' },
      };
      return styles[type as keyof typeof styles] || styles.default;
    };

    const getSizeStyle = () => {
      const sizes = {
        large: { padding: '6px 12px', fontSize: 14 },
        medium: { padding: '4px 10px', fontSize: 13 },
        small: { padding: '2px 8px', fontSize: 12 },
      };
      return sizes[size as keyof typeof sizes] || sizes.medium;
    };

    return (
      <span
        className="custom-tag"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: 4,
          ...getSizeStyle(),
          ...getTypeStyle(),
          position: 'relative',
        }}
      >
        {text}
        {closable && (
          <span
            style={{
              marginLeft: 4,
              cursor: 'pointer',
              opacity: 0.7,
            }}
          >
            ×
          </span>
        )}
      </span>
    );
  };

  // 空白占位
  const renderWhiteSpace = (comp: ComponentSchema) => {
    const props = comp.props as Partial<WhiteSpaceProps>;
    const { height = 10 } = props;
    return <div style={{ height }} />;
  };

  // 分割线
  const renderDivider = (comp: ComponentSchema) => {
    const props = comp.props as Partial<DividerProps>;
    const {
      height = 1,
      color = '#e5e5e5',
      dashed = false,
      text = '',
    } = props;

    return (
      <div
        className="divider"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
        }}
      >
        <div
          style={{
            flex: 1,
            height,
            backgroundColor: color,
            borderStyle: dashed ? 'dashed' : 'solid',
          }}
        />
        {text && (
          <span
            style={{
              padding: '0 12px',
              fontSize: 13,
              color: '#999',
            }}
          >
            {text}
          </span>
        )}
        <div
          style={{
            flex: 1,
            height,
            backgroundColor: color,
            borderStyle: dashed ? 'dashed' : 'solid',
          }}
        />
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div
        className={`${isSelected && !isPreview ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
        data-component-id={component.id}
        style={{
          border: !isPreview ? '1px dashed #cbd5e1' : 'none',
          margin: !isPreview ? '4px' : '0',
          padding: !isPreview ? '4px' : '0',
          backgroundColor: isPreview ? 'transparent' : '#fafafa',
          borderRadius: '4px',
        }}
      >
        {renderComponent()}
      </div>
    </ErrorBoundary>
  );
}
