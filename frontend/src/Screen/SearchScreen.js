import React, { useEffect, useState } from 'react';
import { Button, Card, Carousel, Col, Container, Form, FormControl, Image, InputGroup, Row } from 'react-bootstrap';

import { ImSearch } from "react-icons/im";
import "animate.css";
import "../App.css";

import { api } from '../API/API';
import { useAuth } from '../Context/authContext';
import { useNavigate } from 'react-router-dom';

function SearchScreen() {

    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchMode, setSearchMode] = useState(false);
    const [profiles, setProfiles] = useState();

    const { currentUser } = useAuth();

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchMode(true);
        setSearching(true);
        const token = await currentUser.getIdToken();
        const result = await api.get(`/user/search/${query}`, { 'headers': { 'Authorization': `Bearer ${token}` } })
        setProfiles(result.data);
        setSearching(false);
    }

    return (
        <div style={{ display: 'flex', backgroundColor: '#000', minHeight: '100vh' }}>
            <Container style={{ maxWidth: 800, marginTop: 25 }} fluid='md'>
                <Container style={{ paddingTop: 25, paddingBottom: 25, marginTop: '10%' }}>
                    <Form onSubmit={handleSearch}>
                        <InputGroup className="mb-3 animate__animated animate__rotateInDownLeft">
                            <FormControl
                                placeholder="Search by username/name"
                                aria-label="Search"
                                aria-describedby="basic-addon2"
                                type='text'
                                required
                                autoComplete='off'
                                size='md'
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                style={{ borderRadius: 20, fontFamily: 'monospace', fontWeight: 'bold' }}
                            />
                            <Button variant="clear-light" id="button-addon2" className='shadow-none' type="submit">
                                <ImSearch color='#eee' />
                            </Button>
                        </InputGroup>
                    </Form>
                </Container>
                {searchMode ?
                    <Container className="col-md-6 mx-auto justify-content-center">
                        {searching ?
                            (<lottie-player src="https://assets10.lottiefiles.com/private_files/lf30_LOw4AL.json" background="transparent" speed="1" style={{ width: 400, height: 300 }} loop autoplay>
                            </lottie-player>) :
                            profiles.map((item) => {
                                return (
                                    <ProfileBox key={item._id} imgUrl={item.profileImage} name={item.name} username={item.username} userId={item._id} />
                                )
                            })}
                    </Container> :
                    <CrouselCard />}
            </Container>
        </div>
    )
}

// eslint-disable-next-line no-unused-vars
function CrouselCard() {

    const { currentUser } = useAuth();

    const [trendingPostData, setTrendingPostData] = useState([]);

    const getTrendingPosts = async () => {
        const token = await currentUser.getIdToken();
        const response = await api.get(`/post/trending`, { 'params': { 'skip': 0 }, 'headers': { 'Authorization': `Bearer ${token}` } });
        if (response.data[0]?._id)
            setTrendingPostData(response.data);
    }

    useEffect(() => {
        getTrendingPosts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return (
        <Carousel indicators={false} style={{ height: '30rem', marginTop: 30, width: 'auto' }} className="animate__animated animate__zoomIn animate__delay-2s">
            {trendingPostData?.map((item) => {

                return (
                    <Carousel.Item interval={4000} key={item._id}>

                        <img
                            className="d-block w-100"
                            style={{ borderRadius: 20, height: '25rem', objectFit: 'contain' }}
                            src={item.imgUrl !== "none" ? item.imgUrl : "https://source.unsplash.com/random/?world,nature"}
                            alt="First slide"
                        />
                    </Carousel.Item>
                )
            })}

        </Carousel>
    );
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
        <Card bg="dark" text="light" style={{ maxWidth: 400, borderRadius: 12, margin: 12 }}>
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

export default SearchScreen;
