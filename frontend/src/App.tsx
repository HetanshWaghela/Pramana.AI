import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '@/components/landing';
import { ChatApp } from '@/components/ChatApp';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<ChatApp />} />
        </Routes>
    );
}
