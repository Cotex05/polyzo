import React from 'react';
import { Container } from "react-bootstrap";

//Stylying Headers import
import 'bootstrap/dist/css/bootstrap.min.css';

//Components
import SignupForm from '../Components/SignupForm';

function SignupScreen() {
    return (
        <div style={{ height: "100vh", overflow: 'hidden' }} className="bg">
            <Container>
                <Container className="box">
                    <SignupForm />
                </Container>
            </Container>
        </div>
    )
}
export default SignupScreen;
