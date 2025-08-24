import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppWithErrorBoundary from './App';
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppWithErrorBoundary />
  </React.StrictMode>
);
