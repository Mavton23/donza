import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import "./index.css"
import './styles/fonts.css';
import { AuthProvider } from './contexts/AuthContext';
import { CourseProvider } from './contexts/CourseContext';
import { TooltipProvider } from './components/ui/tooltip';
import { NotificationProvider } from './contexts/NotificationContext';
import { ReactQueryProvider } from './contexts/ReactQueryProvider';
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
      <BrowserRouter basename="/">
        <AuthProvider>
          <NotificationProvider>
            <ReactQueryProvider>
              <TooltipProvider>
                <CourseProvider>
                  <App />
                </CourseProvider>
              </TooltipProvider>
            </ReactQueryProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    <Toaster richColors />
  </>
);