import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import WorldZeroTracker from './components/world-zero-tracker';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WorldZeroTracker />
  </React.StrictMode>
);
