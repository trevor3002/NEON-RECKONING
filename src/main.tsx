import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function showFatalError(message: string) {
  let panel = document.getElementById('fatal-app-error');
  if (!panel) {
    panel = document.createElement('pre');
    panel.id = 'fatal-app-error';
    panel.style.cssText = 'position:fixed;inset:0;z-index:999999;overflow:auto;margin:0;padding:24px;background:#080912;color:#ff6b8a;font:14px/1.5 monospace;white-space:pre-wrap;overflow-wrap:anywhere;';
    document.body.appendChild(panel);
  }
  panel.textContent = 'NEON RECKONING COULD NOT START\n\n' + message + '\n\nPlease send this error text to support so it can be fixed.';
}

window.addEventListener('error', (event) => {
  showFatalError(event.error?.stack || event.message || 'Unknown browser error');
});
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  showFatalError(reason?.stack || reason?.message || String(reason ?? 'Unknown promise rejection'));
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  showFatalError('The page is missing its #root element.');
} else {
  try {
    createRoot(rootElement).render(<App />);
  } catch (error) {
    showFatalError(error instanceof Error ? error.stack || error.message : String(error));
  }
}
