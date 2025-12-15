import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/components/landing';
import { ChatAppWithSidebar } from '@/components/ChatAppWithSidebar';
import { LoginPage, RegisterPage } from '@/components/auth';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/chat" element={<ChatAppWithSidebar />} />
        </Routes>
    );
}
