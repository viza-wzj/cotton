import { useMemo } from 'react';
import { Input, InputNumber, Slider, Switch, Select, ColorPicker } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { useEditorStore } from '@/store/editorStore';
import { BUSINESS_COMPONENTS } from '@/constants';
import type { PropConfig } from '@/constants/business-components';
import type { ComponentSchema } from '@/types/schema';

export default function PropsPanel() {
  const { currentPage, selectedComponentId, updateComponent } = useEditorStore();

  const findComponent = (
    components: ComponentSchema[],
    id: string
  ): ComponentSchema | null => {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = findComponent(comp.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedComponent = selectedComponentId
    ? findComponent(currentPage?.components || [], selectedComponentId)
    : null;

  const componentMeta = useMemo(() => {
    if (!selectedComponent) return null;
    return BUSINESS_COMPONENTS.find((b) => b.type === selectedComponent.type) ?? null;
  }, [selectedComponent]);

  const groupedConfig = useMemo(() => {
    if (!componentMeta?.configSchema) return null;
    const groups = new Map<string, PropConfig[]>();
    for (const config of componentMeta.configSchema) {
      const group = config.group || '属性配置';
      const list = groups.get(group) ?? [];
      list.push(config);
      groups.set(group, list);
    }
    return groups;
  }, [componentMeta]);

  const handlePropChange = (propName: string, value: unknown) => {
    if (selectedComponentId) {
      updateComponent(selectedComponentId, {
        props: {
          ...selectedComponent?.props,
          [propName]: value,
        },
      });
    }
  };

  const handleStyleChange = (styleName: string, value: string | number) => {
    if (selectedComponentId) {
      updateComponent(selectedComponentId, {
        styles: {
          ...selectedComponent?.styles,
          [styleName]: value,
        },
      });
    }
  };

  if (!selectedComponent) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">选择组件以编辑属性</p>
        </div>
      </div>
    );
  }

  const renderControl = (config: PropConfig) => {
    const value = selectedComponent.props?.[config.name as keyof typeof selectedComponent.props];

    switch (config.type) {
      case 'input':
      case 'string':
        return (
          <Input
            size="small"
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => handlePropChange(config.name, e.target.value)}
          />
        );

      case 'number':
        return (
          <InputNumber
            size="small"
            className="w-full"
            value={typeof value === 'number' ? value : undefined}
            min={config.min}
            max={config.max}
            step={config.step}
            onChange={(v) => handlePropChange(config.name, v ?? 0)}
          />
        );

      case 'slider':
        return (
          <div className="flex items-center gap-2">
            <Slider
              className="flex-1"
              value={typeof value === 'number' ? value : config.min ?? 0}
              min={config.min ?? 0}
              max={config.max ?? 100}
              step={config.step ?? 1}
              onChange={(v) => handlePropChange(config.name, v)}
            />
            <span className="text-xs text-gray-500 w-8 text-right">
              {typeof value === 'number' ? value : config.min ?? 0}
            </span>
          </div>
        );

      case 'boolean':
        return (
          <Switch
            size="small"
            checked={!!value}
            onChange={(v) => handlePropChange(config.name, v)}
          />
        );

      case 'color':
        return (
          <div className="flex items-center gap-2">
            <ColorPicker
              size="small"
              value={typeof value === 'string' ? value : '#ffffff'}
              onChange={(_: Color, hex: string) => handlePropChange(config.name, hex)}
            />
            <span className="text-xs text-gray-500">{typeof value === 'string' ? value : ''}</span>
          </div>
        );

      case 'select':
        return (
          <Select
            size="small"
            className="w-full"
            value={value as string}
            onChange={(v) => handlePropChange(config.name, v)}
            options={config.options?.map((opt) => ({
              label: opt.label,
              value: opt.value as string,
            }))}
          />
        );

      case 'image':
        return (
          <Input
            size="small"
            value={typeof value === 'string' ? value : ''}
            placeholder="输入图片 URL"
            onChange={(e) => handlePropChange(config.name, e.target.value)}
          />
        );

      default:
        return (
          <Input
            size="small"
            value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
            onChange={(e) => handlePropChange(config.name, e.target.value)}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">属性配置</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* 基本信息 */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">基本信息</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">组件类型</label>
              <Input size="small" value={componentMeta?.displayName ?? selectedComponent.type} disabled />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">组件 ID</label>
              <Input size="small" value={selectedComponent.id} disabled />
            </div>
          </div>
        </div>

        {/* configSchema 属性配置 */}
        {groupedConfig ? (
          Array.from(groupedConfig.entries()).map(([group, configs]) => (
            <div key={group} className="mb-4">
              <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">{group}</h3>
              <div className="space-y-3">
                {configs.map((config) => (
                  <div key={config.name}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-gray-600">{config.label}</label>
                      {config.type === 'boolean' && renderControl(config)}
                    </div>
                    {config.description && (
                      <p className="text-xs text-gray-400 mb-1">{config.description}</p>
                    )}
                    {config.type !== 'boolean' && renderControl(config)}
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="mb-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">组件属性</h3>
            <div className="space-y-2">
              {Object.entries(selectedComponent.props || {}).map(([key, value]) => {
                if (typeof value === 'object') return null;
                return (
                  <div key={key}>
                    <label className="block text-xs text-gray-500 mb-1">{key}</label>
                    {typeof value === 'boolean' ? (
                      <Switch
                        size="small"
                        checked={value}
                        onChange={(v) => handlePropChange(key, v)}
                      />
                    ) : (
                      <Input
                        size="small"
                        type={typeof value === 'number' ? 'number' : 'text'}
                        value={typeof value === 'number' ? value : typeof value === 'string' ? value : ''}
                        onChange={(e) =>
                          handlePropChange(
                            key,
                            typeof value === 'number' ? Number(e.target.value) : e.target.value
                          )
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 样式配置 */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">通用样式</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">宽度</label>
              <Input
                size="small"
                value={(selectedComponent.styles?.width as string) || ''}
                onChange={(e) => handleStyleChange('width', e.target.value)}
                placeholder="auto"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">高度</label>
              <Input
                size="small"
                value={(selectedComponent.styles?.height as string) || ''}
                onChange={(e) => handleStyleChange('height', e.target.value)}
                placeholder="auto"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">内边距</label>
              <Input
                size="small"
                value={(selectedComponent.styles?.padding as string) || ''}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">外边距</label>
              <Input
                size="small"
                value={(selectedComponent.styles?.margin as string) || ''}
                onChange={(e) => handleStyleChange('margin', e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">背景色</label>
              <div className="flex items-center gap-2">
                <ColorPicker
                  size="small"
                  value={(selectedComponent.styles?.backgroundColor as string) || '#ffffff'}
                  onChange={(_: Color, hex: string) => handleStyleChange('backgroundColor', hex)}
                />
                <span className="text-xs text-gray-500">
                  {(selectedComponent.styles?.backgroundColor as string) || ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
