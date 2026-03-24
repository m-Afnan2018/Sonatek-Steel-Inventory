import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import rootReducer from './reducers/store';
import { Toaster } from 'react-hot-toast';


const store = configureStore({
    reducer: rootReducer,
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <BrowserRouter>
            <App />
            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#1e2533',
                        color: '#e2e8f0',
                        border: '1px solid #263147',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                    },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: '#1e2533' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#1e2533' },
                    },
                    loading: {
                        iconTheme: { primary: '#3b82f6', secondary: '#1e2533' },
                    },
                }}
            />
        </BrowserRouter>
    </Provider>
);
