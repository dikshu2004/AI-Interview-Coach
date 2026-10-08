import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from  "./pages/login"
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";

function App() {
  return (<>
    <h1>AI Interview Coach</h1>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element ={<Login/>}/>
        <Route path="/register" element ={<Register/>}/>
        <Route path="/dashboard" element ={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
    </>
  );
}




export default App
