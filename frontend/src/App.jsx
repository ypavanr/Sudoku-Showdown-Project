import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Login} from "./login";
import Register from "./register";
import Room from "./room";
import Competitive from "./Competitive";
import Home from "./Home";
import Cooperative from "./Cooperative.jsx";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room" element={<Room />} />
        <Route path="/room/cooperative/:roomId" element={<Cooperative />} />
        <Route path="/room/competitive/:roomId" element={<Competitive />} />
      </Routes>
    </Router>
  );
}

export default App;
