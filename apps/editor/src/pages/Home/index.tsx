import { useEffect, useState, useMemo } from 'react';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Input,
  Row,
  Segmented,
  Space,
  Tag,
  Typography,
  message,
  Modal,
  Form,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CopyOutlined,
  DeleteOutlined,
  UploadOutlined,
  LogoutOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '@/store/editorStore';
import type { Page, PageListQuery, PageStatus, Template } from '@/services/api';

const { Title, Text, Paragraph } = Typography;

type FilterStatus = 'all' | 'draft' | 'published';

const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const {
    loadPagesFromServer,
    deletePageFromServer,
    clonePageToServer,
    updatePageStatusById,
    loadTemplatesFromServer,
    createFromTemplate,
    error,
    clearError,
  } = useEditorStore();

  const [msgApi, contextHolder] = message.useMessage();
  const [pages, setPages] = useState<Page[]>([]);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [keyword, setKeyword] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm<{ name: string }>();

  const refreshPages = async () => {
    const query: PageListQuery = {
      pageSize: 100,
      status: filterStatus === 'all' ? undefined : (filterStatus as PageStatus),
      keyword: keyword || undefined,
      sortBy: 'updated_at',
      sortOrder: 'desc',
    };
    const result = await loadPagesFromServer(query);
    setPages(result.items);
    setTotal(result.total);
  };

  useEffect(() => {
    void refreshPages();
  }, [filterStatus, keyword]);

  useEffect(() => {
    void loadTemplatesFromServer().then((list) => {
      if (Array.isArray(list)) setTemplates(list);
    });
  }, []);

  useEffect(() => {
    if (error) {
      msgApi.error(error);
      clearError();
    }
  }, [error]);

  const handleEdit = (pageId: string) => {
    navigate(`/editor/${pageId}`);
  };

  const handlePreview = (pageId: string) => {
    window.open(`/preview/${pageId}`, '_blank', 'noopener,noreferrer');
  };

  const handleClone = async (pageId: string, name?: string) => {
    const newId = await clonePageToServer(pageId, name);
    msgApi.success('页面已复制');
    await refreshPages();
    return newId;
  };

  const handleDelete = async (pageId: string) => {
    await deletePageFromServer(pageId);
    msgApi.success('页面已删除');
    await refreshPages();
  };

  const handlePublish = async (pageId: string) => {
    await updatePageStatusById(pageId, 'published');
    msgApi.success('页面已发布');
    await refreshPages();
  };

  const handleUnpublish = async (pageId: string) => {
    await updatePageStatusById(pageId, 'draft');
    msgApi.success('页面已下线');
    await refreshPages();
  };

  const handleCreateFromTemplate = async (templateId: string) => {
    await createFromTemplate(templateId);
    const currentPage = useEditorStore.getState().currentPage;
    if (currentPage) {
      navigate(`/editor/${currentPage.id}`);
    }
  };

  const handleCreateNew = async () => {
    const values = await createForm.validateFields();
    const store = useEditorStore.getState();
    store.createNewPage(values.name.trim() || '新页面');
    const page = store.currentPage;
    if (page) {
      navigate(`/editor/${page.id}`);
    }
  };

  const filteredPages = useMemo(() => {
    return pages;
  }, [pages]);

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-8">
            <Title level={3} className="!mb-1">Cotton 低代码平台</Title>
            <Text type="secondary">移动端页面可视化搭建</Text>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Space size={12}>
              <Segmented
                value={filterStatus}
                options={STATUS_OPTIONS}
                onChange={(v) => setFilterStatus(v as FilterStatus)}
              />
              <Input.Search
                allowClear
                placeholder="搜索页面"
                value={keywordInput}
                className="!w-[240px]"
                onChange={(e) => {
                  setKeywordInput(e.target.value);
                  if (!e.target.value.trim()) setKeyword('');
                }}
                onSearch={(v) => setKeyword(v.trim())}
              />
              <Text type="secondary">共 {total} 个页面</Text>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                createForm.setFieldsValue({ name: '新页面' });
                setCreateModalOpen(true);
              }}
            >
              新建页面
            </Button>
          </div>

          {filteredPages.length === 0 ? (
            <Card>
              <Empty
                description={
                  keyword || filterStatus !== 'all'
                    ? '没有找到匹配的页面'
                    : '还没有页面'
                }
              >
                {!keyword && filterStatus === 'all' && (
                  <Space>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        createForm.setFieldsValue({ name: '新页面' });
                        setCreateModalOpen(true);
                      }}
                    >
                      新建页面
                    </Button>
                  </Space>
                )}
              </Empty>
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredPages.map((page) => (
                <Col key={page.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    className="h-full"
                    styles={{ body: { padding: 16 } }}
                    onClick={() => handleEdit(page.id)}
                  >
                    <div className="flex h-full flex-col">
                      <div className="mb-2 flex items-start justify-between">
                        <Text strong className="text-base flex-1 truncate">
                          {page.name}
                        </Text>
                        <Dropdown
                          trigger={['click']}
                          menu={{
                            items: [
                              {
                                key: 'edit',
                                icon: <EditOutlined />,
                                label: '编辑',
                                onClick: () => handleEdit(page.id),
                              },
                              {
                                key: 'preview',
                                icon: <EyeOutlined />,
                                label: '预览',
                                onClick: () => handlePreview(page.id),
                              },
                              {
                                key: 'clone',
                                icon: <CopyOutlined />,
                                label: '复制',
                                onClick: () => handleClone(page.id),
                              },
                              page.status === 'published'
                                ? {
                                    key: 'unpublish',
                                    icon: <LogoutOutlined />,
                                    label: '下线',
                                    onClick: () => handleUnpublish(page.id),
                                  }
                                : {
                                    key: 'publish',
                                    icon: <UploadOutlined />,
                                    label: '发布',
                                    onClick: () => handlePublish(page.id),
                                  },
                              { type: 'divider' },
                              {
                                key: 'delete',
                                icon: <DeleteOutlined />,
                                label: '删除',
                                danger: true,
                                onClick: () => {
                                  Modal.confirm({
                                    title: '确认删除',
                                    content: `删除「${page.name}」后不可恢复，确认删除吗？`,
                                    okText: '删除',
                                    okType: 'danger',
                                    cancelText: '取消',
                                    onOk: () => handleDelete(page.id),
                                  });
                                },
                              },
                            ],
                          }}
                        >
                          <Button
                            type="text"
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                          >
                            ...
                          </Button>
                        </Dropdown>
                      </div>
                      {page.description && (
                        <Paragraph
                          type="secondary"
                          className="!mb-2 !text-xs"
                          ellipsis={{ rows: 2 }}
                        >
                          {page.description}
                        </Paragraph>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <Tag
                          color={page.status === 'published' ? 'green' : 'default'}
                          className="!text-xs"
                        >
                          {page.status === 'published' ? '已发布' : '草稿'}
                        </Tag>
                        <Text type="secondary" className="!text-xs">
                          {new Date(page.updated_at).toLocaleDateString()}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {templates.length > 0 && (
            <div className="mt-10">
              <div className="mb-4 flex items-center gap-2">
                <AppstoreOutlined className="text-slate-400" />
                <Title level={5} className="!mb-0">从模板创建</Title>
              </div>
              <Row gutter={[16, 16]}>
                {templates.map((tpl) => (
                  <Col key={tpl.id} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      hoverable
                      size="small"
                      onClick={() => handleCreateFromTemplate(tpl.id)}
                    >
                      <Text strong className="text-sm">{tpl.name}</Text>
                      {tpl.description && (
                        <Paragraph
                          type="secondary"
                          className="!mb-0 !mt-1 !text-xs"
                          ellipsis={{ rows: 1 }}
                        >
                          {tpl.description}
                        </Paragraph>
                      )}
                      {tpl.category && (
                        <Tag className="!mt-2 !text-xs">{tpl.category}</Tag>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      </div>

      <Modal
        title="新建页面"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onOk={handleCreateNew}
        okText="创建"
        cancelText="取消"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            label="页面名称"
            name="name"
            rules={[{ required: true, message: '请输入页面名称' }]}
          >
            <Input maxLength={40} placeholder="例如：首页活动页" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
