import { create } from 'zustand';
import { generateComponentId } from '@/constants';
import { apiService, Page } from '@/services/api';
import type { ComponentSchema, PageSchema } from '@/types/schema';

interface EditorState {
  // 当前页面配置
  currentPage: PageSchema | null;
  // 选中的组件 ID
  selectedComponentId: string | null;
  // 拖拽中的组件
  draggingComponent: ComponentSchema | null;
  // 历史记录
  history: PageSchema[];
  historyIndex: number;
  // 是否可以撤销/重做
  canUndo: boolean;
  canRedo: boolean;
  // 当前激活的拖拽 ID
  activeId: string | null;
  // 加载状态
  isLoading: boolean;
  // 错误信息
  error: string | null;

  // Actions
  setCurrentPage: (page: PageSchema) => void;
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

  // 后端集成
  savePageToServer: (name?: string, description?: string) => Promise<void>;
  loadPagesFromServer: () => Promise<Page[]>;
  loadPageFromServer: (id: string) => Promise<void>;
  deletePageFromServer: (id: string) => Promise<void>;
  saveAsTemplate: (name: string, description?: string) => Promise<void>;
  loadTemplatesFromServer: () => Promise<Page[]>;
  createFromTemplate: (templateId: string) => Promise<void>;
  clearError: () => void;
}

const createDefaultPage = (): PageSchema => ({
  id: 'page_default',
  name: '新页面',
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

export const useEditorStore = create<EditorState>((set, get) => ({
  currentPage: createDefaultPage(),
  selectedComponentId: null,
  draggingComponent: null,
  history: [createDefaultPage()],
  historyIndex: 0,
  canUndo: false,
  canRedo: false,
  activeId: null,
  isLoading: false,
  error: null,

  setCurrentPage: (page) => {
    set({ currentPage: page });
    get().saveToHistory();
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

    const removeFromTree = (components: ComponentSchema[]): ComponentSchema[] => {
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
      selectedComponentId: selectedComponentId === id ? null : selectedComponentId,
    });
    get().saveToHistory();
  },

  duplicateComponent: (id) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const findComponent = (components: ComponentSchema[]): ComponentSchema | null => {
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
      });
    }
  },

  saveToHistory: () => {
    const { currentPage, history, historyIndex } = get();
    if (!currentPage) return;

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentPage);

    // 限制历史记录数量
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    const newIndex = newHistory.length - 1;
    set({
      history: newHistory,
      historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: false,
    });
  },

  // 后端集成功能
  savePageToServer: async (name?: string, description?: string) => {
    const { currentPage } = get();
    if (!currentPage) return;

    set({ isLoading: true, error: null });
    try {
      const pageData = {
        id: currentPage.id,
        name: name || currentPage.name || '未命名页面',
        description: description || currentPage.description,
        content: currentPage,
        status: 'draft',
      };

      await apiService.updatePage(currentPage.id, pageData);
      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '保存失败',
      });
    }
  },

  loadPagesFromServer: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getPages();
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '加载页面列表失败',
      });
      return [];
    }
  },

  loadPageFromServer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getPage(id);
      const page = response.data;

      const pageSchema: PageSchema = {
        ...page.content,
        id: page.id,
        name: page.name,
        description: page.description,
      };

      set({
        currentPage: pageSchema,
        isLoading: false,
        history: [pageSchema],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '加载页面失败',
      });
    }
  },

  deletePageFromServer: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deletePage(id);
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
        id: `template_${Date.now()}`,
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

      const newPage: PageSchema = {
        ...template.content,
        id: `page_${Date.now()}`,
        name: `${template.name} (副本)`,
        metadata: {
          ...template.content.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      set({
        currentPage: newPage,
        isLoading: false,
        history: [newPage],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : '从模板创建页面失败',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
