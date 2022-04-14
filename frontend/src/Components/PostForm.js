import React, { useState } from 'react';
import { Button, Form, Image, Modal, Spinner, Stack } from "react-bootstrap";
import { api } from '../API/API';
import { useAuth } from '../Context/authContext';

function PostForm(props) {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const { currentUser, uploadPostPhoto } = useAuth();

    // eslint-disable-next-line no-unused-vars
    const [photo, setPhoto] = useState(null);
    const [img, setImg] = useState(null);

    const [submitStatus, setSubmitStatus] = useState(false);
    const [posted, setPosted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus(true);

        if (photo) {
            await uploadPostPhoto(photo).then((url) => {
                uploadPost(url)
                setTimeout(() => {
                    setSubmitStatus(false);
                    setPosted(true);
                }, 1000);
                setTimeout(() => {
                    window.location.reload();
                    // navigate("/profile", { replace: true });
                }, 3000);
            });
        } else {
            uploadPost("none")
            setTimeout(() => {
                setSubmitStatus(false);
                setPosted(true);
            }, 1000);
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        }
    }

    const uploadPost = async (imgUri) => {
        const token = await currentUser.getIdToken();
        await api.post("/post/add", {
            postTitle: title,
            postDesc: description,
            postedBy: window.localStorage.getItem("userId"),
            imgUrl: imgUri
        }, { 'headers': { 'Authorization': `Bearer ${token}` } });
    }

    return (
        <Modal onExit={() => setImg(null)} show={props.show} onHide={props.handleClose} fullscreen="sm-down" keyboard>
            <Modal.Header closeButton>
                <Modal.Title>New Post</Modal.Title>
            </Modal.Header>
            <Modal.Body className='row d-flex justify-content-center'>
                <Form onSubmit={handleSubmit}>
                    <Stack className='col-6 mx-auto gap-2'>
                        <Image src={img ? img : "https://cdn.dribbble.com/users/34020/screenshots/3993396/otp_icon_upload.gif"} style={{ width: 300, height: 200, alignSelf: 'center' }} fluid />
                    </Stack>
                    <Form.Group controlId="formFile" className="mb-2">
                        <Form.Label>Add Image</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={(e) => { setPhoto(e.target.files[0]); setImg(URL.createObjectURL(e.target.files[0])) }}
                        />
                    </Form.Group>
                    <Form.Group controlId="formBasicName" className="mb-2">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            className='shadow-none'
                            type="text"
                            maxLength={50}
                            placeholder="Write a good title for the post"
                            required
                            autoComplete='off'
                            size='md'
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicAbout">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            className='shadow-none'
                            style={{ fontFamily: 'cursive', minHeight: 100, maxHeight: 250 }}
                            type="text"
                            placeholder="Write something about this post..."
                            value={description}
                            as="textarea"
                            maxLength={400}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>
                    <Stack className="col-md-6 mx-auto gap-2">
                        {posted ? <lottie-player src="https://assets9.lottiefiles.com/packages/lf20_asxyfflm.json" background="transparent" speed="3" style={{ width: 200, height: 100 }} autoplay></lottie-player>
                            :
                            (<>
                                <Button type="submit" variant="primary" className="shadow-none" disabled={submitStatus}>
                                    {!submitStatus ? 'Post' : <Spinner animation="border" variant="dark" />}
                                </Button>
                                <Button type="button" variant='outline-clear-dark' className='shadow-none' onClick={props.handleClose}>
                                    Cancel
                                </Button>
                            </>)
                        }
                    </Stack>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default PostForm;
