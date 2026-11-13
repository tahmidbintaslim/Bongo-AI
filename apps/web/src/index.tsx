import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const rootTag = document.getElementById('root');

if (rootTag) {
  createRoot(rootTag).render(<App />);
}
