import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import InterviewSetup from "./pages/interviewSetup";
import InterviewRoom from "./pages/interviewRoom";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <main className="main-content">
      <div key={location.pathname} className="animate-page-enter" style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/setup" element={<InterviewSetup />} />
          <Route path="/interview-setup" element={<InterviewSetup />} />
          <Route path="/interview/practice" element={<InterviewRoom />} />
        </Routes>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar />
        <AnimatedRoutes />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
