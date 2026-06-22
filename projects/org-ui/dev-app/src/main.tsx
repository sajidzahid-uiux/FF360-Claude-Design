import {
  ThemeModeEnum,
  ThemeProvider
} from '@fieldflow360/org-ui';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import { UIApp } from './ui-app';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultMode={ThemeModeEnum.LIGHT} accentStorageKey="ui-accent-color">
      <UIApp mode='Development' />
    </ThemeProvider>
  </StrictMode>
);
