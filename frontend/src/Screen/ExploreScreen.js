import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Image,
  Modal,
  Nav,
  Row,
  Spinner,
  Tab,
} from "react-bootstrap";
import { AiFillHeart, AiFillPlusCircle } from "react-icons/ai";
import { CgMoreVertical } from "react-icons/cg";
import { FaEthereum } from "react-icons/fa";

import "../App.css";
import "animate.css";
import PostForm from "../Components/PostForm";
import { useAuth } from "../Context/authContext";
import { api } from "../API/API";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import Web3 from "../Web3";

export default function ExploreScreen() {
  const { currentUser } = useAuth();

  const [viewPostModal, setViewPostModal] = useState(false);
  const [latestPostData, setLatestPostData] = useState([]);
  const [trendingPostData, setTrendingPostData] = useState([]);
  const [circlePostData, setCirclePostData] = useState([]);

  const [latestSkips, setLatestSkips] = useState(0);
  const [trendingSkips, setTrendingSkips] = useState(0);
  const [circleSkips, setCircleSkips] = useState(0);

  const handleClose = () => {
    setViewPostModal(false);
  };

  const getLatestPosts = async () => {
    const token = await currentUser.getIdToken();
    setLatestSkips(latestSkips + 10);
    const response = await api.get(`/post/latest`, {
      params: { skip: latestSkips },
      headers: { Authorization: `Bearer ${token}` },
    });
    setLatestPostData((prevData) => [...prevData, ...response.data]);
  };

  const getTrendingPosts = async () => {
    const token = await currentUser.getIdToken();
    const response = await api.get(`/post/trending`, {
      params: { skip: trendingSkips },
      headers: { Authorization: `Bearer ${token}` },
    });
    setTrendingSkips(trendingSkips + 10);
    setTrendingPostData((prevData) => [...prevData, ...response.data]);
  };

  const getCirclePosts = async () => {
    const token = await currentUser.getIdToken();
    const userId = window.localStorage.getItem("userId");
    const response = await api.get(`/post/circle/${userId}`, {
      params: { skip: circleSkips },
      headers: { Authorization: `Bearer ${token}` },
    });
    setCircleSkips(circleSkips + 10);
    setCirclePostData((prevData) => [...prevData, ...response.data]);
  };

  const listInnerRef1 = useRef();
  const listInnerRef2 = useRef();
  const listInnerRef3 = useRef();

  const onScroll1 = () => {
    if (listInnerRef1.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef1.current;
      const scrollPos = scrollTop + clientHeight - scrollHeight;
      if (Math.ceil(scrollPos) === 0) {
        // TO SOMETHING HERE
        console.log("Reached bottom 1");
        getLatestPosts();
      }
    }
  };

  const onScroll2 = () => {
    if (listInnerRef2.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef2.current;
      const scrollPos = scrollTop + clientHeight - scrollHeight;
      if (Math.ceil(scrollPos) === 0) {
        // TO SOMETHING HERE
        console.log("Reached bottom 2");
        getTrendingPosts();
      }
    }
  };

  const onScroll3 = () => {
    if (listInnerRef3.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef3.current;
      const scrollPos = scrollTop + clientHeight - scrollHeight;
      if (Math.ceil(scrollPos) === 0) {
        // TO SOMETHING HERE
        console.log("Reached bottom 3");
        getCirclePosts();
      }
    }
  };

  useEffect(() => {
    getLatestPosts();
    getTrendingPosts();
    getCirclePosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PostForm show={viewPostModal} handleClose={handleClose} />
      <div
        style={{ display: "flex", backgroundColor: "#111", height: "100vh" }}
      >
        <Container style={{ maxWidth: 1000, marginTop: 40 }} fluid="xl">
          <Tab.Container id="left-tabs" defaultActiveKey="first">
            <Row>
              <Col>
                <Tab.Content>
                  <Tab.Pane eventKey="first">
                    <div
                      className="scrollHider"
                      onScroll={() => onScroll1()}
                      ref={listInnerRef1}
                      style={{
                        height: "85vh",
                        overflowY: "scroll",
                        position: "relative",
                        scrollSnapType: "y mandatory",
                      }}
                    >
                      {latestPostData?.map((item) => {
                        const isoDate = item.updatedAt;
                        const dt = moment.utc(isoDate).format("MMM DD");
                        return (
                          <PostCard
                            key={item._id}
                            postId={item._id}
                            src={item.imgUrl}
                            title={item.postTitle}
                            description={item.postDesc}
                            name={item.postedBy.name}
                            userId={item.postedBy._id}
                            username={item.postedBy.username}
                            profilePhoto={item.postedBy.profileImage}
                            address={item.postedBy.ethereumAddress}
                            date={dt}
                            likeCount={Number(item.likes)}
                          />
                        );
                      })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="second">
                    <div
                      className="scrollHider"
                      onScroll={() => onScroll2()}
                      ref={listInnerRef2}
                      style={{
                        height: "85vh",
                        overflowY: "scroll",
                        position: "relative",
                        scrollSnapType: "y mandatory",
                      }}
                    >
                      {trendingPostData?.map((item) => {
                        const isoDate = item.updatedAt;
                        const dt = moment.utc(isoDate).format("MMM DD");
                        return (
                          <PostCard
                            key={item._id}
                            postId={item._id}
                            src={item.imgUrl}
                            title={item.postTitle}
                            description={item.postDesc}
                            name={item.postedBy.name}
                            userId={item.postedBy._id}
                            username={item.postedBy.username}
                            profilePhoto={item.postedBy.profileImage}
                            address={item.postedBy.ethereumAddress}
                            date={dt}
                            likeCount={Number(item.likes)}
                          />
                        );
                      })}
                    </div>
                  </Tab.Pane>
                  <Tab.Pane eventKey="third">
                    <div
                      className="scrollHider"
                      onScroll={() => onScroll3()}
                      ref={listInnerRef3}
                      style={{
                        height: "85vh",
                        overflowY: "scroll",
                        position: "relative",
                        scrollSnapType: "y mandatory",
                      }}
                    >
                      {circlePostData?.map((item) => {
                        const isoDate = item.updatedAt;
                        const dt = moment.utc(isoDate).format("MMM DD");
                        return (
                          <PostCard
                            key={item._id}
                            postId={item._id}
                            src={item.imgUrl}
                            title={item.postTitle}
                            description={item.postDesc}
                            name={item.postedBy.name}
                            userId={item.postedBy._id}
                            username={item.postedBy.username}
                            profilePhoto={item.postedBy.profileImage}
                            address={item.postedBy.ethereumAddress}
                            date={dt}
                            likeCount={Number(item.likes)}
                          />
                        );
                      })}
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
            <Nav
              className="fixed-bottom d-flex justify-content-center mx-auto py-2"
              variant="pills"
              style={{ width: "auto", backgroundColor: "rgba(0,0,0,0.6)" }}
            >
              <Nav.Item
                className="mx-2"
                style={{ backgroundColor: "#eee", borderRadius: 5 }}
              >
                <Nav.Link eventKey="first" type="button">
                  Home
                </Nav.Link>
              </Nav.Item>
              <Nav.Item
                className="mx-2"
                style={{ backgroundColor: "#eee", borderRadius: 5 }}
              >
                <Nav.Link eventKey="second" type="button">
                  Trending
                </Nav.Link>
              </Nav.Item>
              <Nav.Item
                className="mx-2"
                style={{ backgroundColor: "#eee", borderRadius: 5 }}
              >
                <Nav.Link eventKey="third" type="button">
                  Circle
                </Nav.Link>
              </Nav.Item>
              <Button
                type="button"
                variant="clear-light"
                style={{
                  position: "absolute",
                  bottom: 20,
                  right: 0,
                  zIndex: 1000,
                }}
                className="shadow-none"
                onClick={() => setViewPostModal(true)}
              >
                <AiFillPlusCircle size={50} color="#fff" />
              </Button>
            </Nav>
          </Tab.Container>
        </Container>
      </div>
    </div>
  );
}

function PostCard(props) {
  const navigate = useNavigate();

  const [like, setLike] = useState({
    color: "gray",
    count: Number(props.likeCount),
  });

  const [transactionProcess, setTransactionProcess] = useState(false);
  const [transaction, setTransaction] = useState();

  const [show, setShow] = useState(false);

  const [showAlert, setShowAlert] = useState({ show: false, msg: "", url: "" });

  const handleLike = () => {
    if (like.color === "gray") {
      setLike({ color: "lime", count: like.count + 1 });
      addLike();
    } else {
      setLike({ color: "gray", count: like.count - 1 });
      removeLike();
    }
  };

  const { currentUser } = useAuth();

  const addLike = async () => {
    const token = await currentUser.getIdToken();
    const userId = window.localStorage.getItem("userId");
    const postId = props.postId;
    await api.put(
      `/post/addLike/${postId}`,
      {},
      {
        params: { userId: userId },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  const removeLike = async () => {
    const token = await currentUser.getIdToken();
    const userId = window.localStorage.getItem("userId");
    const postId = props.postId;
    await api.delete(`/post/removeLike/${postId}`, {
      params: { userId: userId },
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const isLiked = async () => {
    const token = await currentUser.getIdToken();
    const userId = window.localStorage.getItem("userId");
    const postId = props.postId;
    const response = await api.get(`/post/isLiked/${postId}`, {
      params: { userId: userId },
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.liked === true) {
      setLike({ color: "lime", count: like.count });
    } else {
      setLike({ color: "gray", count: like.count });
    }
  };

  const navigateToProfile = () => {
    if (props.userId === window.localStorage.getItem("userId")) {
      navigate("/profile");
    } else {
      navigate(`/user-profile/${props.username}`, {
        state: { userId: props.userId },
      });
    }
  };

  const handlePostDelete = async () => {
    const token = await currentUser.getIdToken();
    const userId = window.localStorage.getItem("userId");
    const postId = props.postId;
    await api.delete(`/post/delete/${postId}?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setShowAlert({
      show: true,
      msg: "Post Deleted!",
      url: "https://assets10.lottiefiles.com/packages/lf20_yelefni1.json",
    });
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  const handlePostReport = async () => {
    setShowAlert({
      show: true,
      msg: "Post Reported!",
      url: "https://assets9.lottiefiles.com/packages/lf20_p7ki6kij.json",
    });
  };

  const [ellipsis, setEllipsis] = useState({ overflow: "hidden", lines: 3 });

  const handleDescEllipsis = () => {
    if (ellipsis.overflow === "hidden")
      setEllipsis({ overflow: "visible", lines: 15 });
    else setEllipsis({ overflow: "hidden", lines: 3 });
  };

  useEffect(() => {
    isLiked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendEther = async () => {
    if (!Web3.eth.givenProvider) {
      //   alert("Please Install Metamask to continue!");
      return;
    }
    const accounts = await Web3?.eth?.getAccounts();

    if (accounts.length < 1) {
      alert("Please connect metamask account to use the ethereum transaction.");
      setTransactionProcess(false);
      return;
    }

    const addressTo = props.address;
    const transactionParameters = {
      gasPrice: "100000000", // customizable by user during MetaMask confirmation.
      gas: "200000", // customizable by user during MetaMask confirmation.
      to: addressTo, // Required except during contract publications.
      from: accounts[0], // must match user's active address.
      value: "0x100000000000000", // Only required to send ether to the recipient from the initiating external account.
    };

    // txHash is a hex string
    // As with any RPC call, it may throw an error
    try {
      const txHash = await window?.ethereum?.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      setTransactionProcess(false);

      const details = await Web3?.eth?.getTransaction(txHash);
      setShow(true);
      setTransaction(details);
    } catch (e) {
      setTransactionProcess(false);
      alert("Transaction Declined!");
    }
  };

  const handleTransaction = () => {
    setTransactionProcess(true);
    sendEther();
  };

  const handleModalClose = () => {
    setShow(false);
  };

  return (
    <div
      className="d-flex align-items-center"
      style={{ scrollSnapAlign: "start", height: "100%" }}
    >
      <div className="d-flex justify-content-center mx-auto animate__animated animate__backInUp animate__fast">
        {showAlert.show ? (
          <Alert show={showAlert.show} variant="success">
            {showAlert.msg}
            <p>
              <lottie-player
                src={showAlert.url}
                background="transparent"
                speed="0.5"
                style={{ width: 300, height: 300 }}
                autoplay
              ></lottie-player>
            </p>
          </Alert>
        ) : (
          <Card
            style={{
              maxWidth: "30rem",
              width: "auto",
              borderWidth: 20,
              borderStyle: "groove",
              borderColor: "#1f1e1e",
            }}
            bg="dark"
            text="light"
          >
            <Card.Header
              style={{ zIndex: 2, backgroundColor: "rgba(0,0,0,1)" }}
            >
              <Row>
                <Col xs={10} className="py-1">
                  <div
                    className="d-flex justify-content-start align-items-center"
                    type="button"
                    onClick={navigateToProfile}
                  >
                    <Image
                      src={props.profilePhoto}
                      style={{ height: 50, width: 50, objectFit: "contain" }}
                      fluid
                      roundedCircle
                    />
                    <div className="mx-2">
                      <h6 style={{ minWidth: "16rem" }}>{props.name}</h6>
                      <p
                        style={{
                          marginTop: -10,
                          marginBottom: 0,
                          color: "rgb(200,200,200)",
                          fontFamily: "monospace",
                        }}
                      >
                        {props.date}
                      </p>
                    </div>
                  </div>
                </Col>
                <Col
                  xs={2}
                  className="d-flex justify-content-end align-self-center"
                >
                  <Dropdown>
                    <Dropdown.Toggle
                      id="dropdown-menu"
                      variant="clear-light"
                      className="shadow-none"
                      bsPrefix="p-0"
                    >
                      <CgMoreVertical size={20} color="#eee" />
                    </Dropdown.Toggle>

                    <Dropdown.Menu
                      variant="dark"
                      style={{ backgroundColor: "#000" }}
                    >
                      <Dropdown.Item>Hide</Dropdown.Item>
                      {window.localStorage.getItem("userId") ===
                      props.userId ? (
                        <Dropdown.Item onClick={handlePostDelete}>
                          Delete
                        </Dropdown.Item>
                      ) : (
                        <Dropdown.Item onClick={handlePostReport}>
                          Report
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>
            </Card.Header>
            {props.src !== "none" ? (
              <Card.Img
                variant="top"
                src={props.src}
                style={{
                  marginTop: 0,
                  height: "auto",
                  maxHeight: 350,
                  objectFit: "contain",
                  backgroundColor: "#000",
                }}
              />
            ) : null}
            <Card.Body style={{ backgroundColor: "#000" }}>
              <Card.Title
                style={{
                  color: "#eee",
                  fontFamily: "serif",
                  fontWeight: "bold",
                  marginTop: -5,
                }}
              >
                {props.title}
              </Card.Title>
              <Card.Text
                className="text-muted"
                onClick={handleDescEllipsis}
                style={{
                  fontFamily: "cursive",
                  padding: 2,
                  borderRadius: 10,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: `${ellipsis.lines}`,
                  overflow: `${ellipsis.overflow}`,
                  textOverflow: "ellipsis",
                }}
              >
                {props.description}
              </Card.Text>
            </Card.Body>
            <Card.Footer style={{ backgroundColor: "#000", marginTop: -10 }}>
              <Row>
                <Col>
                  <div className="d-flex justify-content-start">
                    <Button
                      onClick={handleLike}
                      variant="clear"
                      className="shadow-none"
                    >
                      <AiFillHeart size={25} fill={like.color} />
                    </Button>
                    <h6 className="text-muted align-self-center my-auto">
                      {like.count} Likes
                    </h6>
                  </div>
                </Col>
                {window.localStorage.getItem("userId") !== props.userId ? (
                  <Col xs={4}>
                    <div className="d-flex justify-content-end">
                      {transactionProcess ? (
                        <Spinner animation="grow" variant="primary" />
                      ) : (
                        <Button
                          onClick={handleTransaction}
                          variant="clear"
                          className="shadow-none"
                        >
                          <FaEthereum size={25} fill="#ddd" />
                        </Button>
                      )}
                    </div>

                    {/* Transaction View Modal */}
                    <Modal
                      show={show}
                      onHide={handleModalClose}
                      fullscreen="sm-down"
                    >
                      <Modal.Header closeButton>
                        <Modal.Title>Transaction Details</Modal.Title>
                      </Modal.Header>
                      <Modal.Body className="row d-flex justify-content-center">
                        <Row>
                          <p>
                            {" "}
                            <b> Hash: </b> {transaction?.hash}
                          </p>
                          <p>
                            {" "}
                            <b> From: </b> {transaction?.from}
                          </p>
                          <p>
                            {" "}
                            <b> To: </b> {transaction?.to}
                          </p>
                          <p>
                            {" "}
                            <b> Amount: </b> {transaction?.value} Wei
                          </p>
                        </Row>
                      </Modal.Body>
                    </Modal>
                  </Col>
                ) : null}
              </Row>
            </Card.Footer>
          </Card>
        )}
      </div>
      <br />
    </div>
  );
}
