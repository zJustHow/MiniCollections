import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StyleProvider } from '@ant-design/cssinjs';
import './index.css';
import App from './App';
import { LocaleProvider } from './LocaleContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StyleProvider layer>
      <BrowserRouter useTransitions={false}>
        <LocaleProvider>
          <App />
        </LocaleProvider>
      </BrowserRouter>
    </StyleProvider>
  </React.StrictMode>
);
