import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {Login} from "./components/homePage/login.jsx";
import Register from "./components/homePage/register.jsx";
import Room from "./components/modes/room.jsx";
import Competitive from "./components/modes/Competitive.jsx";
import Home from "./components/homePage/Home.jsx";
import Cooperative from "./components/modes/Cooperative.jsx";
import About from "./components/homePage/About.jsx";
import Solo from "./components/modes/solo.jsx";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />}/>
        <Route path="/room" element={<Room />} />
        <Route path="/room/cooperative/:roomId" element={<Cooperative />} />
        <Route path="/room/competitive/:roomId" element={<Competitive />} />
        <Route path="/room/solo" element={<Solo />} />
      </Routes>
    </Router>
  );
}

export default App;
