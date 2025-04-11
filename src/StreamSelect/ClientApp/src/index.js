import 'bootstrap/dist/css/bootstrap.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href') ?? undefined;
const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <BrowserRouter basename={baseUrl}>
      <App />
    </BrowserRouter>
  );
} else {
  console.error('Root element not found');
}

