import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Card,
  Empty,
  Segmented,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd';
import BusinessComponentRender from '@/components/EditorCanvas/BusinessComponentRender';
import { DEVICE_TYPES, MOBILE_CANVAS_CONFIG } from '@/constants';
import { apiService, PageStatus } from '@/services/api';
import type { PageSchema } from '@/types/schema';

const { Title, Text } = Typography;

type DeviceType = (typeof DEVICE_TYPES)[keyof typeof DEVICE_TYPES];

const DEVICE_OPTIONS: Array<{ label: string; value: DeviceType }> = [
  { label: 'iPhone', value: DEVICE_TYPES.IPHONE },
  { label: 'Android', value: DEVICE_TYPES.ANDROID },
  { label: 'iPad', value: DEVICE_TYPES.IPAD },
];

const createFallbackPage = (): PageSchema => ({
  id: 'preview_fallback',
  name: '预览页',
  schemaVersion: '1.0.0',
  version: '1.0.0',
  components: [],
  globalConfig: {
    theme: {
      primaryColor: '#1890ff',
    },
  },
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
});

const getCanvasSize = (deviceType: DeviceType): { width: number; height: number } => {
  switch (deviceType) {
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
    case DEVICE_TYPES.IPHONE:
    default:
      return {
        width: MOBILE_CANVAS_CONFIG.DEFAULT_WIDTH,
        height: MOBILE_CANVAS_CONFIG.DEFAULT_HEIGHT,
      };
  }
};

const getShellStyle = (
  deviceType: DeviceType,
  canvasSize: { width: number; height: number }
): CSSProperties => {
  const baseStyle: CSSProperties = {
    width: canvasSize.width,
    minHeight: canvasSize.height,
    backgroundColor: '#fff',
    overflow: 'hidden',
    position: 'relative',
  };

  if (deviceType === DEVICE_TYPES.IPHONE) {
    return {
      ...baseStyle,
      borderRadius: '40px',
      border: '12px solid #1a1a1a',
      boxShadow: '0 0 0 2px #333, 0 20px 40px rgba(0,0,0,0.3)',
    };
  }

  if (deviceType === DEVICE_TYPES.ANDROID) {
    return {
      ...baseStyle,
      borderRadius: '20px',
      border: '8px solid #1a1a1a',
      boxShadow: '0 0 0 1px #333, 0 15px 35px rgba(0,0,0,0.25)',
    };
  }

  return {
    ...baseStyle,
    borderRadius: '18px',
    border: '2px solid #cbd5e1',
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
  };
};

const normalizePreviewSchema = (
  rawContent: unknown,
  pageId: string,
  pageName: string,
  pageDescription?: string
): PageSchema => {
  const fallback = createFallbackPage();
  if (!rawContent || typeof rawContent !== 'object' || Array.isArray(rawContent)) {
    return {
      ...fallback,
      id: pageId,
      name: pageName,
      description: pageDescription,
    };
  }

  const raw = rawContent as Record<string, unknown>;
  const metadataRaw =
    raw.metadata && typeof raw.metadata === 'object' && !Array.isArray(raw.metadata)
      ? (raw.metadata as Record<string, unknown>)
      : {};

  const createdAt = metadataRaw.createdAt
    ? new Date(metadataRaw.createdAt as string | number | Date)
    : new Date();
  const updatedAt = metadataRaw.updatedAt
    ? new Date(metadataRaw.updatedAt as string | number | Date)
    : new Date();

  return {
    id: pageId,
    name: pageName,
    description: pageDescription,
    schemaVersion: typeof raw.schemaVersion === 'string' ? raw.schemaVersion : '1.0.0',
    version: typeof raw.version === 'string' ? raw.version : '1.0.0',
    components: Array.isArray(raw.components) ? (raw.components as PageSchema['components']) : [],
    globalConfig:
      raw.globalConfig && typeof raw.globalConfig === 'object' && !Array.isArray(raw.globalConfig)
        ? (raw.globalConfig as PageSchema['globalConfig'])
        : fallback.globalConfig,
    metadata: {
      createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
      updatedAt: Number.isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
      createdBy:
        typeof metadataRaw.createdBy === 'string' ? metadataRaw.createdBy : 'system',
      ...(typeof metadataRaw.updatedBy === 'string'
        ? { updatedBy: metadataRaw.updatedBy }
        : {}),
      ...(Array.isArray(metadataRaw.tags) ? { tags: metadataRaw.tags as string[] } : {}),
    },
  };
};

export default function PreviewPage() {
  const { pageId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageName, setPageName] = useState('实时预览');
  const [pageStatus, setPageStatus] = useState<PageStatus>('draft');
  const [schema, setSchema] = useState<PageSchema>(createFallbackPage());
  const [deviceType, setDeviceType] = useState<DeviceType>(DEVICE_TYPES.IPHONE);

  const canvasSize = useMemo(() => getCanvasSize(deviceType), [deviceType]);

  const topChromeHeight = deviceType === DEVICE_TYPES.IPAD ? 0 : 24;
  const bottomChromeHeight = deviceType === DEVICE_TYPES.IPHONE ? 24 : 0;
  const contentHeight = canvasSize.height - topChromeHeight - bottomChromeHeight;

  useEffect(() => {
    let mounted = true;

    const loadPage = async () => {
      if (!pageId) {
        setError('缺少页面 ID，无法预览。');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const res = await apiService.getPage(pageId);
        if (!mounted) return;

        const nextSchema = normalizePreviewSchema(
          res.data.content,
          res.data.id,
          res.data.name,
          res.data.description
        );

        setSchema(nextSchema);
        setPageName(res.data.name || '实时预览');
        setPageStatus(res.data.status === 'published' ? 'published' : 'draft');
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : '加载预览页面失败');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPage();

    return () => {
      mounted = false;
    };
  }, [pageId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <Card>
        <Space direction="vertical" size={10} className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Space>
              <Title level={4} className="!mb-0">
                {pageName}
              </Title>
              <Tag color="blue">独立预览</Tag>
              <Tag color={pageStatus === 'published' ? 'green' : 'default'}>
                {pageStatus === 'published' ? '已发布' : '草稿'}
              </Tag>
            </Space>
            <Segmented
              options={DEVICE_OPTIONS}
              value={deviceType}
              onChange={(value) => setDeviceType(value as DeviceType)}
            />
          </div>
          <Text type="secondary">当前为只读预览模式，不可编辑组件。</Text>
        </Space>
      </Card>

      {error && (
        <Alert
          className="mt-4"
          type="error"
          showIcon
          message="预览加载失败"
          description={error}
        />
      )}

      {!error && schema.components.length === 0 && (
        <Card className="mt-4">
          <Empty description="当前页面无可渲染组件" />
        </Card>
      )}

      {!error && schema.components.length > 0 && (
        <Card className="mt-4" styles={{ body: { padding: 0 } }}>
          <div className="min-h-full p-8 flex items-start justify-center bg-slate-100">
            <div className="mx-auto" style={getShellStyle(deviceType, canvasSize)}>
              {topChromeHeight > 0 && (
                <div className="h-6 bg-black flex items-center justify-between px-6 text-white text-xs">
                  <span>9:41</span>
                  <div className="flex items-center gap-1">
                    <span>{deviceType === DEVICE_TYPES.ANDROID ? '4G' : '5G'}</span>
                    <span>100%</span>
                  </div>
                </div>
              )}

              <div className="overflow-y-auto" style={{ height: contentHeight }}>
                {schema.components.map((comp) => (
                  <BusinessComponentRender
                    key={comp.id}
                    component={comp}
                    isSelected={false}
                    isPreview={true}
                    onClick={() => {
                      // preview mode noop
                    }}
                  />
                ))}
              </div>

              {bottomChromeHeight > 0 && (
                <div className="h-6 bg-black flex items-center justify-center">
                  <div className="w-32 h-1 bg-white rounded-full" />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
