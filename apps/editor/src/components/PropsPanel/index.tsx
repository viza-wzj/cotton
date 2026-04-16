import { useEditorStore } from '@/store/editorStore';
import { ComponentSchema } from '@/types/schema';

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

  const handlePropChange = (propName: string, value: any) => {
    if (selectedComponentId) {
      updateComponent(selectedComponentId, {
        props: {
          ...selectedComponent?.props,
          [propName]: value,
        },
      });
    }
  };

  const handleStyleChange = (styleName: string, value: any) => {
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

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">属性配置</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* 基本信息 */}
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">基本信息</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">组件类型</label>
              <input
                type="text"
                value={selectedComponent.type}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">组件 ID</label>
              <input
                type="text"
                value={selectedComponent.id}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* 属性配置 */}
        <div className="mb-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">组件属性</h3>
          <div className="space-y-3">
            {Object.entries(selectedComponent.props || {}).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                <input
                  type={typeof value === 'number' ? 'number' : 'text'}
                  value={value as string | number}
                  onChange={(e) => handlePropChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 样式配置 */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">样式配置</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">宽度</label>
              <input
                type="text"
                value={selectedComponent.styles?.width || ''}
                onChange={(e) => handleStyleChange('width', e.target.value)}
                placeholder="auto"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">高度</label>
              <input
                type="text"
                value={selectedComponent.styles?.height || ''}
                onChange={(e) => handleStyleChange('height', e.target.value)}
                placeholder="auto"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">内边距</label>
              <input
                type="text"
                value={selectedComponent.styles?.padding || ''}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">外边距</label>
              <input
                type="text"
                value={selectedComponent.styles?.margin || ''}
                onChange={(e) => handleStyleChange('margin', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">背景色</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedComponent.styles?.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={selectedComponent.styles?.backgroundColor || ''}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
