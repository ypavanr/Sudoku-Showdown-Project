import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login";
import Register from "./register";
import Room from "./room";
import SudokuBoard from "./sudoku";
import Background from './Background';
import Chat from "./socket_test";

function App() {
  return (
    <>
    <Background />
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room" element={<Room />} />
        <Route path="/sudoku" element={<SudokuBoard />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
