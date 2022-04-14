import React, { useEffect, useState } from "react";
import { Button, Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import { useAuth } from "../Context/authContext";

//Stylying Headers import
import "bootstrap/dist/css/bootstrap.min.css";
import "./topnavbar.css";
import { useNavigate } from "react-router-dom";
import Web3 from "../Web3";
import { api } from "../API/API";

export default function Topnavbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      window.localStorage.removeItem("userId");
      navigate("/login", { replace: true });
      setTimeout(() => {
        alert("You are successfully logout!");
      }, 200);
    } catch (err) {
      alert("An error occured during logging out!");
    }
  };

  const [connected, setConnected] = useState(false);

  // mongo db
  const addEthereumAddress = async (address) => {
    const token = await currentUser?.getIdToken();
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

  const isConnected = async () => {
    if (Web3.eth.givenProvider) {
      const accounts = await Web3?.eth?.getAccounts();
      if (accounts.length === 0) {
        setConnected(false);
      } else {
        setConnected(true);
      }
    } else {
      alert("Please Install Metamask to continue!");
    }
  };

  window?.ethereum?.on("accountsChanged", function (accounts) {
    if (accounts.length === 0) {
      setConnected(false);
    } else {
      setConnected(true);
    }
  });

  useEffect(() => {
    isConnected();
  }, []);

  return (
    <div>
      <Navbar
        expand={false}
        variant="dark"
        fixed="top"
        style={{ margin: -5 }}
        className="navbarSmall"
      >
        <Container>
          <Navbar.Brand href="/" className="navbar-brand">
            <h2 className="neonText">Polyzo</h2>
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls="offcanvasNavbar"
            className="shadow-none"
          />
          <Navbar.Offcanvas
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
            placement="end"
            style={{ backgroundColor: "#111" }}
          >
            <Offcanvas.Header
              style={{ color: "#eee" }}
              closeButton
              closeVariant="white"
            >
              <Offcanvas.Title id="offcanvasNavbarLabel">Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link href="/">Home</Nav.Link>
                </Nav>
              </Navbar.Collapse>
              <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                  {currentUser ? (
                    <Nav>
                      <Nav.Link href="/profile">Profile</Nav.Link>
                      <Nav.Link href="/explore">Explore</Nav.Link>
                      <Nav.Link href="/search">Search</Nav.Link>
                      <Button
                        onClick={handleConnect}
                        disabled={connected}
                        variant="outline-success"
                        size="sm"
                        className="my-3"
                        style={{ maxWidth: 200 }}
                      >
                        {connected ? "Metamask Connected" : "Connect Metamask"}
                      </Button>
                      <Button
                        onClick={handleLogout}
                        variant="outline-danger"
                        size="sm"
                        className="my-3"
                        style={{ maxWidth: 100 }}
                      >
                        Logout
                      </Button>
                    </Nav>
                  ) : (
                    <Nav.Link href="/login">Login</Nav.Link>
                  )}
                </Navbar.Text>
              </Navbar.Collapse>
            </Offcanvas.Body>
          </Navbar.Offcanvas>
        </Container>
      </Navbar>
    </div>
  );
}
