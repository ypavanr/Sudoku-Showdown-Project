import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import './Register.css';
import Background from "../features/Background";
import Logo from "../features/logo";
import { Form, Button } from 'react-bootstrap';
import ant from "../../assets/icons/ant.svg";
import bear from "../../assets/icons/bear.svg";
import bee from "../../assets/icons/bee.svg";
import buffalo from "../../assets/icons/buffalo.svg";
import butterfly from "../../assets/icons/butterfly.svg";
import dolphin from "../../assets/icons/dolphin.svg";
import eagle from "../../assets/icons/eagle.svg";
import fish from "../../assets/icons/fish.svg";
import fox from "../../assets/icons/fox.svg";
import gorilla from "../../assets/icons/gorilla.svg";
import horse from "../../assets/icons/horse.svg";
import insect from "../../assets/icons/insect.svg";
import koala from "../../assets/icons/koala.svg";
import leopard from "../../assets/icons/leopard.svg";
import lion from "../../assets/icons/lion.svg";
import monkey from "../../assets/icons/monkey.svg";
import panda from "../../assets/icons/panda.svg";
import panther from "../../assets/icons/panther.svg";
import penguin from "../../assets/icons/penguin.svg";
import spider from "../../assets/icons/spider.svg";
import squirrel from "../../assets/icons/squirrel.svg";
import starfish from "../../assets/icons/starfish.svg";
import swan from "../../assets/icons/swan.svg";
import { LeafIcon } from "lucide-react";
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
        ...prevData,
        [name]: value,
    }));
};
const handleSubmit = (e) => {
  e.preventDefault();
  if (formData.username.trim() !== "") {
    localStorage.setItem("username", formData.username.trim());
    localStorage.setItem("avatar", formData.iconName+".svg"); 
    console.log(formData.icon)
    navigate("/room");
  } else {
    alert("Please enter a username");
  }
};

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
        <div className="registerwhole">
          <div className="register-container">
<Form onSubmit={handleSubmit}>
                <Form.Group controlId="username">
                    <Form.Label>Username:</Form.Label>
                    <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                        required
                    />
                </Form.Group>
                  <Form.Group controlId="icon">
    <Form.Label>Select an Avatar:</Form.Label>
    <div className="icon-grid">
     {icons.map((icon, index) => (
  <img
    key={index}
    src={icon.src}
    alt={icon.name}
    width={50}
    onClick={() =>
      setFormData((prev) => ({
        ...prev,
        icon: icon.src,
        iconName: icon.name,
      }))
    }
    style={{
      border: formData.iconName === icon.name ? "2px solid #6fafff" : "none",
      borderRadius: "8px",
      cursor: "pointer",
      margin: "5px"
    }}
  />
))}
    </div>
    {formData.iconName && (
  <p style={{ marginTop: "10px", color: "white" }}>
    Selected Icon: <strong>{formData.iconName}</strong>
  </p>
)}

  </Form.Group>
                <Button variant="primary" type="submit">
                    Play
                </Button>
            </Form>
          </div>
        </div>
       
      </div>
    </div>
  );
};

export default HomePage;
