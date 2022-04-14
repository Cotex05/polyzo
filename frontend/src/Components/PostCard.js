import React, { useEffect, useState } from "react";

import { Button, Card, Col, Image, Row, Dropdown, Alert } from "react-bootstrap";
import { AiFillHeart } from 'react-icons/ai';
import { CgMoreVertical } from 'react-icons/cg';
import { api } from "../API/API";
import { useAuth } from "../Context/authContext";


function PostCard(props) {

    const [like, setLike] = useState({ color: 'gray', count: Number(props.likeCount) });

    const [showAlert, setShowAlert] = useState({ show: false, msg: "", url: "" });

    const handleLike = () => {
        if (like.color === 'gray') {
            setLike({ color: 'lime', count: like.count + 1 });
            addLike();
        }
        else {
            setLike({ color: 'gray', count: like.count - 1 });
            removeLike();
        }
    }


    const isLiked = async () => {
        const token = await currentUser.getIdToken();
        const userId = window.localStorage.getItem("userId");
        const postId = props.postId;
        const response = await api.get(`/post/isLiked/${postId}`, { 'params': { 'userId': userId }, 'headers': { 'Authorization': `Bearer ${token}` } });
        if (response.data.liked === true) {
            setLike({ color: 'lime', count: like.count });
        } else {
            setLike({ color: 'gray', count: like.count });
        }
    }

    useEffect(() => {
        isLiked();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const { currentUser, deletePostPhoto } = useAuth();

    const addLike = async () => {
        const token = await currentUser.getIdToken();
        const userId = window.localStorage.getItem("userId");
        const postId = props.postId;
        await api.put(`/post/addLike/${postId}`, {}, { 'params': { 'userId': userId }, 'headers': { 'Authorization': `Bearer ${token}` } });
    }

    const removeLike = async () => {
        const token = await currentUser.getIdToken();
        const userId = window.localStorage.getItem("userId");
        const postId = props.postId;
        await api.delete(`/post/removeLike/${postId}`, { 'params': { 'userId': userId }, 'headers': { 'Authorization': `Bearer ${token}` } });
    }

    const handlePostDelete = async () => {
        const token = await currentUser.getIdToken();
        const userId = window.localStorage.getItem("userId");
        const postId = props.postId;
        await api.delete(`/post/delete/${postId}?userId=${userId}`, { 'headers': { 'Authorization': `Bearer ${token}` } });
        setShowAlert({ show: true, msg: "Post Deleted!", url: "https://assets10.lottiefiles.com/packages/lf20_yelefni1.json" })
        deletePostPhoto(props.src)
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }

    const handlePostReport = async () => {
        setShowAlert({ show: true, msg: "Post Reported!", url: "https://assets9.lottiefiles.com/packages/lf20_p7ki6kij.json" })
    }

    const [ellipsis, setEllipsis] = useState({ overflow: "hidden", lines: 3 })

    const handleDescEllipsis = () => {
        if (ellipsis.overflow === "hidden")
            setEllipsis({ overflow: "visible", lines: 15 });
        else
            setEllipsis({ overflow: "hidden", lines: 3 });
    }

    return (
        <div className="d-flex align-items-center">
            <div className="d-flex justify-content-center mx-auto">
                {showAlert.show ? <Alert show={showAlert.show} variant="success">
                    {showAlert.msg}
                    <p>
                        <lottie-player src={showAlert.url} background="transparent" speed="0.5" style={{ width: 300, height: 300 }} autoplay></lottie-player>
                    </p>
                </Alert> :
                    <Card style={{
                        maxWidth: '30rem',
                        width: 'auto',
                        borderWidth: 20,
                        borderStyle: 'groove',
                        borderColor: '#1f1e1e'
                    }}
                        bg="dark"
                        text="light"
                    >
                        <Card.Header style={{ zIndex: 2, backgroundColor: 'rgba(0,0,0,1)' }}>
                            <Row>
                                <Col xs={10} className="py-1">
                                    <div className="d-flex justify-content-start align-items-center">
                                        <Image
                                            src={props.profilePhoto}
                                            style={{ height: 50, width: 50, objectFit: 'contain' }}
                                            fluid
                                            roundedCircle
                                        />
                                        <div className='mx-2'>
                                            <h6 style={{ minWidth: "16rem" }}>{props.name}</h6>
                                            <p style={{ marginTop: -10, marginBottom: 0, color: 'rgb(200,200,200)', fontFamily: 'monospace' }}>{props.date}</p>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={2} className="d-flex justify-content-end align-self-center">
                                    <Dropdown>
                                        <Dropdown.Toggle id="dropdown-menu" variant="clear-light" className="shadow-none" bsPrefix="p-0">
                                            <CgMoreVertical size={20} color='#eee' />
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu variant='dark' style={{ backgroundColor: '#000' }}>
                                            <Dropdown.Item>Hide</Dropdown.Item>
                                            {window.localStorage.getItem("userId") === props.userId ? (<Dropdown.Item onClick={handlePostDelete}>Delete</Dropdown.Item>) : (<Dropdown.Item onClick={handlePostReport}>Report</Dropdown.Item>)}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Col>
                            </Row>
                        </Card.Header>
                        {props.src !== "none" ? <Card.Img
                            variant="top"
                            src={props.src}
                            style={{ marginTop: 0, height: 'auto', maxHeight: 350, objectFit: 'contain', backgroundColor: '#000' }}
                        /> : null}
                        <Card.Body style={{ backgroundColor: "#000" }}>
                            <Card.Title style={{ color: '#eee', fontFamily: 'serif', fontWeight: 'bold', marginTop: -5 }}>{props.title}</Card.Title>
                            <Card.Text
                                className="text-muted"
                                onClick={handleDescEllipsis}
                                style={{
                                    fontFamily: 'cursive',
                                    padding: 2,
                                    borderRadius: 10,
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: `${ellipsis.lines}`,
                                    overflow: `${ellipsis.overflow}`,
                                    textOverflow: 'ellipsis',
                                }}>
                                {props.description}
                            </Card.Text>
                        </Card.Body>
                        <Card.Footer style={{ backgroundColor: '#000', marginTop: -10 }}>
                            <Row>
                                <Col xs={8}>
                                    <div className="d-flex justify-content-start">
                                        <Button onClick={handleLike} variant="clear" className='shadow-none'><AiFillHeart size={25} fill={like.color} /></Button>
                                        <h6 className='text-muted align-self-center my-auto'>{like.count} Likes</h6>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>}
            </div>
            <br />
        </div>
    );
}


export default PostCard;
