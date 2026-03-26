
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';

export default function MainRouter() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Preserve the existing localized Editor on the root route */}
                    <Route path="/" element={<App />} />
                    
                    {/* New Web App Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/editor/cloud/:projectId" element={<App />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
