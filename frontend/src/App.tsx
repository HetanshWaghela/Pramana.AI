import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/components/landing';
import { ChatApp } from '@/components/ChatApp';
import { ChatAppWithSidebar } from '@/components/ChatAppWithSidebar';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage } from '@/components/auth/RegisterPage';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/app" element={<ChatAppWithSidebar />} />
            <Route path="/chat" element={<ChatApp />} /> {/* Legacy route without sidebar */}
        </Routes>
    );
}
