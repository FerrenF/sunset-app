import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import GalleryFrameInner from './components/GalleryFrameInner';
import reportWebVitals from './reportWebVitals';





const appElement = document.getElementById('app_root')
appElement.classList.add('SunsetsRoot')
const root = ReactDOM.createRoot(appElement)


root.render(
    <>
  <React.StrictMode>
    <GalleryFrameInner />
  </React.StrictMode>
    </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
