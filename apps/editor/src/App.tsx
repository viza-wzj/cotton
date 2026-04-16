import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Editor from './pages/Editor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/editor/:pageId?" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
