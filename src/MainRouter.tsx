
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';

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
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
