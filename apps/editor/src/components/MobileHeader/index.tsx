import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Page } from '@/services/api';

export default function MobileHeader() {
  const {
    currentPage,
    undo,
    redo,
    canUndo,
    canRedo,
    savePageToServer,
    loadPagesFromServer,
    loadPageFromServer,
    isLoading,
    error,
    clearError,
  } = useEditorStore();

  const [showPageList, setShowPageList] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await savePageToServer();
    setSaving(false);
    alert('保存成功');
  };

  const handleExport = () => {
    // TODO: 实现代码导出功能
    console.log('导出代码');
    alert('代码导出功能开发中');
  };

  const handlePreview = () => {
    // 打开全屏预览
    const previewUrl = window.location.origin + '/preview';
    window.open(previewUrl, '_blank');
  };

  const handleShowPageList = async () => {
    setShowPageList(true);
    const pageList = await loadPagesFromServer();
    setPages(pageList);
  };

  const handleLoadPage = async (pageId: string) => {
    await loadPageFromServer(pageId);
    setShowPageList(false);
  };

  const handleNewPage = () => {
    // 刷新页面以创建新页面
    window.location.reload();
  };

  return (
    <>
      <header className="h-14 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between px-6 text-white">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Cotton C端低代码平台</h1>
          <div className="h-6 w-px bg-white/30" />
          <span className="text-sm opacity-90">
            {currentPage?.name || '未命名页面'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* 撤销/重做 */}
          <div className="flex items-center gap-1 border-r border-white/30 pr-4">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="撤销 (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 hover:bg-white/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="重做 (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                />
              </svg>
            </button>
          </div>

          {/* 操作按钮 */}
          <button
            onClick={handleShowPageList}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium bg-white/20 hover:bg-white/30 rounded transition"
          >
            {isLoading ? '加载中...' : '打开页面'}
          </button>
          <button
            onClick={handleNewPage}
            className="px-4 py-2 text-sm font-medium bg-white/20 hover:bg-white/30 rounded transition"
          >
            新建页面
          </button>
          <button
            onClick={handleSave}
            disabled={saving || isLoading}
            className="px-4 py-2 text-sm font-medium bg-white text-blue-600 rounded hover:bg-gray-100 transition disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
          <button
            onClick={handlePreview}
            className="px-4 py-2 text-sm font-medium bg-white/20 hover:bg-white/30 rounded transition"
          >
            全屏预览
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium bg-white/20 hover:bg-white/30 rounded transition"
          >
            导出
          </button>
        </div>
      </header>

      {/* 页面列表对话框 */}
      {showPageList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">我的页面</h2>
                <button
                  onClick={() => setShowPageList(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {pages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-lg mb-2">暂无页面</p>
                  <p className="text-sm">保存页面后，会显示在这里</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
                      onClick={() => handleLoadPage(page.id)}
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{page.name}</h3>
                        {page.description && (
                          <p className="text-sm text-gray-500 mt-1">{page.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>状态: {page.status === 'draft' ? '草稿' : '已发布'}</span>
                          <span>更新于: {new Date(page.updated_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          page.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {page.status === 'draft' ? '草稿' : '已发布'}
                        </span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button onClick={clearError} className="ml-2 hover:opacity-80">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
