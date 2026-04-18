import { useMemo, useState } from 'react';
import { Card, Segmented, Space, Switch, Tag, Typography } from 'antd';
import BusinessComponentPanel from '@/components/BusinessComponentPanel';
import EditorCanvas from '@/components/EditorCanvas';
import PropsPanel from '@/components/PropsPanel';
import Header from '@/components/MobileHeader';
import { DEVICE_TYPES, MOBILE_CANVAS_CONFIG } from '@/constants';

const { Text } = Typography;

type DeviceType = (typeof DEVICE_TYPES)[keyof typeof DEVICE_TYPES];

function isDeviceType(value: string): value is DeviceType {
  return Object.values(DEVICE_TYPES).includes(value as DeviceType);
}

const deviceOptions = [
  { label: 'iPhone', value: DEVICE_TYPES.IPHONE },
  { label: 'Android', value: DEVICE_TYPES.ANDROID },
  { label: 'iPad', value: DEVICE_TYPES.IPAD },
];

export default function MobileEditorLayout() {
  const [deviceType, setDeviceType] = useState<DeviceType>(DEVICE_TYPES.IPHONE);
  const [showPreview, setShowPreview] = useState(true);

  const canvasSize = useMemo(() => {
    switch (deviceType) {
      case DEVICE_TYPES.IPHONE:
        return {
          width: MOBILE_CANVAS_CONFIG.DEFAULT_WIDTH,
          height: MOBILE_CANVAS_CONFIG.DEFAULT_HEIGHT,
        };
      case DEVICE_TYPES.ANDROID:
        return {
          width: MOBILE_CANVAS_CONFIG.DEFAULT_WIDTH_ANDROID,
          height: MOBILE_CANVAS_CONFIG.DEFAULT_HEIGHT_ANDROID,
        };
      case DEVICE_TYPES.IPAD:
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
  }, [deviceType]);

  return (
    <div className="h-screen bg-slate-100 text-slate-900">
      <Header />

      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Space size={12}>
            <Text type="secondary">设备</Text>
            <Segmented
              options={deviceOptions}
              value={deviceType}
              onChange={(value) => {
                const nextValue = String(value);
                if (isDeviceType(nextValue)) {
                  setDeviceType(nextValue);
                }
              }}
            />
            <Tag color="blue">
              {canvasSize.width} x {canvasSize.height}
            </Tag>
          </Space>

          <Space>
            <Text type="secondary">实时预览</Text>
            <Switch checked={showPreview} onChange={setShowPreview} />
          </Space>
        </div>
      </div>

      <div className="flex h-[calc(100vh-122px)] gap-3 p-3">
        <Card
          className="w-[320px] shrink-0 overflow-hidden"
          styles={{ body: { padding: 0, height: '100%' } }}
        >
          <div className="flex h-full flex-col">
            <div className="min-h-0 flex-1 border-b border-slate-200">
              <BusinessComponentPanel />
            </div>
            <div className="min-h-0 h-1/2">
              <PropsPanel />
            </div>
          </div>
        </Card>

        <Card
          className="min-w-0 flex-1 overflow-hidden"
          styles={{ body: { padding: 0, height: '100%' } }}
          title="编辑区"
        >
          <div className="h-full overflow-auto bg-slate-100">
            <EditorCanvas
              deviceType={deviceType}
              canvasSize={canvasSize}
              isPreview={false}
            />
          </div>
        </Card>

        {showPreview && (
          <Card
            className="min-w-0 flex-1 overflow-hidden"
            styles={{ body: { padding: 0, height: '100%' } }}
            title="预览区"
          >
            <div className="h-full overflow-auto bg-slate-50">
              <EditorCanvas
                deviceType={deviceType}
                canvasSize={canvasSize}
                isPreview={true}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
