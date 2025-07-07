import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import Background from "../features/Background";
import Logo from "../features/logo";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage-container">
      <Background />
    
      <div className="homepage-content">
        <Logo/>
        <h1 style={{ marginTop: '0' }}>Sudoku Showdown</h1>
        <p className="tagline">Sudoku isn’t just solo anymore—invite friends and see who’s the puzzle master!<br></br>
        What do we offer?<br></br>
        Competitive mode - To see who can conquer the Grid!<br></br>
        Cooperative mode - Join forces and solve the Grid as one!<br></br>
        CC mode - Competitive but make it Cooperative! Bring on the team wars!!<br></br>
        Solo mode - Wanna brush up your skills alone? We got ya!</p>
        <div className="home-buttons">
          <button onClick={() => navigate("/register")}>Register</button>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
