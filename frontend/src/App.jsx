import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./login";
import Register from "./register";
import Room from "./room";
import SudokuBoard from "./sudoku";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room" element={<Room />} />
        <Route path="/sudoku" element={<SudokuBoard />} />

      </Routes>
    </Router>
  );
}

export default App;
