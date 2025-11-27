import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Define the global variable that WordPress will create
declare global {
    interface Window {
        karateDashboardData: {
            apiUrl: string;
            nonce: string;
            view: 'user' | 'admin';
            isLoggedIn: boolean;
        }
    }
}

// Mock data for demonstration purposes in this environment
if (!window.karateDashboardData) {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view') === 'admin' ? 'admin' : 'user';
    // Show dashboard by default, bypassing registration.
    const isLoggedIn = true;

    window.karateDashboardData = {
        apiUrl: '',
        nonce: '',
        view: view,
        isLoggedIn: isLoggedIn,
    };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Ensure the data object exists before rendering
if (window.karateDashboardData) {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
} else {
    console.error('Karate Dashboard data not found. Was wp_localize_script called correctly?');
    rootElement.innerHTML = `<div class="p-8 text-center text-red-600">Karate Dashboard data not found. Was wp_localize_script called correctly?</div>`
}