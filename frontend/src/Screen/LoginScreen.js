import React from 'react';
import { Container } from "react-bootstrap";

//Stylying Headers import
import 'bootstrap/dist/css/bootstrap.min.css';

//Components
import LoginForm from '../Components/LoginForm';

function LoginScreen() {
    return (
        <div style={{ height: "100vh", overflow: 'hidden' }} className="bg">
            <Container>
                <Container className="box">
                    <LoginForm />
                </Container>
            </Container>
        </div>
    )
}

export default LoginScreen;



