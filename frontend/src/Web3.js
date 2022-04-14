import Web3 from "web3";

// window.ethereum.request({ method: 'eth_requestAccounts' });

// window.web3 coming from metamask

export default new Web3(window?.ethereum);
