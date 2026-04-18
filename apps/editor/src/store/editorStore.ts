import { create } from 'zustand';
import { CURRENT_SCHEMA_VERSION, generateComponentId } from '@/constants';
import {
  apiService,
  ApiRequestError,
  PageListData,
  PageListQuery,
  PageFlowRecord,
  PageStatus,
  Template,
} from '@/services/api';
import type { ComponentSchema, PageSchema } from '@/types/schema';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SavePageOptions {
  name?: string;
  description?: string;
  status?: PageStatus;
  publishNote?: string;
  publishOperator?: string;
}

interface EditorState {
  currentPage: PageSchema | null;
  currentPageStatus: PageStatus;
  currentPageFlowHistory: PageFlowRecord[];
  selectedComponentId: string | null;
  draggingComponent: ComponentSchema | null;
  history: PageSchema[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  activeId: string | null;
  isLoading: boolean;
  isDirty: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  error: string | null;

  setCurrentPage: (
    page: PageSchema,
    status?: PageStatus,
    flowHistory?: PageFlowRecord[]
  ) => void;
  updatePageMeta: (updates: { name?: string; description?: string }) => void;
  createNewPage: (name?: string) => void;
  selectComponent: (id: string | null) => void;
  updateComponent: (id: string, updates: Partial<ComponentSchema>) => void;
  addComponent: (component: ComponentSchema, parentId?: string) => void;
  removeComponent: (id: string) => void;
  duplicateComponent: (id: string) => void;
  setDraggingComponent: (component: ComponentSchema | null) => void;
  reorderComponents: (fromId: string, toId: string) => void;
  setActiveId: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  savePageToServer: (options?: SavePageOptions) => Promise<void>;
  publishPageToServer: (publishNote?: string, publishOperator?: string) => Promise<void>;
  unpublishPageToServer: (publishNote?: string, publishOperator?: string) => Promise<void>;
  updatePageStatusById: (
    id: string,
    status: PageStatus,
    publishNote?: string,
    publishOperator?: string
  ) => Promise<void>;
  loadPagesFromServer: (query?: PageListQuery) => Promise<PageListData>;
  loadPageFromServer: (id: string) => Promise<void>;
  deletePageFromServer: (id: string) => Promise<void>;
  saveAsTemplate: (name: string, description?: string) => Promise<void>;
  loadTemplatesFromServer: () => Promise<Template[]>;
  createFromTemplate: (templateId: string) => Promise<void>;
  deleteTemplateFromServer: (id: string) => Promise<void>;
  clearError: () => void;
}

const createLocalPageId = () =>
  `page_local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const createDefaultPage = (name: string = '新页面'): PageSchema => ({
  id: createLocalPageId(),
  name,
  schemaVersion: CURRENT_SCHEMA_VERSION,
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

const toPageSchema = (
  content: unknown,
  overrides: {
    id: string;
    name: string;
    description?: string;
  }
): PageSchema => {
  const raw =
    content && typeof content === 'object' && !Array.isArray(content)
      ? (content as Record<string, unknown>)
      : {};

  const rawMetadata =
    raw.metadata && typeof raw.metadata === 'object'
      ? (raw.metadata as Record<string, unknown>)
      : {};

  const createdAt = rawMetadata.createdAt
    ? new Date(rawMetadata.createdAt as string | number | Date)
    : new Date();
  const updatedAt = rawMetadata.updatedAt
    ? new Date(rawMetadata.updatedAt as string | number | Date)
    : new Date();

  return {
    id: overrides.id,
    name: overrides.name,
    description: overrides.description,
    schemaVersion:
      typeof raw.schemaVersion === 'string'
        ? raw.schemaVersion
        : CURRENT_SCHEMA_VERSION,
    version: typeof raw.version === 'string' ? raw.version : '1.0.0',
    components: Array.isArray(raw.components)
      ? (raw.components as ComponentSchema[])
      : [],
    globalConfig:
      raw.globalConfig &&
      typeof raw.globalConfig === 'object' &&
      !Array.isArray(raw.globalConfig)
        ? (raw.globalConfig as PageSchema['globalConfig'])
        : {
            theme: {
              primaryColor: '#1890ff',
            },
          },
    metadata: {
      createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
      updatedAt: Number.isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
      createdBy:
        typeof rawMetadata.createdBy === 'string'
          ? rawMetadata.createdBy
          : 'system',
      ...(typeof rawMetadata.updatedBy === 'string'
        ? { updatedBy: rawMetadata.updatedBy }
        : {}),
      ...(Array.isArray(rawMetadata.tags)
        ? { tags: rawMetadata.tags as string[] }
        : {}),
    },
  };
};

const normalizeStatus = (status?: string): PageStatus =>
  status === 'published' ? 'published' : 'draft';

const isLocalPageId = (id: string): boolean => id.startsWith('page_local_');

const isNotFoundError = (error: unknown): boolean => {
  if (error instanceof ApiRequestError) {
    return error.status === 404 || error.code === 'NOT_FOUND';
  }

  if (error && typeof error === 'object') {
    const maybe = error as { status?: unknown; code?: unknown };
    return maybe.status === 404 || maybe.code === 'NOT_FOUND';
  }

  return false;
};

const initialPage = createDefaultPage();

export const useEditorStore = create<EditorState>((set, get) => ({
  currentPage: initialPage,
  currentPageStatus: 'draft',
  currentPageFlowHistory: [],
  selectedComponentId: null,
  draggingComponent: null,
  history: [initialPage],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
  activeId: null,
  isLoading: false,
  isDirty: false,
  saveStatus: 'idle',
  lastSavedAt: null,
  error: null,

  setCurrentPage: (page, status = 'draft', flowHistory = []) => {
    set({
      currentPage: page,
      currentPageStatus: status,
      currentPageFlowHistory: flowHistory,
      selectedComponentId: null,
      history: [page],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
      isDirty: false,
      saveStatus: 'idle',
    });
  },

  updatePageMeta: (updates) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const updatedPage: PageSchema = {
      ...currentPage,
      ...updates,
      metadata: {
        ...currentPage.metadata,
        updatedAt: new Date(),
      },
    };

    set({ currentPage: updatedPage, isDirty: true, saveStatus: 'idle' });
    get().saveToHistory();
  },

  createNewPage: (name = '新页面') => {
    const newPage = createDefaultPage(name);
    set({
      currentPage: newPage,
      currentPageStatus: 'draft',
      currentPageFlowHistory: [],
      selectedComponentId: null,
      draggingComponent: null,
      history: [newPage],
      historyIndex: 0,
      canUndo: false,
      canRedo: false,
      activeId: null,
      isDirty: false,
      saveStatus: 'idle',
      lastSavedAt: null,
      error: null,
    });
  },

  selectComponent: (id) => {
    set({ selectedComponentId: id });
  },

  updateComponent: (id, updates) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const updateInTree = (components: ComponentSchema[]): ComponentSchema[] => {
      return components.map((comp) => {
        if (comp.id === id) {
          return { ...comp, ...updates };
        }
        if (comp.children) {
          return { ...comp, children: updateInTree(comp.children) };
        }
        return comp;
      });
    };

    const updatedPage = {
      ...currentPage,
      components: updateInTree(currentPage.components),
      metadata: {
        ...currentPage.metadata,
        updatedAt: new Date(),
      },
    };

    set({ currentPage: updatedPage });
    get().saveToHistory();
  },

  addComponent: (component, parentId) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const addToTree = (components: ComponentSchema[]): ComponentSchema[] => {
      if (!parentId) {
        return [...components, component];
      }
      return components.map((comp) => {
        if (comp.id === parentId && comp.children) {
          return { ...comp, children: [...comp.children, component] };
        }
        if (comp.children) {
          return { ...comp, children: addToTree(comp.children) };
        }
        return comp;
      });
    };

    const updatedPage = {
      ...currentPage,
      components: addToTree(currentPage.components),
      metadata: {
        ...currentPage.metadata,
        updatedAt: new Date(),
      },
    };

    set({ currentPage: updatedPage, selectedComponentId: component.id });
    get().saveToHistory();
  },

  removeComponent: (id) => {
    const { currentPage, selectedComponentId } = get();
    if (!currentPage) return;

    const removeFromTree = (
      components: ComponentSchema[]
    ): ComponentSchema[] => {
      return components
        .filter((comp) => comp.id !== id)
        .map((comp) => ({
          ...comp,
          children: comp.children ? removeFromTree(comp.children) : undefined,
        }));
    };

    const updatedPage = {
      ...currentPage,
      components: removeFromTree(currentPage.components),
      metadata: {
        ...currentPage.metadata,
        updatedAt: new Date(),
      },
    };

    set({
      currentPage: updatedPage,
      selectedComponentId:
        selectedComponentId === id ? null : selectedComponentId,
    });
    get().saveToHistory();
  },

  duplicateComponent: (id) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const findComponent = (
      components: ComponentSchema[]
    ): ComponentSchema | null => {
      for (const comp of components) {
        if (comp.id === id) {
          return comp;
        }
        if (comp.children) {
          const result = findComponent(comp.children);
          if (result) {
            return result;
          }
        }
      }
      return null;
    };

    const target = findComponent(currentPage.components);
    if (target) {
      const duplicated: ComponentSchema = {
        ...target,
        id: generateComponentId(target.type),
      };
      get().addComponent(duplicated);
    }
  },

  setDraggingComponent: (component) => {
    set({ draggingComponent: component });
  },

  setActiveId: (id) => {
    set({ activeId: id });
  },

  reorderComponents: (fromId, toId) => {
    const { currentPage } = get();
    if (!currentPage || fromId === toId) return;

    const components = [...currentPage.components];
    const fromIndex = components.findIndex((c) => c.id === fromId);
    const toIndex = components.findIndex((c) => c.id === toId);

    if (fromIndex === -1 || toIndex === -1) return;

    const [movedComponent] = components.splice(fromIndex, 1);
    components.splice(toIndex, 0, movedComponent);

    const updatedPage = {
      ...currentPage,
      components,
      metadata: {
        ...currentPage.metadata,
        updatedAt: new Date(),
      },
    };

    set({ currentPage: updatedPage });
    get().saveToHistory();
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        currentPage: history[newIndex],
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: newIndex < history.length - 1,
        isDirty: true,
        saveStatus: 'idle',
      });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        currentPage: history[newIndex],
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: newIndex < history.length - 1,
        isDirty: true,
        saveStatus: 'idle',
      });
    }
  },

  saveToHistory: () => {
    const { currentPage, history, historyIndex } = get();
    if (!currentPage) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentPage);

    if (newHistory.length > 50) {
      newHistory.shift();
    }

    const newIndex = newHistory.length - 1;
    set({
      history: newHistory,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: false,
      isDirty: true,
      saveStatus: 'idle',
    });
  },

  savePageToServer: async (options) => {
    const { currentPage, currentPageStatus, currentPageFlowHistory } = get();
    if (!currentPage) return;

    const status = options?.status ?? currentPageStatus;
    const shouldAppendFlowRecord = status !== currentPageStatus;
    const nextFlowHistory: PageFlowRecord[] = shouldAppendFlowRecord
      ? [
          ...currentPageFlowHistory,
          {
            action: status === 'published' ? 'published' : 'unpublished',
            note: options?.publishNote?.trim() || undefined,
            operator: options?.publishOperator?.trim() || undefined,
            timestamp: new Date().toISOString(),
          },
        ]
      : currentPageFlowHistory;

    const pageData = {
      name: options?.name || currentPage.name || '未命名页面',
      description: options?.description ?? currentPage.description,
      content: currentPage,
      status,
      flowHistory: nextFlowHistory,
      publishNote: options?.publishNote,
      publishOperator: options?.publishOperator,
    };

    set({ isLoading: true, saveStatus: 'saving', error: null });

    try {
      let savedPageId = currentPage.id;

      if (isLocalPageId(currentPage.id)) {
        const response = await apiService.createPage(pageData);
        savedPageId = response.data.id;
      } else {
        try {
          await apiService.updatePage(currentPage.id, pageData);
        } catch (error) {
          if (!isNotFoundError(error)) {
            throw error;
          }

          const response = await apiService.createPage(pageData);
          savedPageId = response.data.id;
        }
      }

      const now = new Date();
      const updatedPage: PageSchema = {
        ...currentPage,
        id: savedPageId,
        name: pageData.name,
        description: pageData.description,
        metadata: {
          ...currentPage.metadata,
          updatedAt: now,
        },
      };

      set({
        currentPage: updatedPage,
        currentPageStatus: status,
        currentPageFlowHistory: nextFlowHistory,
        isLoading: false,
        isDirty: false,
        saveStatus: 'saved',
        lastSavedAt: now,
        history: [updatedPage],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        saveStatus: 'error',
        error: error instanceof Error ? error.message : '保存失败',
      });
    }
  },

  publishPageToServer: async (publishNote, publishOperator) => {
    await get().savePageToServer({
      status: 'published',
      publishNote,
      publishOperator,
    });
  },

  unpublishPageToServer: async (publishNote, publishOperator) => {
    await get().savePageToServer({
      status: 'draft',
      publishNote,
      publishOperator,
    });
  },

  updatePageStatusById: async (id, status, publishNote, publishOperator) => {
    const { currentPage } = get();
    set({ isLoading: true, error: null });
    try {
      if (currentPage?.id === id) {
        await get().savePageToServer({
          status,
          publishNote,
          publishOperator,
        });
        return;
      }

      const pageRes = await apiService.getPage(id);
      const page = pageRes.data;
      const currentHistory = page.flowHistory ?? [];
      const currentStatus: PageStatus = page.status === 'published' ? 'published' : 'draft';

      const nextFlowHistory: PageFlowRecord[] =
        currentStatus === status
          ? currentHistory
          : [
              ...currentHistory,
              {
                action: status === 'published' ? 'published' : 'unpublished',
                note: publishNote?.trim() || undefined,
                operator: publishOperator?.trim() || undefined,
                timestamp: new Date().toISOString(),
              },
            ];

      await apiService.updatePage(id, {
        status,
        flowHistory: nextFlowHistory,
        publishNote,
        publishOperator,
      });

      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '更新页面状态失败',
      });
    }
  },

  loadPagesFromServer: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getPages(query);
      set({ isLoading: false });
      if (Array.isArray(response.data)) {
        return {
          items: response.data,
          total: response.data.length,
          page: 1,
          pageSize: response.data.length || 10,
        };
      }
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '加载页面列表失败',
      });
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      };
    }
  },

  loadPageFromServer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getPage(id);
      const page = response.data;

      const pageSchema = toPageSchema(page.content, {
        id: page.id,
        name: page.name,
        description: page.description,
      });

      set({
        currentPage: pageSchema,
        currentPageStatus: normalizeStatus(page.status),
        currentPageFlowHistory: page.flowHistory ?? [],
        isLoading: false,
        isDirty: false,
        saveStatus: 'idle',
        history: [pageSchema],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
        selectedComponentId: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '加载页面失败',
      });
    }
  },

  deletePageFromServer: async (id: string) => {
    const { currentPage } = get();
    set({ isLoading: true, error: null });
    try {
      await apiService.deletePage(id);

      if (currentPage?.id === id) {
        const newPage = createDefaultPage();
        set({
          currentPage: newPage,
          currentPageStatus: 'draft',
          currentPageFlowHistory: [],
          history: [newPage],
          historyIndex: 0,
          canUndo: false,
          canRedo: false,
          selectedComponentId: null,
          isDirty: false,
          saveStatus: 'idle',
          lastSavedAt: null,
          isLoading: false,
        });
        return;
      }

      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '删除页面失败',
      });
    }
  },

  saveAsTemplate: async (name: string, description?: string) => {
    const { currentPage } = get();
    if (!currentPage) return;

    set({ isLoading: true, error: null });
    try {
      const templateData = {
        name,
        description,
        category: '自定义',
        content: currentPage,
        tags: [],
        isPublic: false,
      };

      await apiService.createTemplate(templateData);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '保存模板失败',
      });
    }
  },

  loadTemplatesFromServer: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getTemplates();
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '加载模板列表失败',
      });
      return [];
    }
  },

  createFromTemplate: async (templateId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getTemplate(templateId);
      const template = response.data;

      const basePage = toPageSchema(template.content, {
        id: createLocalPageId(),
        name: `${template.name} (副本)`,
      });

      const newPage: PageSchema = {
        ...basePage,
        metadata: {
          ...basePage.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      set({
        currentPage: newPage,
        currentPageStatus: 'draft',
        currentPageFlowHistory: [],
        isLoading: false,
        isDirty: true,
        saveStatus: 'idle',
        history: [newPage],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
        selectedComponentId: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '从模板创建页面失败',
      });
    }
  },

  deleteTemplateFromServer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteTemplate(id);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '删除模板失败',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
