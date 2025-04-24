import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import ruRu from 'antd/es/locale/ru_RU';
import { BrowserRouter } from 'react-router';
import App from './App.tsx';
import 'antd/dist/reset.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={ruRu}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>
);
