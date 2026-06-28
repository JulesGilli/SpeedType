import './index.css';
import { createRoot } from "react-dom/client";
import App from './App';
import { AuthProvider } from './lib/AuthContext';
import { I18nProvider } from './lib/i18n';

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <I18nProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </I18nProvider>
);
