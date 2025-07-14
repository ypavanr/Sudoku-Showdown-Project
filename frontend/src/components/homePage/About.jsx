import React from "react";
import "./About.css";
import User from "../../assets/user.svg";
import Mail from "../../assets/mail.svg";
import Git from "../../assets/github.svg";
import Logo from "../features/logo"
function About() {
  return (
  <div>
    <div className="header">
      <Logo/>
      <h1>Sudoku Savvy</h1>
      <h2>The Developers of the Website</h2>
    </div>
    <div className="about-container">
      <div className="developer dev-violet">
        <div className="developer-header">
          <img src={User} alt="User Icon" className="user-icon" />
          <h2>Vibha Shankar Rao</h2>
        </div>
        <p>2nd Year Information Science and Engineering</p>
        <p>Dayanand Sagar College of Engineering, Bangalore</p>
        <p>Role : Full Stack Development</p>
        <p>Interests : Frontend Development</p>
        <div className="social-links">
          <a href="https://github.com/Vibha-1802" target="_blank" rel="noopener noreferrer">
            <img src={Git} alt="GitHub" className="icon" />
            Vibha-1802
          </a>
        </div>
      </div>
      <div className="developer dev-violet">
        <div className="developer-header">
          <img src={User} alt="User Icon" className="user-icon" />
          <h2>Y Pavan Reddy</h2>
        </div>
        <p>2nd Year Information Science and Engineering</p>
        <p>Dayanand Sagar College of Engineering, Bangalore</p>
        <p>Role : Full Stack Development</p>
        <p>Interests : Backend Development | AIML/DL</p>
        <div className="social-links">
          <a href="https://github.com/ypavanr" target="_blank" rel="noopener noreferrer">
            <img src={Git} alt="GitHub" className="icon" />
            ypavanr
          </a>
        </div>
      </div>
      <div className="survey-section">
        <div className="email">
          <img src={Mail} alt="Mail" className="icon" />
          sudokusavvy.project@gmail.com
        </div>
        <p>We would love it if you could spend some time on a survey! TOTALLY UP TO YOU 😊</p>
        <a
          href="https://forms.gle/99px39FzZFUK7yuo9"
          target="_blank"
          rel="noopener noreferrer"
          className="survey-button"
        >
          Take Our Survey
        </a>
      </div>
    </div>
  </div>
  );
}

export default About;
