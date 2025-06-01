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
        <p className="tagline">Test your logic. Conquer the grid.</p>
        <div className="home-buttons">
          <button onClick={() => navigate("/register")}>Register</button>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
