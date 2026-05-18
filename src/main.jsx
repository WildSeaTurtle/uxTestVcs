import '@jetbrains/int-ui-kit/styles.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

window.React = React;

document.documentElement.classList.add('theme-dark');
document.documentElement.style.colorScheme = 'dark';

createRoot(document.getElementById('root')).render(<App />);
