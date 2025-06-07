import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Background from "./Background";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <Background />
      <div className="homepage-content">
        <h1>Sudoku Showdown</h1>
        <p className="tagline">Sudoku isn’t just solo anymore—invite friends and see who’s the puzzle master!<br></br>
        What do we offer?<br></br>
        A competitive mode - To see who can conquer the Grid!<br></br>
        A cooperative mode - Join forces and solve the Grid as one!</p>
        <div className="home-buttons">
          <button onClick={() => navigate("/register")}>Register</button>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
