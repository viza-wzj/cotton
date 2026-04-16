import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { generateComponentId } from '@/constants';
import { BUSINESS_GROUPS, BUSINESS_CATEGORIES } from '@/constants/business-components';

export default function BusinessComponentPanel() {
  const { addComponent, setDraggingComponent } = useEditorStore();
  const [activeTab, setActiveTab] = useState<string>(BUSINESS_CATEGORIES.LAYOUT);

  const handleDragStart = (component: typeof BUSINESS_GROUPS[number]['components'][number]) => {
    setDraggingComponent({
      id: generateComponentId(component.type),
      type: component.type,
      props: component.defaultProps,
      children: component.acceptChildren ? [] : undefined,
    } as any);
  };

  const handleDragEnd = () => {
    setDraggingComponent(null);
  };

  const handleClick = (component: typeof BUSINESS_GROUPS[number]['components'][number]) => {
    addComponent({
      id: generateComponentId(component.type),
      type: component.type,
      props: component.defaultProps,
      children: component.acceptChildren ? [] : undefined,
    } as any);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
          </svg>
          业务组件库
        </h2>
      </div>

      {/* Tab 切换 */}
      <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
        {BUSINESS_GROUPS.map((group) => (
          <button
            key={group.id}
            onClick={() => setActiveTab(group.id)}
            className={`flex-1 min-w-max px-3 py-2 text-xs font-medium border-b-2 transition ${
              activeTab === group.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <span className="mr-1">{group.icon}</span>
            {group.name}
          </button>
        ))}
      </div>

      {/* 组件列表 */}
      <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
        {BUSINESS_GROUPS.map(
          (group) =>
            group.id === activeTab && (
              <div key={group.id} className="space-y-3">
                {group.components.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    暂无组件
                  </div>
                ) : (
                  group.components.map((comp) => (
                    <div
                      key={comp.type}
                      draggable
                      onDragStart={() => handleDragStart(comp)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleClick(comp)}
                      className="group p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-blue-400 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {/* 组件图标 */}
                        <div
                          className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-purple-50"
                          style={{
                            fontSize: 20,
                          }}
                        >
                          {comp.icon}
                        </div>

                        {/* 组件信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">
                            {comp.displayName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {comp.type}
                          </div>
                          {comp.description && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              {comp.description}
                            </div>
                          )}
                        </div>

                        {/* 添加图标 */}
                        <svg
                          className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
        )}
      </div>

      {/* 使用提示 */}
      <div className="p-3 border-t border-gray-200 bg-white text-xs text-gray-500">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-medium text-gray-700 mb-1">业务组件说明</p>
            <p>• 按业务场景分组，更符合开发习惯</p>
            <p>• 拖拽或点击组件添加到画布</p>
            <p>• 右侧预览实时更新</p>
          </div>
        </div>
      </div>
    </div>
  );
}
