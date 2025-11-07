import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { BrowserRouter } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <React.StrictMode>
      <BrowserRouter>
      <App />
      </BrowserRouter>
    
  </React.StrictMode>
  </LocalizationProvider>
  
);