import React, { useEffect, useLayoutEffect, useState } from "react";
import { useAuth } from "../Context/authContext";

import {
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  FormControl,
  Image,
  InputGroup,
  Modal,
  Row,
  Stack,
} from "react-bootstrap";
import {
  MdOutlineModeEditOutline,
  MdOutlineDeleteOutline,
  MdOutlineAdd,
} from "react-icons/md";
import { AiFillPlusCircle, AiOutlineLink } from "react-icons/ai";
import { FaEthereum } from "react-icons/fa";

import ContentLoader from "react-content-loader";
import extractDomain from "extract-domain";

import "../App.css";
import "animate.css";
import moment from "moment";

import { useNavigate } from "react-router-dom";
import PostCard from "../Components/PostCard";
import PostForm from "../Components/PostForm";
import { api } from "../API/API";
import UsersListModal from "../Components/UsersListModal";
import Web3 from "../Web3";

export default function ProfileScreen() {
  const { currentUser } = useAuth();

  const [show, setShow] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);

  const [profileDetails, setProfileDetails] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [viewPostModal, setViewPostModal] = useState(false);

  const [postData, setPostData] = useState([]);
  const [userLinks, setUserLinks] = useState([]);
  const [inputLink, setInputLink] = useState("");

  const navigate = useNavigate();

  const showProfileImage = () => {
    setShow(true);
  };

  const handleCloseProfileView = () => {
    setShow(false);
  };

  const handleEdit = () => {
    navigate("/edit-profile");
  };

  const handleClose = () => {
    setViewPostModal(false);
  };

  const fetchProfileData = async () => {
    try {
      fetchUserProfile();
      console.log("Data Fetched Successfully!");
    } catch (e) {
      console.error(e.message);
    }
  };

  const fetchUserProfile = async () => {
    const token = await currentUser.getIdToken();
    const userId = window.localStorage.getItem("userId");
    const response = await api.get(`/user/byUserId/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data?._id) {
      setProfileDetails(response.data);
      setUserLinks(response.data.links);
      setFollowers(response.data.followersList);
      setFollowings(response.data.followingsList);
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const getAllPosts = async () => {
    const userId = window.localStorage.getItem("userId");
    const token = await currentUser.getIdToken();
    const response = await api.get(`/post/all/by/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data[0]?._id) {
      setPostData(response.data);
    }
  };

  const toggleLinksModal = () => {
    setShowLinksModal(!showLinksModal);
  };

  const handleLinkRemove = (url) => {
    let links = [...userLinks];
    let filteredLinks = links.filter((e) => {
      return e.url !== url;
    });
    setUserLinks(filteredLinks);
  };

  const handleLinkAdd = () => {
    if (inputLink.trim().length < 5) {
      return;
    }
    let links = [...userLinks];
    links.push({ url: inputLink });
    setUserLinks(links);
    setInputLink("");
  };

  const handleLinksSave = async () => {
    const userId = window.localStorage.getItem("userId");
    const token = await currentUser.getIdToken();
    await api.put(
      `/user/addLinks`,
      { userId: userId, links: userLinks },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toggleLinksModal();
  };

  const [currentBalance, setCurrentBalance] = useState(0);
  const [connected, setConnected] = useState(false);

  const metamaskAccount = async () => {
    if (!Web3.eth.givenProvider) {
      // alert("Please Install Metamask to continue!");
      return;
    }
    const accounts = await Web3?.eth?.getAccounts();
    if (accounts.length > 0) {
      setConnected(true);
      const bal = await Web3?.eth?.getBalance(accounts[0]);
      const ethBal = Web3?.utils?.fromWei(bal, "ether");
      setCurrentBalance(ethBal);
    }
  };

  window?.ethereum?.on("accountsChanged", function (accounts) {
    if (accounts.length === 0) {
      setConnected(false);
    } else {
      setConnected(true);
      metamaskAccount();
    }
  });

  // mongo db
  const addEthereumAddress = async (address) => {
    const token = await currentUser.getIdToken();
    const userId = window.localStorage.getItem("userId");
    await api.post(
      "user/addEthereumAddress",
      {
        userId: userId,
        ethereumAddress: address,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleConnect = async () => {
    const accounts = await window?.ethereum?.request({
      method: "eth_requestAccounts",
    });
    addEthereumAddress(accounts[0]);
  };

  useEffect(() => {
    getAllPosts();
    metamaskAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    fetchProfileData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showFollowersModal, setShowFollowersModal] = useState(false);

  const viewFollowersModal = () => {
    setShowFollowersModal(!showFollowersModal);
  };

  const [showFollowingsModal, setShowFollowingsModal] = useState(false);

  const viewFollowingsModal = () => {
    setShowFollowingsModal(!showFollowingsModal);
  };

  return (
    <div style={{ display: "flex", backgroundColor: "#000" }}>
      {/* post form for new post */}
      <PostForm show={viewPostModal} handleClose={handleClose} />

      <Container style={{ maxWidth: 800, marginTop: 25 }} fluid="md">
        <Card
          className="my-5 animate__animated animate__fadeInDown animate__fast"
          bg="dark"
          text="light"
        >
          <Card.Img
            variant="top"
            src="https://source.unsplash.com/random/?abstract"
            height="300"
            style={{ objectFit: "cover" }}
          />
          <Image
            roundedCircle
            fluid
            style={styles.profileImage}
            src={currentUser.photoURL}
            onClick={showProfileImage}
          />

          {/* Followers and Followings */}
          <div style={styles.followDetails}>
            <div>
              <Button
                variant="clear-light"
                className="shadow-none"
                onClick={viewFollowersModal}
              >
                <h6 style={{ fontWeight: "bold", color: "#fff" }}>
                  Followers: {profileDetails.followersCount}
                </h6>
              </Button>
            </div>
            <div>
              <Button
                variant="clear-light"
                className="shadow-none"
                onClick={viewFollowingsModal}
              >
                <h6 style={{ fontWeight: "bold", color: "#fff" }}>
                  Followings: {profileDetails.followingsCount}
                </h6>
              </Button>
            </div>
          </div>

          {/* Followers Modal */}
          <UsersListModal
            show={showFollowersModal}
            handleClose={viewFollowersModal}
            list={followers}
          />

          {/* Followings Modal */}
          <UsersListModal
            show={showFollowingsModal}
            handleClose={viewFollowingsModal}
            list={followings}
          />

          {/* Profile Image View Modal */}
          <Modal
            show={show}
            onHide={handleCloseProfileView}
            fullscreen="sm-down"
          >
            <Modal.Header closeButton>
              <Modal.Title>{currentUser.displayName}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="row d-flex justify-content-center">
              <Image
                src={currentUser.photoURL}
                style={{ width: 400, height: 400 }}
              />
            </Modal.Body>
          </Modal>

          <Card.Header as="h5" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
            <Row>
              <Col
                xs={10}
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  fontSize: "1.1em",
                }}
              >
                {currentUser?.displayName}
              </Col>
              <Col className="d-flex justify-content-end" xs={2}>
                <Dropdown>
                  <Dropdown.Toggle
                    id="dropdown-menu"
                    size="sm"
                    variant="outline-primary"
                    className="shadow-none mx-2"
                  >
                    <AiOutlineLink />
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    variant="dark"
                    style={{ backgroundColor: "#000" }}
                  >
                    {userLinks?.map((item, id) => {
                      return (
                        <Dropdown.Item key={id} href={item.url} target="_blank">
                          <AiOutlineLink /> {extractDomain(item.url)}
                        </Dropdown.Item>
                      );
                    })}
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={toggleLinksModal}>
                      Edit
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                {/* Link View Modal */}
                <Modal
                  show={showLinksModal}
                  onHide={toggleLinksModal}
                  fullscreen="sm-down"
                >
                  <Modal.Header closeButton>
                    <Modal.Title>{currentUser.displayName}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="row d-flex justify-content-center">
                    <div className="col-12 mx-auto my-3">
                      {userLinks?.map((item, id) => {
                        return (
                          <InputGroup className="mb-2" key={id} size="sm">
                            <Button
                              variant="outline-secondary"
                              className="shadow-none"
                              onClick={() => handleLinkRemove(item.url)}
                            >
                              <MdOutlineDeleteOutline color="#000" />
                            </Button>
                            <InputGroup.Text style={{ fontSize: "1em" }}>
                              {" "}
                              {item.url}{" "}
                            </InputGroup.Text>
                          </InputGroup>
                        );
                      })}
                    </div>
                    <InputGroup className="mb-3" style={{ height: 25 }}>
                      <InputGroup.Text>
                        {" "}
                        <AiOutlineLink />{" "}
                      </InputGroup.Text>
                      <FormControl
                        aria-label="Add Link Here"
                        size="md"
                        type="text"
                        placeholder="Add link here"
                        className="shadow-none"
                        maxLength={80}
                        title="Add link in correct format"
                        value={inputLink}
                        onChange={(e) => setInputLink(e.target.value)}
                      />
                      <Button
                        variant="outline-secondary"
                        className="shadow-none"
                        onClick={handleLinkAdd}
                      >
                        <MdOutlineAdd color="#000" />
                      </Button>
                    </InputGroup>
                    <Stack className="mx-auto gap-2 my-4">
                      <Button
                        type="submit"
                        variant="primary"
                        className="shadow-none"
                        style={{ width: 200, alignSelf: "center" }}
                        onClick={handleLinksSave}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline-clear-dark"
                        className="shadow-none"
                        onClick={toggleLinksModal}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Modal.Body>
                </Modal>

                <Button
                  variant="outline-primary"
                  size="sm"
                  className="shadow-none"
                  style={{ height: 30 }}
                  onClick={handleEdit}
                >
                  <MdOutlineModeEditOutline />
                </Button>
              </Col>
            </Row>
          </Card.Header>

          {/* Car body consist of profile details */}
          <Card.Body style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
            {loading ? (
              <MyLoader />
            ) : (
              <div>
                <Card.Title>
                  <Row>
                    <Col
                      xs={8}
                      style={{
                        color: "lime",
                        fontFamily: "cursive",
                        fontSize: "1em",
                      }}
                    >
                      @{profileDetails.username}
                    </Col>
                    <Col xs={4} className="d-flex justify-content-end">
                      {connected ? (
                        <div style={styles.ethBox}>
                          <FaEthereum size={22} />
                          {currentBalance}
                        </div>
                      ) : (
                        <Button
                          onClick={handleConnect}
                          disabled={connected}
                          variant="outline-success"
                          size="sm"
                          className="shadow-none"
                          style={{ maxWidth: 200 }}
                        >
                          Connect Metamask
                        </Button>
                      )}
                    </Col>
                  </Row>
                </Card.Title>
                <Card.Text style={styles.about}>
                  {profileDetails.about}
                </Card.Text>
              </div>
            )}
          </Card.Body>

          {/* Posts */}
          <Card.Footer style={{ backgroundColor: "rgba(0,0,0,0.9)" }}>
            <h2>Recent Posts</h2>
            <div
              className="scrollHider"
              style={{ height: "85vh", overflowY: "scroll" }}
            >
              {postData?.map((item) => {
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
                    profilePhoto={item.postedBy.profileImage}
                    userId={item.postedBy._id}
                    date={dt}
                    likeCount={Number(item.likes)}
                  />
                );
              })}
            </div>
          </Card.Footer>
        </Card>
      </Container>

      {/* fixed bottom right button */}
      <Button
        type="button"
        variant="clear-light"
        style={{ position: "fixed", bottom: 20, right: 0, zIndex: 1000 }}
        className="shadow-none"
        onClick={() => setViewPostModal(true)}
      >
        <AiFillPlusCircle size={50} color="#fff" />
      </Button>
    </div>
  );
}

const MyLoader = (props) => (
  <ContentLoader
    speed={1.5}
    width={700}
    height={40}
    viewBox="0 0 700 40"
    backgroundColor="#212429"
    foregroundColor="#636363"
    {...props}
  >
    <rect x="0" y="0" rx="3" ry="3" width="67" height="11" />
    <rect x="76" y="0" rx="3" ry="3" width="140" height="11" />
    <rect x="127" y="48" rx="3" ry="3" width="53" height="11" />
    <rect x="187" y="48" rx="3" ry="3" width="72" height="11" />
    <rect x="18" y="48" rx="3" ry="3" width="100" height="11" />
    <rect x="0" y="71" rx="3" ry="3" width="37" height="11" />
    <rect x="18" y="23" rx="3" ry="3" width="140" height="11" />
    <rect x="166" y="23" rx="3" ry="3" width="173" height="11" />
  </ContentLoader>
);

const styles = {
  profileImage: {
    borderColor: "#111",
    borderWidth: 2,
    position: "absolute",
    left: 10,
    top: 140,
    height: 150,
    width: 150,
    backgroundColor: "#111",
    padding: 2,
    objectFit: "contain",
  },
  followDetails: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderBottomLeftRadius: 12,
  },
  ethBox: {
    backgroundColor: "#000",
    padding: 5,
    borderRadius: 10,
    borderStyle: "groove",
    fontSize: "1rem",
    borderColor: "rgb(0,50,200)",
  },
  about: {
    fontFamily: "monospace",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 12,
    borderRadius: 10,
    display: "inline-flex",
    fontSize: "1em",
  },
};
