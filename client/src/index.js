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
                        background: '#21253a',
                        color: '#e2e8f0',
                        border: '1px solid #2d3148',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontFamily: "'DM Sans', system-ui, sans-serif",
                    },
                    success: {
                        iconTheme: { primary: '#10b981', secondary: '#21253a' },
                    },
                    error: {
                        iconTheme: { primary: '#ef4444', secondary: '#21253a' },
                    },
                    loading: {
                        iconTheme: { primary: '#6366f1', secondary: '#21253a' },
                    },
                }}
            />
        </BrowserRouter>
    </Provider>
);
