import { theme as antdTheme, type ThemeConfig } from 'antd';

import type { ThemeKey } from 'store/ThemeSlice';

export interface AppThemeMeta {
  key: ThemeKey;
  /** i18n-ключ названия темы */
  labelKey: string;
  isDark: boolean;
  /** Конфиг алгоритма и токенов для antd ConfigProvider */
  config: ThemeConfig;
}

export const THEMES: Record<ThemeKey, AppThemeMeta> = {
  light: {
    key: 'light',
    labelKey: 'theme.names.light',
    isDark: false,
    config: {
      algorithm: antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: '#1677ff'
      }
    }
  },

  dark: {
    key: 'dark',
    labelKey: 'theme.names.dark',
    isDark: true,
    config: {
      algorithm: antdTheme.darkAlgorithm,
      token: {
        colorPrimary: '#1677ff',
        colorBgLayout: '#141414',
        colorBgContainer: '#1f1f1f',
        colorBgElevated: '#262626',
        colorBorder: '#303030'
      }
    }
  },

  dim: {
    key: 'dim',
    labelKey: 'theme.names.dim',
    isDark: true,
    config: {
      algorithm: antdTheme.darkAlgorithm,
      token: {
        colorPrimary: '#3b82f6',
        colorBgLayout: '#0f172a',
        colorBgContainer: '#1e293b',
        colorBgElevated: '#243045',
        colorBorder: '#334155',
        colorText: 'rgba(255, 255, 255, 0.92)'
      }
    }
  },

  contrast: {
    key: 'contrast',
    labelKey: 'theme.names.contrast',
    isDark: true,
    config: {
      algorithm: antdTheme.darkAlgorithm,
      token: {
        colorPrimary: '#4dabf7',
        colorBgLayout: '#000000',
        colorBgContainer: '#0d0d0d',
        colorBgElevated: '#141414',
        colorBorder: '#555555',
        colorText: '#ffffff',
        colorTextSecondary: 'rgba(255, 255, 255, 0.85)'
      }
    }
  },

  purple: {
    key: 'purple',
    labelKey: 'theme.names.purple',
    isDark: true,
    config: {
      algorithm: antdTheme.darkAlgorithm,
      token: {
        colorPrimary: '#a855f7',
        colorBgLayout: '#15101f',
        colorBgContainer: '#1e1730',
        colorBgElevated: '#271d3d',
        colorBorder: '#3b2d57',
        colorText: 'rgba(255, 255, 255, 0.92)'
      }
    }
  },

  yellow: {
    key: 'yellow',
    labelKey: 'theme.names.yellow',
    isDark: false,
    config: {
      algorithm: antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: '#ca8a04',
        colorBgLayout: '#fdf6e3',
        colorBgContainer: '#fffdf5',
        colorBgElevated: '#fffef9',
        colorBorder: '#e8dcc0',
        colorText: 'rgba(61, 50, 18, 0.92)'
      }
    }
  }
};

export const THEME_OPTIONS: AppThemeMeta[] = [THEMES.light, THEMES.dark, THEMES.dim, THEMES.contrast, THEMES.purple, THEMES.yellow];
