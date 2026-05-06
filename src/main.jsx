import '@jetbrains/int-ui-kit/styles.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

window.React = React;

createRoot(document.getElementById('root')).render(<App />);