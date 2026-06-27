import { type ReactNode, useEffect } from 'react';
import { ConfigProvider } from 'antd';
import ruRu from 'antd/es/locale/ru_RU';
import { THEMES } from './themes';

import { useAppSelector } from 'hooks/useAppSelector';

interface Props {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: Props) => {
  const key = useAppSelector((state) => state.theme.key);
  const meta = THEMES[key] ?? THEMES.light;

  // Прокидываем тему в <html> для глобальных стилей: фон страницы, перекраска
  // захардкоженных inline-цветов (data-dark) и нативные элементы (color-scheme).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', meta.key);
    document.documentElement.setAttribute('data-dark', String(meta.isDark));
  }, [meta.key, meta.isDark]);

  return (
    <ConfigProvider locale={ruRu} theme={meta.config}>
      {children}
    </ConfigProvider>
  );
};
