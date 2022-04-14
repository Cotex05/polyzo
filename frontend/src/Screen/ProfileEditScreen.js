import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Image, InputGroup, Modal, Spinner, Stack } from "react-bootstrap";
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/authContext';
import { api } from '../API/API';

export default function ProfileEditScreen() {

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [about, setAbout] = useState("");

    const [photo, setPhoto] = useState();
    const [profileImg, setProfileImg] = useState(null);

    const [showModal, setShowModal] = useState(true);
    const [submitStatus, setSubmitStatus] = useState(false);
    const [error, setError] = useState(false);
    const [formError, setFormError] = useState({ error: false, msg: "" });
    const [fetching, setFetching] = useState(true);

    var conflictUsername = false;

    const { createProfile, updateUserProfile, currentUser, validateUsername, uploadPhoto, fetchProfile } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus(true);
        setFormError({ error: false, msg: "" });
        setError(false);
        if (username.trim().length < 3 || name.trim().length < 3) {
            setFormError({ error: true, msg: "Name and username must have atleast 3 characters!" });
            setSubmitStatus(false);
            return;
        }
        usernameCheck().then(() => {
            if (conflictUsername) {
                setSubmitStatus(false);
                return;
            }
            setSubmitStatus(true);
            createProfile(name, username.toLocaleLowerCase(), about).then(() => {

                // To mongo db
                addOrUpdateUser();

                if (photo) {
                    uploadPhoto(photo).then(() => {
                        updateUserProfile(name);
                        // to mongo db
                        addProfilePhoto(currentUser.photoURL);
                        setTimeout(() => {
                            setShowModal(false);
                            navigate("/profile", { replace: true });
                        }, 3000);
                    })
                } else {
                    updateUserProfile(name);
                    setTimeout(() => {
                        setShowModal(false);
                        navigate("/profile", { replace: true });
                    }, 3000);
                }
            });
        })
    }

    // mongo db
    const addOrUpdateUser = async () => {
        const token = await currentUser.getIdToken();
        const response = await api.post("/user/add", {
            name: name,
            username: username.toLocaleLowerCase(),
            email: currentUser.email,
            about: about
        }, { 'headers': { 'Authorization': `Bearer ${token}` } });
        window.localStorage.setItem("userId", response.data._id);
    }

    // mongo db
    const addProfilePhoto = async (imgUri) => {
        const token = await currentUser.getIdToken();
        await api.post("user/addProfilePhoto", {
            email: currentUser.email,
            imgUrl: imgUri
        }, { 'headers': { 'Authorization': `Bearer ${token}` } });
    }

    const usernameCheck = async () => {
        try {
            const querySnap = await validateUsername(username.toLocaleUpperCase());
            await querySnap.forEach((doc) => {
                if (doc.id !== currentUser.email) {
                    setError(true);
                    conflictUsername = true;
                }
            })
        } catch (error) {
            console.error(error);
        }
    }


    const fetchProfileData = async () => {
        if (location?.state?.newUser) {
            setFetching(false);
        }
        try {
            const docSnap = await fetchProfile();
            const data = docSnap.data();
            setAbout(data.about);
            setUsername(data.username);
            setName(currentUser.displayName);
            setFetching(false);
        } catch (e) {
            console.error(e.message);
        }
    }

    useEffect(() => {
        fetchProfileData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const navBack = () => {
        window.history.back();
    }

    return (
        <Modal show={showModal} fullscreen="sm-down">
            <Modal.Header>
                {!formError.error ? <Modal.Title>Update Profile</Modal.Title> :
                    <Alert dismissible variant="danger" onClose={() => setFormError({ error: false, msg: "" })}>
                        <Alert.Heading>Please fill the details</Alert.Heading>
                        <p>
                            {formError.msg}
                        </p>
                    </Alert>}
            </Modal.Header>
            <Modal.Body className='row d-flex justify-content-center'>
                {fetching ?
                    (<lottie-player src="https://assets10.lottiefiles.com/private_files/lf30_LOw4AL.json" background="transparent" speed="1" style={{ width: 400, height: 300 }} loop autoplay>
                    </lottie-player>)
                    : <Form onSubmit={handleSubmit}>
                        <Stack className='col-6 mx-auto gap-2'>
                            <Image src={!profileImg ? (currentUser?.photoURL ? currentUser?.photoURL : "https://i.imgur.com/qlBdn0Q.png") : profileImg} style={{ width: 100, height: 100, alignSelf: 'center', objectFit: 'contain' }} roundedCircle fluid />
                            <h6 style={{ color: '#333', fontFamily: 'monospace', alignSelf: 'center' }}>{currentUser.email}</h6>
                        </Stack>
                        <Form.Group controlId="formFile" className="mb-2">
                            <Form.Label>Upload Profile Photo</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={(e) => { setPhoto(e.target.files[0]); setProfileImg(URL.createObjectURL(e.target.files[0])) }}
                            />
                        </Form.Group>
                        <Form.Group controlId="formBasicName" className="mb-2">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                className='shadow-none'
                                type="text"
                                pattern='^[a-zA-Z\s]*'
                                maxLength={40}
                                title="Only alphabets are allowed!"
                                placeholder={"Enter your name"}
                                required
                                autoComplete='off'
                                size='md'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2" controlId="formBasicUsername">
                            <InputGroup>
                                <InputGroup.Text id="basic-@">@</InputGroup.Text>
                                <Form.Control
                                    className='shadow-none'
                                    type="text"
                                    pattern="^[a-z0-9_]*"
                                    maxLength={30}
                                    title="Only smallcase alphanumeric are allowed!"
                                    placeholder={"username"}
                                    required
                                    autoComplete='off'
                                    size="sm"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </InputGroup>
                            <Form.Text>
                                {!error ? "Username must be unique" : (<p style={{ color: 'red' }}>username already taken!</p>)}
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicAbout">
                            <Form.Label>About</Form.Label>
                            <Form.Control
                                className='shadow-none'
                                style={{ fontFamily: 'cursive', minHeight: 100, maxHeight: 250 }}
                                type="text"
                                placeholder="Write something about yourself"
                                value={about}
                                as="textarea"
                                maxLength={200}
                                onChange={(e) => setAbout(e.target.value)}
                            />
                        </Form.Group>
                        <Stack className="col-md-6 mx-auto gap-2">
                            <Button type="submit" variant="dark" className="shadow-none" disabled={submitStatus}>
                                {!submitStatus ? 'Save' : <Spinner animation="border" variant="primary" />}
                            </Button>
                            <Button type="button" variant='outline-clear-dark' className='shadow-none' onClick={navBack}>
                                Back to profile
                            </Button>
                        </Stack>
                    </Form>}
            </Modal.Body>
            {submitStatus ? <lottie-player src="https://assets7.lottiefiles.com/temp/lf20_xYfV1x.json" background="transparent" speed="1" style={styles.updateAnimation} loop autoplay></lottie-player> : null}
        </Modal>
    )
}

const styles = {
    updateAnimation: {
        width: 400,
        height: 400,
        position: 'absolute',
        alignSelf: 'center',
        display: 'flex',
        marginTop: "20vh"
    }
}
