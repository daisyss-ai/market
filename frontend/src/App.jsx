import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./home/Home";
import Landing from "./landing/Landing";
import Enter from "./landing/Enter";
import Login from "./landing/Login";
import Signup from "./landing/Signup";
import Recover from "./landing/Recover";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/enter" element={<Enter />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recover" element={<Recover />} />
        <Route path="/landing" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
