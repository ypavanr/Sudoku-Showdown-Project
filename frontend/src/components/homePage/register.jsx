import { useState } from "react";
import { Form, Button } from 'react-bootstrap';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Background from '../features/Background';

export default function Register() {
    const navigate = useNavigate();
const [formData,setFormData]=useState({
    email:'',
    username:'',
    password:'',
});
const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
        ...prevData,
        [name]: value,
    }));
};
const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const response = await axios.post('http://localhost:3000/auth/register', formData);

        if (response.status === 201) {
            console.log(response.data);
            alert( response.data.message);
             navigate('/login');
        } else {
            alert('Registration failed: ' + response.data.message);
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert(error.response?.data?.message||"error occured");
    }
};
return(
    <>
    <Background />
      <div className="registerwhole">
        <div className="register-container">
            <p>REGISTER PAGE</p>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="name">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />
                </Form.Group>
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
                <Form.Group controlId="password">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
        </div>
      </div>
    </>
)
}