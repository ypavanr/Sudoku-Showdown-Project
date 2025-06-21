import React from "react";
import "./About.css";
import "../modes/room.css"
function About(){
    return(<div className="room-wrapper">
        <div className="room-card">
        <h1 className="room-title">Meet the Developers of the Webite :</h1>
    <br></br>
    <h2>Vibha Shankar Rao</h2>
    <div className="room-subtitle">
    <p>2nd Year Information Science and Engineering</p>
    <p>Dayanand Sagar College of Engineering , Bangalore</p>
    <p>Email : vibhass@gmail.com</p>
    <br></br>
    </div>
    <h2>Y Pavan Reddy</h2>
     <div className="room-subtitle">
    <p>2nd Year Information Science and Engineering</p>
    <p>Dayanand Sagar College of Engineering , Bangalore</p>
    <p>Email : pavanss@gmail.com</p>
    </div>
    </div>
    </div>
);
}

export default About;