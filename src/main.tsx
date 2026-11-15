import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
const element = document.getElementById('root');
if (!element) throw new Error('Missing root');
const app = <React.StrictMode><App /></React.StrictMode>;
if (element.hasChildNodes()) hydrateRoot(element, app);
else createRoot(element).render(app);
