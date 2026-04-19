import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  HistoryOutlined,
  LogoutOutlined,
  PlusOutlined,
  RedoOutlined,
  SaveOutlined,
  UndoOutlined,
  UploadOutlined,
  CopyOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '@/store/editorStore';
import type { Page, PageFlowRecord, PageListQuery, Template } from '@/services/api';

const { Title, Text } = Typography;
const PAGE_STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
] as const;

const PAGE_SORT_OPTIONS = [
  { label: '更新时间（新到旧）', value: 'updated_desc' },
  { label: '更新时间（旧到新）', value: 'updated_asc' },
  { label: '创建时间（新到旧）', value: 'created_desc' },
  { label: '创建时间（旧到新）', value: 'created_asc' },
  { label: '名称（A-Z）', value: 'name_asc' },
  { label: '名称（Z-A）', value: 'name_desc' },
] as const;

type FilterStatus = (typeof PAGE_STATUS_OPTIONS)[number]['value'];
type PageSortType = (typeof PAGE_SORT_OPTIONS)[number]['value'];

type PendingAction =
  | { type: 'publish-current' }
  | { type: 'unpublish-current' }
  | { type: 'publish-list'; pageId: string }
  | { type: 'unpublish-list'; pageId: string }
  | null;

function toLocalTime(value: string): string {
  return new Date(value).toLocaleString();
}

function normalizeActionLabel(action: PageFlowRecord['action']): string {
  return action === 'published' ? '发布' : '下线';
}

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseSortType(sortType: PageSortType): Pick<PageListQuery, 'sortBy' | 'sortOrder'> {
  if (sortType === 'name_asc') return { sortBy: 'name', sortOrder: 'asc' };
  if (sortType === 'name_desc') return { sortBy: 'name', sortOrder: 'desc' };
  if (sortType === 'created_asc') return { sortBy: 'created_at', sortOrder: 'asc' };
  if (sortType === 'created_desc') return { sortBy: 'created_at', sortOrder: 'desc' };
  if (sortType === 'updated_asc') return { sortBy: 'updated_at', sortOrder: 'asc' };
  return { sortBy: 'updated_at', sortOrder: 'desc' };
}

export default function MobileHeader() {
  const navigate = useNavigate();
  const {
    currentPage,
    currentPageStatus,
    currentPageFlowHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    isLoading,
    isDirty,
    saveStatus,
    lastSavedAt,
    updatePageMeta,
    createNewPage,
    savePageToServer,
    publishPageToServer,
    unpublishPageToServer,
    updatePageStatusById,
    loadPagesFromServer,
    loadPageFromServer,
    deletePageFromServer,
    saveAsTemplate,
    loadTemplatesFromServer,
    createFromTemplate,
    deleteTemplateFromServer,
    clonePageToServer,
    clearError,
    error,
  } = useEditorStore();

  const [msgApi, contextHolder] = message.useMessage();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [pageCurrent, setPageCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [pageTotal, setPageTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [pageSortType, setPageSortType] = useState<PageSortType>('updated_desc');
  const [pageKeywordInput, setPageKeywordInput] = useState('');
  const [pageKeyword, setPageKeyword] = useState('');

  const [pageNameModalOpen, setPageNameModalOpen] = useState(false);
  const [newPageModalOpen, setNewPageModalOpen] = useState(false);

  const [flowDrawerOpen, setFlowDrawerOpen] = useState(false);
  const [flowDrawerTitle, setFlowDrawerTitle] = useState('页面流程历史');
  const [activeFlowHistory, setActiveFlowHistory] = useState<PageFlowRecord[]>([]);
  const [flowKeyword, setFlowKeyword] = useState('');

  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [publishFormTitle, setPublishFormTitle] = useState('发布确认');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const [form] = Form.useForm<{ name: string; description?: string }>();
  const [newPageForm] = Form.useForm<{ name: string }>();
  const [publishForm] = Form.useForm<{ publishNote?: string; publishOperator?: string }>();

  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateForm] = Form.useForm<{ name: string; description?: string }>();

  const showSuccessIfNoError = (text: string) => {
    const latestError = useEditorStore.getState().error;
    if (!latestError) {
      msgApi.success(text);
    }
  };

  const confirmIfDirty = async (title: string, content: string): Promise<boolean> => {
    if (!isDirty) return true;

    return new Promise((resolve) => {
      Modal.confirm({
        title,
        content,
        okText: '继续',
        cancelText: '取消',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };

  const openPublishModal = (action: Exclude<PendingAction, null>, title: string) => {
    setPendingAction(action);
    setPublishFormTitle(title);
    publishForm.resetFields();
    setPublishModalOpen(true);
  };

  const openFlowHistory = (title: string, records: PageFlowRecord[] = []) => {
    setFlowDrawerTitle(title);
    setActiveFlowHistory(records);
    setFlowKeyword('');
    setFlowDrawerOpen(true);
  };

  const buildPageQuery = (): PageListQuery => {
    const sortParams = parseSortType(pageSortType);
    return {
      page: pageCurrent,
      pageSize,
      status: filterStatus === 'all' ? undefined : filterStatus,
      keyword: pageKeyword || undefined,
      ...sortParams,
    };
  };

  const refreshPages = async () => {
    const result = await loadPagesFromServer(buildPageQuery());
    setPages(result.items);
    setPageTotal(result.total);
    if (result.page !== pageCurrent) {
      setPageCurrent(result.page);
    }
    if (result.pageSize !== pageSize) {
      setPageSize(result.pageSize);
    }
  };

  useEffect(() => {
    if (!drawerOpen) return;

    let cancelled = false;
    const fetchData = async () => {
      const result = await loadPagesFromServer(buildPageQuery());
      if (cancelled) return;

      setPages(result.items);
      setPageTotal(result.total);
      if (result.page !== pageCurrent) {
        setPageCurrent(result.page);
      }
      if (result.pageSize !== pageSize) {
        setPageSize(result.pageSize);
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [drawerOpen, pageCurrent, pageSize, filterStatus, pageSortType, pageKeyword]);

  const submitPublishAction = async () => {
    if (!pendingAction) {
      setPublishModalOpen(false);
      return;
    }

    const values = await publishForm.validateFields();
    const note = values.publishNote?.trim();
    const operator = values.publishOperator?.trim();

    if (pendingAction.type === 'publish-current') {
      await publishPageToServer(note, operator);
      showSuccessIfNoError('页面已发布');
      if (drawerOpen) await refreshPages();
    }

    if (pendingAction.type === 'unpublish-current') {
      await unpublishPageToServer(note, operator);
      showSuccessIfNoError('页面已下线并转为草稿');
      if (drawerOpen) await refreshPages();
    }

    if (pendingAction.type === 'publish-list') {
      await updatePageStatusById(pendingAction.pageId, 'published', note, operator);
      showSuccessIfNoError('页面已发布');
      await refreshPages();
    }

    if (pendingAction.type === 'unpublish-list') {
      await updatePageStatusById(pendingAction.pageId, 'draft', note, operator);
      showSuccessIfNoError('页面已下线并转为草稿');
      await refreshPages();
    }

    setPublishModalOpen(false);
    setPendingAction(null);
  };

  const openPageCenter = async () => {
    setPageCurrent(1);
    setDrawerOpen(true);
  };

  const handleSaveDraft = async () => {
    await savePageToServer();
    showSuccessIfNoError('草稿已保存');
  };

  const handlePublish = async () => {
    openPublishModal({ type: 'publish-current' }, '发布确认');
  };

  const handleUnpublish = async () => {
    openPublishModal({ type: 'unpublish-current' }, '下线确认');
  };

  const handleOpenPage = async (pageId: string) => {
    const shouldContinue = await confirmIfDirty(
      '当前页面有未保存修改',
      '切换页面将丢失当前未保存变更，是否继续？'
    );

    if (!shouldContinue) return;

    await loadPageFromServer(pageId);
    setDrawerOpen(false);
    msgApi.success('页面已打开');
    navigate(`/editor/${pageId}`);
  };

  const handleDeletePage = async (pageId: string) => {
    await deletePageFromServer(pageId);
    await refreshPages();
    msgApi.success('页面已删除');
  };

  const showRenameModal = () => {
    form.setFieldsValue({
      name: currentPage?.name || '',
      description: currentPage?.description,
    });
    setPageNameModalOpen(true);
  };

  const handleRename = async () => {
    const values = await form.validateFields();
    updatePageMeta({ name: values.name.trim(), description: values.description });
    setPageNameModalOpen(false);
    msgApi.success('页面信息已更新');
  };

  const showCreatePageModal = () => {
    newPageForm.setFieldsValue({ name: '新页面' });
    setNewPageModalOpen(true);
  };

  const handleCreatePage = async () => {
    const shouldContinue = await confirmIfDirty(
      '当前页面有未保存修改',
      '新建页面将丢失当前未保存变更，是否继续？'
    );

    if (!shouldContinue) return;

    const values = await newPageForm.validateFields();
    createNewPage(values.name.trim() || '新页面');
    setNewPageModalOpen(false);
    msgApi.success('已创建新页面');
    const page = useEditorStore.getState().currentPage;
    if (page) navigate(`/editor/${page.id}`);
  };

  const handlePreview = async () => {
    if (!currentPage) return;

    const isLocalOnlyPage = currentPage.id.startsWith('page_local_');
    if (isLocalOnlyPage || isDirty) {
      const shouldSaveFirst = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: '预览前需要先保存',
          content: '当前页面存在未保存内容，是否先保存为草稿再打开独立预览？',
          okText: '保存并预览',
          cancelText: '取消',
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });

      if (!shouldSaveFirst) return;

      await savePageToServer();
      const latest = useEditorStore.getState();
      if (latest.error || !latest.currentPage) return;

      window.open(`/preview/${latest.currentPage.id}`, '_blank', 'noopener,noreferrer');
      return;
    }

    window.open(`/preview/${currentPage.id}`, '_blank', 'noopener,noreferrer');
  };

  const refreshTemplates = async () => {
    const list = await loadTemplatesFromServer();
    setTemplates(list);
  };

  const handleOpenTemplateDrawer = async () => {
    setTemplateDrawerOpen(true);
    await refreshTemplates();
  };

  const handleSaveAsTemplate = async () => {
    const values = await templateForm.validateFields();
    await saveAsTemplate(values.name.trim(), values.description?.trim());
    showSuccessIfNoError('已保存为模板');
    setTemplateModalOpen(false);
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    const shouldContinue = await confirmIfDirty(
      '当前页面有未保存修改',
      '从模板创建将丢失当前未保存变更，是否继续？'
    );
    if (!shouldContinue) return;

    await createFromTemplate(templateId);
    setTemplateDrawerOpen(false);
    msgApi.success('已从模板创建新页面');
    const page = useEditorStore.getState().currentPage;
    if (page) navigate(`/editor/${page.id}`);
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplateFromServer(id);
    await refreshTemplates();
    msgApi.success('模板已删除');
  };

  const saveIndicatorText = useMemo(() => {
    if (saveStatus === 'saving') return '保存中';
    if (isDirty) return '未保存';
    if (lastSavedAt) return `已保存 ${lastSavedAt.toLocaleTimeString()}`;
    return '未保存';
  }, [isDirty, lastSavedAt, saveStatus]);

  const filteredFlowHistory = useMemo(() => {
    const keyword = flowKeyword.trim().toLowerCase();
    const normalized = [...activeFlowHistory].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (!keyword) {
      return normalized;
    }

    return normalized.filter((item) => {
      const actionText = normalizeActionLabel(item.action);
      const text = `${actionText} ${item.note || ''} ${item.operator || ''} ${toLocalTime(item.timestamp)}`;
      return text.toLowerCase().includes(keyword);
    });
  }, [activeFlowHistory, flowKeyword]);

  const handleExportFlowHistory = () => {
    if (filteredFlowHistory.length === 0) {
      msgApi.warning('当前没有可导出的流程记录');
      return;
    }

    const rows = [
      ['动作', '备注', '操作人', '时间'],
      ...filteredFlowHistory.map((item) => [
        normalizeActionLabel(item.action),
        item.note || '',
        item.operator || '',
        toLocalTime(item.timestamp),
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
      .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const filename = `${flowDrawerTitle.replace(/[\\/:*?"<>|]/g, '_')}_${Date.now()}.csv`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    msgApi.success('流程历史已导出');
  };

  const flowTableColumns = [
    {
      title: '动作',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: PageFlowRecord['action']) =>
        action === 'published' ? <Tag color="green">发布</Tag> : <Tag color="orange">下线</Tag>,
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      render: (note?: string) => note || '-',
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 120,
      render: (operator?: string) => operator || '-',
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 190,
      render: (value: string) => toLocalTime(value),
    },
  ];

  const columns = [
    {
      title: '页面名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: string, record: Page) => (
        <Space orientation="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Text type="secondary" className="text-xs">
            {record.description || '暂无描述'}
          </Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status?: string) => {
        const isPublished = status === 'published';
        return isPublished ? <Tag color="green">已发布</Tag> : <Tag color="default">草稿</Tag>;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 190,
      render: (value: string) => toLocalTime(value),
    },
    {
      title: '操作',
      key: 'actions',
      width: 380,
      render: (_: unknown, record: Page) => {
        const isPublished = record.status === 'published';
        return (
          <Space>
            <Button size="small" onClick={() => handleOpenPage(record.id)}>
              打开
            </Button>
            {isPublished ? (
              <Button
                size="small"
                icon={<LogoutOutlined />}
                onClick={() =>
                  openPublishModal({ type: 'unpublish-list', pageId: record.id }, '下线确认')
                }
              >
                下线
              </Button>
            ) : (
              <Button
                size="small"
                type="primary"
                icon={<UploadOutlined />}
                onClick={() =>
                  openPublishModal({ type: 'publish-list', pageId: record.id }, '发布确认')
                }
              >
                发布
              </Button>
            )}
            <Button
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => openFlowHistory(`${record.name} · 流程历史`, record.flowHistory ?? [])}
            >
              历史
            </Button>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={async () => {
                await clonePageToServer(record.id);
                msgApi.success('页面已复制');
                await refreshPages();
              }}
            >
              复制
            </Button>
            <Popconfirm
              title="删除页面"
              description="删除后不可恢复，确认删除吗？"
              okText="删除"
              cancelText="取消"
              onConfirm={() => handleDeletePage(record.id)}
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      {contextHolder}
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge status={currentPageStatus === 'published' ? 'success' : 'default'} />
            <div>
              <Title level={5} className="!mb-0">
                Cotton lowcode编辑器
              </Title>
              <Space size={8}>
                <Text strong>{currentPage?.name || '未命名页面'}</Text>
                <Tag color={currentPageStatus === 'published' ? 'green' : 'default'}>
                  {currentPageStatus === 'published' ? '已发布' : '草稿'}
                </Tag>
                <Text type="secondary">{saveIndicatorText}</Text>
              </Space>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tooltip title="撤销">
              <Button icon={<UndoOutlined />} onClick={undo} disabled={!canUndo} />
            </Tooltip>
            <Tooltip title="重做">
              <Button icon={<RedoOutlined />} onClick={redo} disabled={!canRedo} />
            </Tooltip>

            <Button icon={<FolderOpenOutlined />} onClick={openPageCenter} loading={isLoading}>
              页面列表
            </Button>
            <Button icon={<PlusOutlined />} onClick={showCreatePageModal}>
              新建页面
            </Button>
            <Button icon={<EditOutlined />} onClick={showRenameModal}>
              页面信息
            </Button>
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                templateForm.setFieldsValue({
                  name: currentPage?.name ? `${currentPage.name} 模板` : '新模板',
                });
                setTemplateModalOpen(true);
              }}
            >
              存为模板
            </Button>
            <Button icon={<AppstoreOutlined />} onClick={handleOpenTemplateDrawer}>
              模板库
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveDraft}
              loading={saveStatus === 'saving'}
            >
              保存草稿
            </Button>
            {currentPageStatus === 'published' ? (
              <Button icon={<LogoutOutlined />} onClick={handleUnpublish}>
                下线
              </Button>
            ) : (
              <Button type="primary" ghost icon={<CheckCircleOutlined />} onClick={handlePublish}>
                发布
              </Button>
            )}
            <Button
              icon={<HistoryOutlined />}
              onClick={() =>
                openFlowHistory(
                  `${currentPage?.name || '当前页面'} · 流程历史`,
                  currentPageFlowHistory
                )
              }
              disabled={currentPageFlowHistory.length === 0}
            >
              流程历史
            </Button>
            <Button icon={<EyeOutlined />} onClick={handlePreview}>
              预览
            </Button>
          </div>
        </div>
      </div>

      <Drawer
        title="页面列表"
        size={980}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Segmented
            value={filterStatus}
            options={PAGE_STATUS_OPTIONS as unknown as Array<{ label: string; value: string }>}
            onChange={(value) => {
              setFilterStatus(value as FilterStatus);
              setPageCurrent(1);
            }}
          />
        }
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input.Search
            allowClear
            placeholder="搜索页面名称、描述或 ID"
            value={pageKeywordInput}
            onChange={(event) => {
              const value = event.target.value;
              setPageKeywordInput(value);
              if (!value.trim()) {
                setPageKeyword('');
                setPageCurrent(1);
              }
            }}
            onSearch={(value) => {
              setPageKeyword(value.trim());
              setPageCurrent(1);
            }}
            className="!w-[360px]"
          />
          <Select
            value={pageSortType}
            options={PAGE_SORT_OPTIONS as unknown as Array<{ label: string; value: string }>}
            onChange={(value) => {
              setPageSortType(value as PageSortType);
              setPageCurrent(1);
            }}
            className="!w-[220px]"
          />
          <Text type="secondary">共 {pageTotal} 条</Text>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={pages}
          loading={isLoading}
          pagination={{
            current: pageCurrent,
            pageSize,
            total: pageTotal,
            showSizeChanger: true,
            onChange: (nextPage, nextPageSize) => {
              setPageCurrent(nextPage);
              setPageSize(nextPageSize);
            },
          }}
        />
      </Drawer>

      <Drawer
        title={flowDrawerTitle}
        size={760}
        open={flowDrawerOpen}
        onClose={() => setFlowDrawerOpen(false)}
        extra={
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportFlowHistory}
            disabled={filteredFlowHistory.length === 0}
          >
            导出 CSV
          </Button>
        }
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Input.Search
            allowClear
            placeholder="筛选备注、操作人、动作"
            value={flowKeyword}
            onChange={(event) => setFlowKeyword(event.target.value)}
            className="!w-[320px]"
          />
          <Text type="secondary">共 {filteredFlowHistory.length} 条</Text>
        </div>

        <Table
          rowKey={(record) => `${record.action}-${record.timestamp}`}
          columns={flowTableColumns}
          dataSource={filteredFlowHistory}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: '暂无流程记录' }}
        />
      </Drawer>

      <Modal
        title={publishFormTitle}
        open={publishModalOpen}
        onCancel={() => {
          setPublishModalOpen(false);
          setPendingAction(null);
        }}
        onOk={submitPublishAction}
        okText="确认"
        cancelText="取消"
      >
        <Form form={publishForm} layout="vertical">
          <Form.Item label="流程备注" name="publishNote">
            <Input.TextArea rows={3} maxLength={120} placeholder="例如：活动页上线，版本 v1.2" />
          </Form.Item>
          <Form.Item label="操作人" name="publishOperator">
            <Input maxLength={30} placeholder="例如：zhangsan" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="页面信息"
        open={pageNameModalOpen}
        onCancel={() => setPageNameModalOpen(false)}
        onOk={handleRename}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="页面名称"
            name="name"
            rules={[{ required: true, message: '请输入页面名称' }]}
          >
            <Input maxLength={40} placeholder="请输入页面名称" />
          </Form.Item>
          <Form.Item label="页面描述" name="description">
            <Input.TextArea rows={3} maxLength={120} placeholder="描述页面用途（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="新建页面"
        open={newPageModalOpen}
        onCancel={() => setNewPageModalOpen(false)}
        onOk={handleCreatePage}
        okText="创建"
        cancelText="取消"
      >
        <Form form={newPageForm} layout="vertical">
          <Form.Item
            label="页面名称"
            name="name"
            rules={[{ required: true, message: '请输入页面名称' }]}
          >
            <Input maxLength={40} placeholder="例如：首页活动页" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="存为模板"
        open={templateModalOpen}
        onCancel={() => setTemplateModalOpen(false)}
        onOk={handleSaveAsTemplate}
        okText="保存"
        cancelText="取消"
      >
        <Form form={templateForm} layout="vertical">
          <Form.Item
            label="模板名称"
            name="name"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input maxLength={40} placeholder="请输入模板名称" />
          </Form.Item>
          <Form.Item label="模板描述" name="description">
            <Input.TextArea rows={3} maxLength={120} placeholder="描述模板用途（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="模板库"
        size={720}
        open={templateDrawerOpen}
        onClose={() => setTemplateDrawerOpen(false)}
      >
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={templates}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: '暂无模板' }}
          columns={[
            {
              title: '模板名称',
              dataIndex: 'name',
              key: 'name',
              render: (_: string, record: Template) => (
                <Space orientation="vertical" size={0}>
                  <Text strong>{record.name}</Text>
                  <Text type="secondary" className="text-xs">
                    {record.description || '暂无描述'}
                  </Text>
                </Space>
              ),
            },
            {
              title: '分类',
              dataIndex: 'category',
              key: 'category',
              width: 120,
              render: (v?: string) => v || '-',
            },
            {
              title: '更新时间',
              dataIndex: 'updated_at',
              key: 'updated_at',
              width: 190,
              render: (value: string) => toLocalTime(value),
            },
            {
              title: '操作',
              key: 'actions',
              width: 200,
              render: (_: unknown, record: Template) => (
                <Space>
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => handleCreateFromTemplate(record.id)}
                  >
                    创建页面
                  </Button>
                  <Popconfirm
                    title="删除模板"
                    description="删除后不可恢复，确认删除吗？"
                    okText="删除"
                    cancelText="取消"
                    onConfirm={() => handleDeleteTemplate(record.id)}
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Drawer>

      {error && (
        <div className="fixed bottom-6 right-6 z-50 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 shadow">
          <Space>
            <span>{error}</span>
            <Button type="link" size="small" onClick={clearError}>
              关闭
            </Button>
          </Space>
        </div>
      )}
    </>
  );
}
