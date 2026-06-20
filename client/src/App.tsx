import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import './App.css'; // existing dashboard styles - unchanged for now
import './index.css'; // Tailwind + font

/**
 * Professor Note: your DashboardPage component, hooks, and API layer
 * are completely untouched by this change. We're only adding a router
 * ABOVE the existing tree. Phase 3's logic - polling, form handling,
 * human review - all still works exactly as before, just reachable
 * at /dashboard instead of being the only thing on screen.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;