import { useState } from 'react';
import BusinessComponentPanel from '@/components/BusinessComponentPanel';
import EditorCanvas from '@/components/EditorCanvas';
import PropsPanel from '@/components/PropsPanel';
import Header from '@/components/MobileHeader';
import { DEVICE_TYPES, MOBILE_CANVAS_CONFIG } from '@/constants';

export default function MobileEditorLayout() {
  const [deviceType, setDeviceType] = useState<keyof typeof DEVICE_TYPES>('IPHONE');
  const [showPreview, setShowPreview] = useState(true);

  const getCanvasSize = () => {
    switch (deviceType) {
      case 'IPHONE':
        return {
          width: MOBILE_CANVAS_CONFIG.DEFAULT_WIDTH,
          height: MOBILE_CANVAS_CONFIG.DEFAULT_HEIGHT,
        };
      case 'ANDROID':
        return {
          width: MOBILE_CANVAS_CONFIG.DEFAULT_WIDTH_ANDROID,
          height: MOBILE_CANVAS_CONFIG.DEFAULT_HEIGHT_ANDROID,
        };
      case 'IPAD':
        return {
          width: MOBILE_CANVAS_CONFIG.DEFAULT_WIDTH_TABLET,
          height: MOBILE_CANVAS_CONFIG.DEFAULT_HEIGHT_TABLET,
        };
      default:
        return {
          width: MOBILE_CANVAS_CONFIG.DEFAULT_WIDTH,
          height: MOBILE_CANVAS_CONFIG.DEFAULT_HEIGHT,
        };
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />

      {/* 设备切换栏 */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">设备类型:</span>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={DEVICE_TYPES.IPHONE}>iPhone</option>
            <option value={DEVICE_TYPES.ANDROID}>Android</option>
            <option value={DEVICE_TYPES.IPAD}>iPad</option>
            <option value={DEVICE_TYPES.CUSTOM}>自定义</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            尺寸: {getCanvasSize().width} × {getCanvasSize().height}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            {showPreview ? '隐藏预览' : '显示预览'}
          </button>
        </div>
      </div>

      {/* 主编辑区域 - 左右分栏 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧面板 - 组件库 + 属性配置 */}
        <div className="w-80 flex flex-col bg-white border-r border-gray-200">
          {/* 组件面板 */}
          <div className="flex-1 overflow-hidden border-b border-gray-200">
            <BusinessComponentPanel />
          </div>

          {/* 属性面板 */}
          <div className="h-1/2 overflow-hidden">
            <PropsPanel />
          </div>
        </div>

        {/* 中间编辑区域 - 画布 */}
        <div className="flex-1 flex">
          {/* 编辑器画布 */}
          <div className={`flex-1 bg-gray-100 overflow-auto ${showPreview ? 'border-r border-gray-200' : ''}`}>
            <EditorCanvas
              deviceType={deviceType}
              canvasSize={getCanvasSize()}
              isPreview={false}
            />
          </div>

          {/* 右侧预览区域 - 实时渲染 */}
          {showPreview && (
            <div className="flex-1 bg-gray-50 overflow-auto">
              <div className="sticky top-0 bg-gray-200 px-4 py-2 border-b border-gray-300">
                <h3 className="text-sm font-semibold text-gray-700 text-center">
                  实时预览
                </h3>
              </div>
              <EditorCanvas
                deviceType={deviceType}
                canvasSize={getCanvasSize()}
                isPreview={true}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
