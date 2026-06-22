import { UIApp } from '@dev-app/ui-app';
import { ThemeModeEnum, ThemeProvider } from '@fieldflow360/org-ui';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultMode={ThemeModeEnum.LIGHT}>
      <UIApp mode='Consumer' />
    </ThemeProvider>
  </StrictMode>,
);

