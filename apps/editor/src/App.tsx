import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

const Editor = lazy(() => import('./pages/Editor'));
const PreviewPage = lazy(() => import('./pages/Editor/PreviewPage'));

function App() {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <h1 className="text-xl font-bold text-slate-700 mb-2">页面加载出错</h1>
            <p className="text-slate-500">请刷新页面重试</p>
          </div>
        </div>
      }
    >
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<div className="p-8 text-center text-slate-500">加载中...</div>}>
          <Routes>
            <Route path="/" element={<Editor />} />
            <Route path="/editor/:pageId?" element={<Editor />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/preview/:pageId" element={<PreviewPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
