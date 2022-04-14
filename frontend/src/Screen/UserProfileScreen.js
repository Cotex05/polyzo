import React, { useLayoutEffect, useState } from "react";
import { useAuth } from "../Context/authContext";

import {
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Image,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";

import ContentLoader from "react-content-loader";
import extractDomain from "extract-domain";

import "../App.css";
import "animate.css";
import { AiOutlineLink } from "react-icons/ai";
import { FaEthereum } from "react-icons/fa";

import moment from "moment";

import { useLocation, useParams } from "react-router-dom";
import PostCard from "../Components/PostCard";
import { api } from "../API/API";
import UsersListModal from "../Components/UsersListModal";

import Web3 from "../Web3";

export default function UserProfileScreen() {
  const { currentUser } = useAuth();

  const [show, setShow] = useState(false);
  const [profileDetails, setProfileDetails] = useState([]);
  const [userLinks, setUserLinks] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [followingsList, setFollowingsList] = useState([]);

  const [currentBalance, setCurrentBalance] = useState(0);
  const [showBalance, setShowBalance] = useState(false);
  const [loadingBal, setLoadingBal] = useState(false);

  const [followingState, setFollowingState] = useState(false);
  const [followers, setFollowers] = useState();
  const [followings, setFollowings] = useState();
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(true);

  const [postData, setPostData] = useState([]);

  const location = useLocation();
  const { username } = useParams();

  const showProfileImage = () => {
    setShow(true);
  };

  const handleCloseProfileView = () => {
    setShow(false);
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      fetchUserProfile();
      setLoading(false);
      console.log("Data Fetched Successfully!");
    } catch (e) {
      console.error(e.message);
    }
  };

  const fetchUserProfile = async () => {
    const token = await currentUser.getIdToken();
    const userId = !location.state ? profileDetails._id : location.state.userId;
    const response = await api.get(`/user/byUserId/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data?._id) {
      setProfileDetails(response.data);
      setFollowersList(response.data.followersList);
      setFollowingsList(response.data.followingsList);
      setFollowers(response.data.followersCount);
      setFollowings(response.data.followingsCount);
      setUserLinks(response.data.links);
    }
  };

  const getAllPosts = async (id) => {
    const token = await currentUser.getIdToken();
    const userId = !location.state ? id : location.state.userId;
    const response = await api.get(`/post/all/by/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data[0]?._id) {
      setPostData(response.data);
    }
  };

  const handleFollowingState = async () => {
    if (followingState) {
      // if following true
      setFollowers(followers - 1);
      handleUnfollow();
      setFollowingState(false);
    } else {
      setFollowers(followers + 1);
      handleFollow();
      setFollowingState(true);
    }
  };

  const handleFollow = async () => {
    const token = await currentUser.getIdToken();
    const userId = !location.state ? profileDetails._id : location.state.userId;
    const currUserId = window.localStorage.getItem("userId");
    await api.put(
      `/user/follow/${userId}`,
      { currUserId: currUserId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleUnfollow = async () => {
    const token = await currentUser.getIdToken();
    const userId = !location.state ? profileDetails._id : location.state.userId;
    const currUserId = window.localStorage.getItem("userId");
    await api.put(
      `/user/unfollow/${userId}`,
      { currUserId: currUserId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const isFollowing = async (id) => {
    const token = await currentUser.getIdToken();
    const userId = !location.state ? id : location.state.userId;
    const currUserId = window.localStorage.getItem("userId");
    const response = await api.get(
      `/user/isFollowing/${userId}/${currUserId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setFollowingState(response.data.followed);
  };

  const fetchUserProfileFromUsername = async () => {
    const token = await currentUser.getIdToken();
    const response = await api.get(`/user/byUsername/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data?._id) {
      setProfileDetails(response.data);
      setFollowersList(response.data.followersList);
      setFollowingsList(response.data.followingsList);
      setFollowers(response.data.followersCount);
      setFollowings(response.data.followingsCount);
      getAllPosts(response.data._id);
      isFollowing(response.data._id);
      setUserLinks(response.data.links);
    } else {
      setUserExists(false);
    }
  };

  const urlProfileVisit = () => {
    if (location.state === null) {
      fetchUserProfileFromUsername();
      setLoading(false);
    } else {
      fetchProfileData();
      getAllPosts(null);
      isFollowing(null);
    }
  };

  const [showFollowersModal, setShowFollowersModal] = useState(false);

  const viewFollowersModal = () => {
    setShowFollowersModal(!showFollowersModal);
  };

  const [showFollowingsModal, setShowFollowingsModal] = useState(false);

  const viewFollowingsModal = () => {
    setShowFollowingsModal(!showFollowingsModal);
  };

  const getUserBalance = async () => {
    if (!Web3.eth.givenProvider) {
      // alert("Please Install Metamask to continue!");
      return;
    }
    setLoadingBal(true);
    if (!profileDetails.ethereumAddress) {
      setLoadingBal(false);
      alert("Wallet not found!");
      return;
    }
    try {
      const bal = await Web3?.eth?.getBalance(profileDetails.ethereumAddress);
      setLoadingBal(false);
      setShowBalance(true);
      const ethBal = Web3?.utils?.fromWei(bal, "ether");
      setCurrentBalance(ethBal);
    } catch (error) {
      setLoading(false);
      alert(error.message);
    }
  };

  const [transactionProcess, setTransactionProcess] = useState(false);
  const [transaction, setTransaction] = useState();

  const [showTransaction, setShowTransaction] = useState(false);

  const sendEther = async () => {
    if (!Web3.eth.givenProvider) {
      // alert("Please Install Metamask to continue!");
      return;
    }
    const accounts = await Web3?.eth?.getAccounts();

    if (accounts.length < 1) {
      alert("Please connect metamask account to use the ethereum transaction.");
      setTransactionProcess(false);
      return;
    }

    const addressTo = profileDetails.ethereumAddress;
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
      setShowTransaction(true);
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
    setShowTransaction(false);
  };

  useLayoutEffect(() => {
    urlProfileVisit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: "flex", backgroundColor: "#000" }}>
      <Container style={{ maxWidth: 800, marginTop: 25 }} fluid="md">
        {userExists ? (
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
              src={profileDetails.profileImage}
              onClick={showProfileImage}
            />

            <div style={styles.followDetails}>
              <div>
                <Button
                  variant="clear-light"
                  className="shadow-none"
                  onClick={viewFollowersModal}
                >
                  <h6 style={{ fontWeight: "bold", color: "#fff" }}>
                    Followers: {followers}
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
                    Followings: {followings}
                  </h6>
                </Button>
              </div>
            </div>

            {/* Followers Modal */}
            <UsersListModal
              show={showFollowersModal}
              handleClose={viewFollowersModal}
              list={followersList}
            />

            {/* Followings Modal */}
            <UsersListModal
              show={showFollowingsModal}
              handleClose={viewFollowingsModal}
              list={followingsList}
            />

            <Modal
              show={show}
              onHide={handleCloseProfileView}
              fullscreen="sm-down"
            >
              <Modal.Header closeButton>
                <Modal.Title>{profileDetails.name}</Modal.Title>
              </Modal.Header>
              <Modal.Body className="row d-flex justify-content-center">
                <Image
                  src={profileDetails.profileImage}
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
                  {profileDetails.name}
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
                      {userLinks.map((item, id) => {
                        return (
                          <Dropdown.Item
                            key={id}
                            href={item.url}
                            target="_blank"
                          >
                            <AiOutlineLink /> {extractDomain(item.url)}
                          </Dropdown.Item>
                        );
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>
            </Card.Header>
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
                        {showBalance ? (
                          <div style={styles.ethBox}>
                            <FaEthereum size={22} />
                            {currentBalance}
                          </div>
                        ) : (
                          <Button
                            onClick={getUserBalance}
                            variant="outline-primary"
                            size="sm"
                            className="shadow-none"
                            style={{ width: 120 }}
                          >
                            {!loadingBal ? (
                              "Show Balance"
                            ) : (
                              <Spinner
                                size="sm"
                                variant="primary"
                                animation="grow"
                              />
                            )}
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </Card.Title>
                  <Card.Text
                    style={{
                      fontFamily: "monospace",
                      backgroundColor: "rgba(0,0,0,0.3)",
                      padding: 12,
                      borderRadius: 10,
                      display: "inline-flex",
                      fontSize: "1em",
                    }}
                  >
                    {profileDetails.about}
                  </Card.Text>
                </div>
              )}
              {window.localStorage.userId !== profileDetails._id ? (
                <Button
                  variant="outline-primary"
                  onClick={handleFollowingState}
                  className="shadow-none my-3 mx-2"
                >
                  {followingState ? "Following" : "Follow"}
                </Button>
              ) : null}

              <Button
                onClick={handleTransaction}
                variant="outline-primary"
                className="shadow-none my-3 mx-2"
                disabled={transactionProcess}
              >
                {transactionProcess ? (
                  <>
                    {" "}
                    <Spinner
                      animation="border"
                      variant="primary"
                      size="sm"
                    />{" "}
                    Sending{" "}
                  </>
                ) : (
                  <>
                    <FaEthereum size={22} fill="#ddd" /> Send{" "}
                  </>
                )}
              </Button>

              {window.localStorage.getItem("userId") !== profileDetails._id ? (
                <Col xs={4}>
                  {/* Transaction View Modal */}
                  <Modal
                    show={showTransaction}
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
            </Card.Body>
            <Card.Footer style={{ backgroundColor: "rgba(0,0,0,0.9)" }}>
              <h2>Recent Posts</h2>
              <div
                className="scrollHider"
                style={{ height: "85vh", overflowY: "scroll" }}
              >
                {postData.map((item) => {
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
        ) : (
          <lottie-player
            src="https://assets8.lottiefiles.com/packages/lf20_5035qbsq.json"
            background="transparent"
            speed="1"
            style={{ width: "auto", height: "100vh" }}
            autoplay
            loop
          ></lottie-player>
        )}
      </Container>
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
};
