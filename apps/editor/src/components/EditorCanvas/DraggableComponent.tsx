import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComponentSchema } from '@/types/schema';

interface DraggableComponentProps {
  id: string;
  component: ComponentSchema;
  isSelected: boolean;
  onClick: (e: React.MouseEvent, id: string) => void;
  isPreview: boolean;
  children: React.ReactNode;
}

export default function DraggableComponent({
  id,
  component,
  isSelected,
  onClick,
  isPreview,
  children,
}: DraggableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    disabled: isPreview,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isSelected && !isPreview && !isDragging ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
    >
      {/* 组件内容 - 可拖拽 */}
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => !isDragging && onClick(e, component.id)}
        data-component-id={component.id}
        className={`${!isPreview ? 'cursor-move' : ''}`}
      >
        {children}
      </div>

      {/* 选中状态标签 */}
      {isSelected && !isPreview && !isDragging && (
        <div className="absolute -top-6 left-0 px-2 py-1 bg-blue-500 text-white text-xs rounded z-10 shadow-md pointer-events-none">
          {component.type}
        </div>
      )}
    </div>
  );
}
