import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Room from "./components/modes/room.jsx";
import Competitive from "./components/modes/Competitive.jsx";
import Home from "./components/homePage/Home.jsx";
import Cooperative from "./components/modes/Cooperative.jsx";
import About from "./components/homePage/About.jsx";
import Solo from "./components/modes/solo.jsx";
import CC from "./components/modes/CC.jsx";
import PrivateRoute from "./components/features/PrivateRoutes.jsx";
import Scroll from "./components/features/scroll.jsx";
import AboutProject from "./components/homePage/AboutProject.jsx";
function App() {
  return (
    <Router>
      <Scroll/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aboutus" element={<About />} />
        <Route path="/aboutproject" element={<AboutProject />} />
        <Route path="/room" element={
          <PrivateRoute><Room /></PrivateRoute>
        } />
        <Route path="/room/cooperative/:roomId" element={
          <PrivateRoute><Cooperative /></PrivateRoute>
        } />
        <Route path="/room/competitive/:roomId" element={
          <PrivateRoute><Competitive /></PrivateRoute>
        } />
        <Route path="/room/solo" element={
          <PrivateRoute><Solo /></PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
