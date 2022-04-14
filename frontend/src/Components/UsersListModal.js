import React from 'react';
import { Button, Card, Col, Image, Modal, Row } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';

function UsersListModal(props) {


    return (
        <Modal show={props.show} onHide={props.handleClose} fullscreen="sm-down" keyboard>
            <Modal.Header closeButton>
                <Modal.Title>Followers</Modal.Title>
            </Modal.Header>
            <Modal.Body className='row d-flex justify-content-center'>
                {props.list?.map((item) => {
                    return (
                        <ProfileBox
                            key={item._id}
                            name={item.name}
                            username={item.username}
                            userId={item._id}
                            imgUrl={item.profileImage}
                        />
                    )
                })}
            </Modal.Body>
        </Modal>
    )
}



function ProfileBox(props) {

    const navigate = useNavigate();

    const handleViewProfile = () => {
        if (props.userId === window.localStorage.getItem("userId")) {
            navigate("/profile");
        } else {
            navigate(`/user-profile/${props.username}`, { state: { userId: props.userId } });
        }
    }

    return (
        <Card bg="dark" text="light" style={{ maxWidth: 400, borderWidth: 0, margin: 2 }}>
            <Card.Body>
                <Row>
                    <Col xs={10} className="py-1">
                        <div className="d-flex justify-content-start align-items-center">
                            <Image
                                src={props.imgUrl}
                                style={{ height: 50, width: 50, objectFit: 'fill' }}
                                fluid
                                roundedCircle
                            />
                            <div className='mx-2'>
                                <h6>{props.name}</h6>
                                <p style={{ marginTop: -10, marginBottom: 0, color: 'lime', fontFamily: 'monospace' }}>@{props.username}</p>
                            </div>
                        </div>
                    </Col>
                    <Col xs={2} className="d-flex justify-content-end align-self-center">
                        <Button className="shadow-none" variant='outline-primary' onClick={handleViewProfile}>View</Button>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}


export default UsersListModal