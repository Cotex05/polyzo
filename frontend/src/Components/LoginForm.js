import React, { useState } from 'react';
import { Alert, Button, Form, Spinner, Stack } from "react-bootstrap";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/authContext';


function LoginForm() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [signing, setSigning] = useState(false);

    const navigate = useNavigate();
    const { state } = useLocation();

    const { logIn, signInWithGoogle } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setSigning(true);
        try {
            setError("");
            await logIn(email.toLocaleLowerCase(), password);
            navigate(state?.path || "/profile", { replace: true });
        } catch (err) {
            setSigning(false);
            setError(err.message);
            console.log(err.code);
        }
    }


    const SigninWithGoogle = () => {
        signInWithGoogle().then(() => {
            navigate(state?.path || "/edit-profile", { state: { newUser: true }, replace: true });
        }).catch((err) => {
            setError(err);
        })
    }


    return (
        <div>
            <Form onSubmit={handleLogin}>
                {error.length > 0 ? <Alert variant='danger'><h6>{error}</h6></Alert> : null}
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label style={{ color: '#eee' }}>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter Email"
                        required
                        autoFocus
                        value={email.toLocaleLowerCase()}
                        onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label style={{ color: '#eee' }}>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Form.Text style={{ color: 'rgba(250,250,250,0.5)' }}>
                        Note: Password must contain atleast 8 characters
                    </Form.Text>
                </Form.Group>
                <Stack className="gap-2 col-md-6 mx-auto">
                    <Button variant="primary" type="submit">
                        {signing ? (<Spinner animation="grow" variant="light" />) : "Login"}
                    </Button>
                    <a style={{ color: '#eee', alignSelf: 'center' }} href="signup">New User? Signup Now!</a>
                    <h4 style={{ color: '#eee' }} className='mx-auto'>or</h4>
                    <Button onClick={SigninWithGoogle} variant="danger">
                        {signing ? (<Spinner animation="grow" variant="light" />) : "Signin with Google"}
                    </Button>
                </Stack>
            </Form>
        </div>
    );
}

export default LoginForm;
