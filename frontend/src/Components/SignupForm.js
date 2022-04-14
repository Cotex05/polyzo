import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, InputGroup, Spinner, Stack } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom"

// Auth Requirements
import { useAuth } from '../Context/authContext';


function SignupForm() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [validated, setValidated] = useState(true);
    const [signing, setSigning] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { state } = useLocation();

    const { signUp, signInWithGoogle } = useAuth();

    const passwordValidator = () => {
        if (confirmPassword === password && confirmPassword.length !== 0) {
            setValidated(false);
        } else {
            setValidated(true);
        }
    }

    useEffect(() => {
        passwordValidator();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [confirmPassword, password]);

    const register = async (e) => {
        e.preventDefault();
        setSigning(true);
        try {
            setError("");
            await signUp(email.toLocaleLowerCase(), password);
            navigate(state?.path || "/edit-profile", { state: { newUser: true }, replace: true });
        } catch (err) {
            setSigning(false);
            setError(err.message);
        }
    };

    const registerWithGoogle = () => {
        signInWithGoogle().then(() => {
            navigate(state?.path || "/edit-profile", { state: { newUser: true }, replace: true });
        }).catch((err) => {
            setError(err);
        })
    }

    return (
        <div>
            <Form onSubmit={register}>
                {error.length > 0 ? <Alert variant='danger'><h6>{error}</h6></Alert> : null}
                <Form.Group className="mb-2" controlId="formBasicEmail">
                    <Form.Label style={{ color: '#eee' }}>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter Email"
                        required
                        autoFocus
                        value={email.toLocaleLowerCase()}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-2" controlId="formBasicPassword">
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
                <Form.Group className="mb-3" controlId="formConfirmPassword">
                    <Form.Label style={{ color: '#eee' }}>Confirm Password</Form.Label>
                    <InputGroup>
                        <Form.Control
                            type="password"
                            placeholder="Confirm Password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <InputGroup.Text>{!validated ? '✅' : '❌'}</InputGroup.Text>
                    </InputGroup>
                </Form.Group>
                <Stack className="col-md-6 mx-auto gap-2">
                    <Button
                        variant="primary"
                        disabled={validated}
                        type="submit"
                    >
                        {signing ? (<Spinner animation="grow" variant="light" />) : "Signup"}
                    </Button>
                    <a style={{ color: '#eee', alignSelf: 'center' }} href="/login">Already have an account!</a>
                    <h4 style={{ color: '#eee' }} className='mx-auto'>or</h4>
                    <Button onClick={registerWithGoogle} variant="danger">
                        {signing ? (<Spinner animation="grow" variant="light" />) : "Signup with Google"}
                    </Button>
                </Stack>
            </Form>
        </div>
    );
}

export default SignupForm;
