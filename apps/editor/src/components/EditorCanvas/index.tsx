import { useEditorStore } from '@/store/editorStore';
import BusinessComponentRender from './BusinessComponentRender';
import DraggableComponent from './DraggableComponent';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState, useMemo } from 'react';

import { BUSINESS_COMPONENTS } from '@/constants';

interface EditorCanvasProps {
  deviceType: string;
  canvasSize: {
    width: number;
    height: number;
  };
  isPreview: boolean;
}

export default function EditorCanvas({
  deviceType,
  canvasSize,
  isPreview,
}: EditorCanvasProps) {
  const {
    currentPage,
    selectedComponentId,
    selectComponent,
    addComponent,
    draggingComponent,
    reorderComponents,
    activeId,
    setActiveId,
  } = useEditorStore();
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  const activeComponent = useMemo(() => {
    if (!activeId || !currentPage) return null;
    return currentPage.components.find((c) => c.id === activeId) ?? null;
  }, [activeId, currentPage]);

  const activeComponentName = useMemo(() => {
    if (!activeComponent) return '';
    const meta = BUSINESS_COMPONENTS.find((b) => b.type === activeComponent.type);
    return meta?.displayName ?? activeComponent.type;
  }, [activeComponent]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 移动后才开始拖拽，避免误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = (e: React.DragEvent) => {
    if (isPreview) return; // 预览模式不支持拖拽
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isPreview) return;
    e.preventDefault();
    if (draggingComponent) {
      addComponent(draggingComponent);
      setDragPosition(null);
    }
  };

  const handleDropToContainer = (parentId: string, _e: React.DragEvent) => {
    if (isPreview) return;
    if (draggingComponent) {
      addComponent(draggingComponent, parentId);
    }
  };

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      reorderComponents(active.id as string, over.id as string);
    }

    setActiveId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isPreview) return;
    if (e.target === e.currentTarget) {
      selectComponent(null);
    }
  };

  const handleComponentClick = (e: React.MouseEvent, id: string) => {
    if (isPreview) return;
    e.stopPropagation();
    selectComponent(id);
  };

  const deviceStyle = useMemo(() => {
    const baseStyle = {
      width: canvasSize.width,
      minHeight: canvasSize.height,
    };

    if (deviceType === 'IPHONE') {
      return {
        ...baseStyle,
        borderRadius: '40px',
        border: '12px solid #1a1a1a',
        boxShadow: '0 0 0 2px #333, 0 20px 40px rgba(0,0,0,0.3)',
      };
    }

    if (deviceType === 'ANDROID') {
      return {
        ...baseStyle,
        borderRadius: '20px',
        border: '8px solid #1a1a1a',
        boxShadow: '0 0 0 1px #333, 0 15px 35px rgba(0,0,0,0.25)',
      };
    }

    return baseStyle;
  }, [deviceType, canvasSize]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`min-h-full p-8 flex items-start justify-center ${isPreview ? 'bg-gray-50' : 'bg-gray-100'}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
      >
        {/* 移动设备框架 */}
        <div
          className="mx-auto bg-white overflow-hidden relative"
          style={deviceStyle}
        >
          {/* 状态栏 (仅 iPhone) */}
          {deviceType === 'IPHONE' && (
            <div className="h-6 bg-black flex items-center justify-between px-6 text-white text-xs">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              </div>
            </div>
          )}

          {/* 画布内容区域 */}
          <div className="overflow-y-auto" style={{ height: canvasSize.height - 24 }}>
            {currentPage?.components.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="text-sm">拖拽组件到此处开始创建</p>
                </div>
              </div>
            ) : (
              <SortableContext
                items={currentPage?.components.map((c) => c.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <div className="min-h-full">
                  {currentPage?.components.map((comp) => (
                    <DraggableComponent
                      key={comp.id}
                      id={comp.id}
                      component={comp}
                      isSelected={comp.id === selectedComponentId}
                      onClick={handleComponentClick}
                      isPreview={isPreview}
                    >
                      <BusinessComponentRender
                        component={comp}
                        isSelected={comp.id === selectedComponentId}
                        onClick={handleComponentClick}
                        isPreview={isPreview}
                        onDropToContainer={handleDropToContainer}
                      />
                    </DraggableComponent>
                  ))}
                </div>
              </SortableContext>
            )}
          </div>

          {/* 底部导航栏占位 (仅 iPhone) */}
          {deviceType === 'IPHONE' && (
            <div className="h-6 bg-black flex items-center justify-center">
              <div className="w-32 h-1 bg-white rounded-full" />
            </div>
          )}
        </div>

        {/* 拖拽预览 (仅编辑模式) */}
        {!isPreview && dragPosition && draggingComponent && (
          <div
            className="fixed pointer-events-none bg-blue-500 text-white rounded-full px-3 py-1 text-sm shadow-lg"
            style={{ left: dragPosition.x + 200, top: dragPosition.y + 100 }}
          >
            {draggingComponent.type}
          </div>
        )}
      </div>

      <DragOverlay>
        {activeComponent ? (
          <div className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm shadow-lg opacity-80">
            {activeComponentName}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
