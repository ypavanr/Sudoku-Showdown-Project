import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import "../modes/room.css"
import Background from "../features/Background";
import Logo from "../features/logo";
import { Form, Button } from 'react-bootstrap';
import ant from "/public/icons/ant.svg";
import bear from "/public/icons/bear.svg";
import bee from "/public/icons/bee.svg";
import buffalo from "/public/icons/buffalo.svg";
import butterfly from "/public/icons/butterfly.svg";
import dolphin from "/public/icons/dolphin.svg";
import eagle from "/public/icons/eagle.svg";
import fish from "/public/icons/fish.svg";
import fox from "/public/icons/fox.svg";
import gorilla from "/public/icons/gorilla.svg";
import horse from "/public/icons/horse.svg";
import insect from "/public/icons/insect.svg";
import koala from "/public/icons/koala.svg";
import leopard from "/public/icons/leopard.svg";
import lion from "/public/icons/lion.svg";
import monkey from "/public/icons/monkey.svg";
import panda from "/public/icons/panda.svg";
import panther from "/public/icons/panther.svg";
import penguin from "/public/icons/penguin.svg";
import spider from "/public/icons/spider.svg";
import squirrel from "/public/icons/squirrel.svg";
import starfish from "/public/icons/starfish.svg";
import swan from "/public/icons/swan.svg";

const icons = [
  { name: "ant", src: ant },
  { name: "bear", src: bear },
  { name: "bee", src: bee },
  { name: "buffalo", src: buffalo },
  { name: "butterfly", src: butterfly },
  { name: "dolphin", src: dolphin },
  { name: "eagle", src: eagle },
  { name: "fish", src: fish },
  { name: "fox", src: fox },
  { name: "gorilla", src: gorilla },
  { name: "horse", src: horse },
  { name: "insect", src: insect },
  { name: "koala", src: koala },
  { name: "leopard", src: leopard },
  { name: "lion", src: lion },
  { name: "monkey", src: monkey },
  { name: "panda", src: panda },
  { name: "panther", src: panther },
  { name: "penguin", src: penguin },
  { name: "spider", src: spider },
  { name: "squirrel", src: squirrel },
  { name: "starfish", src: starfish },
  { name: "swan", src: swan },
];

const HomePage = () => {
  const [formData, setFormData] = useState({ username: '', icon: icons[0].src, iconName: icons[0].name });
  const navigate = useNavigate();
  const [activeIconIndex, setActiveIconIndex] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({...prevData,[name]: value,}));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.username.trim() !== "") {
      localStorage.setItem("username", formData.username.trim());
      localStorage.setItem("avatar", formData.iconName+".svg"); 
      navigate("/room");
    } 
    else {
      alert("Please enter a username");
    }
  };

  const handlePrevIcon = () => {
    const newIndex = activeIconIndex === 0 ? icons.length - 1 : activeIconIndex - 1;
    setActiveIconIndex(newIndex);
    setFormData((prev) => ({
      ...prev,
      icon: icons[newIndex].src,
      iconName: icons[newIndex].name,
    }));
  };

  const handleNextIcon = () => {
    const newIndex = activeIconIndex === icons.length - 1 ? 0 : activeIconIndex + 1;
    setActiveIconIndex(newIndex);
    setFormData((prev) => ({
      ...prev,
      icon: icons[newIndex].src,
      iconName: icons[newIndex].name,
    }));
  };

  return (
    <div className="homepage-container">
      <div className="header-buttons">
        <div className="top-buttons">
          <button className="room-btn create" style={{padding:"14px 15px"}} onClick={() => navigate('/aboutus')}>About Us</button>
          <button className="room-btn solo" style={{padding:"14px 15px"}} onClick={() => navigate('/aboutproject')}>About Project</button>
        </div>

        <div className="survey-section">
          <a
            href="https://forms.gle/99px39FzZFUK7yuo9"
            className="survey-button"
            style={{padding:"14px 15px"}}
          >
            Take Our Survey
          </a>
        </div>
      </div>

      <Background />

      <div className="homepage-content">
        <Logo/>
        <h1 style={{ marginTop: '0'}}>Sudoku Savvy</h1>
        <p className="tagline">Sudoku isn’t just solo anymore—invite friends and see who’s the puzzle master!<br></br>
        What do we offer?<br></br>
        Competitive mode - To see who can conquer the Grid!<br></br>
        Cooperative mode - Join forces and solve the Grid as one!<br></br>
        Solo mode - Wanna brush up your skills alone? We got ya!<br></br>
        Expert level - We mess up your brain...Try it to know more ^-^!!</p>

        <div className="register-whole">
          <div className="register-container">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="username">
                <div className="selection-bar">
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your Username"
                    required
                  />
                  <Button variant="primary" type="submit" className="play-btn">
                    Play
                  </Button>
                </div>
              </Form.Group>

              <Form.Group controlId="icon">
                <Form.Label>Select an Avatar</Form.Label>
                <div className="icon-carousel">
                  <button type="button" onClick={handlePrevIcon}>&lt;</button>
                  <img
                    src={icons[activeIconIndex].src}
                    alt={icons[activeIconIndex].name}
                  />
                  <button type="button" onClick={handleNextIcon}>&gt;</button>
                </div>
              </Form.Group>    
            </Form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
