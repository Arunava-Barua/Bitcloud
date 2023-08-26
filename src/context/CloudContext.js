import React, { createContext, useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

import Crossway from "./Crossway.json";

export const CloudContext = createContext({});

const contractAddress = "0x5C39516A106159Ae8305Cb8784C4F5eebB543E3c";
const contractAbi = Crossway.abi;

export const CloudProvider = ({ children }) => {
  const [toggleTransferSuccess, setToggleTransferSuccess] = useState(false);
  const [visibleTransfer, setVisibleTransfer] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [receivingTxns, setReceivingTxns] = useState([]);
  const [sendingTxns, setSendingTxns] = useState([]);

  const convertDateTime = (unixTime) => {
    let date = new Date(unixTime * 1000).toString();

    const parsedDate = new Date(date);

    // Get the desired components
    const month = parsedDate.toLocaleString("en-us", { month: "short" });
    const day = parsedDate.getDate();
    const year = parsedDate.getFullYear();
    const hours = parsedDate.getHours();
    const minutes = parsedDate.getMinutes();
    const seconds = parsedDate.getSeconds();

    // Create the formatted date and time string
    const formattedDate = `${month} ${day} ${year} ${hours}:${minutes}:${seconds}`;

    return formattedDate;
  };

  // Check if it is connected to wallet
  const checkIfWalletIsConnect = async () => {
    // While installing metamask, it has an ethereum object in the window
    if (!window.ethereum) return alert("Please install MetaMask.");

    // Fetch all the eth accounts
    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    // Connecting account if exists
    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log("No accounts found");
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask.");

    // Fetch all the eth accounts------------------------------------here----------------
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    console.log("Account--->", accounts[0]);
    setCurrentAccount(accounts[0]);

    // Reloading window
    window.location.reload();
  };

  // Checking if wallet is there in the start
  useEffect(() => {
    checkIfWalletIsConnect();
  }, []);

  useEffect(() => {
    console.log("Current account--->", currentAccount);
    console.log("Receiving Txns--->", receivingTxns);
  }, [currentAccount]);

  useEffect(() => {
    (async () => {
      await getAllMySending();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await getAllMyReceiving();
    })();
  }, []);

  const getAllMySending = async () => {
    let results = [],
      txn;
    let userAddress;

    if (window.ethereum) {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        provider
      );

      if (window.ethereum.isConnected()) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        console.log(accounts[0]);
        userAddress = accounts[0];
      }

      const txRes = await contract.getSendingPayments(userAddress);
      console.log("My Receiving payments: ", txRes);

      txRes &&
        txRes.map((details, index) => {
          txn = {
            id: Number(details.transactionId._hex),
            verificationId: Number(details.verficationId._hex),
            sender: details.sender,
            receiver: details.receiver,
            amount: Number(details.amount._hex),
            chain: details.chain,
            status: details.status,
            startTime: convertDateTime(Number(details.startTime._hex)),
          };

          results.push(txn);
          txn = {};
        });

      setSendingTxns(results);
      console.log("Formatted Receiving: ", results);
    }
  };

  const getAllMyReceiving = async () => {
    let results = [],
      txn;
    let userAddress;

    if (window.ethereum) {
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        provider
      );

      if (window.ethereum.isConnected()) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        console.log(accounts[0]);
        userAddress = accounts[0];
      }

      const txRes = await contract.getReceivingPayments(userAddress);
      console.log("My Receiving payments: ", txRes);

      txRes &&
        txRes.map((details, index) => {
          txn = {
            id: Number(details.transactionId._hex),
            verificationId: Number(details.verficationId._hex),
            sender: details.sender,
            receiver: details.receiver,
            amount: Number(details.amount._hex),
            chain: details.chain,
            status: details.status,
            startTime: convertDateTime(Number(details.startTime._hex)),
          };

          results.push(txn);
          txn = {};
        });

      setReceivingTxns(results);
      console.log("Formatted Receiving: ", results);
    }
  };

  return (
    <CloudContext.Provider
      value={{
        toggleTransferSuccess,
        setToggleTransferSuccess,
        visibleTransfer,
        setVisibleTransfer,
        currentAccount,
        setCurrentAccount,
        connectWallet,
        receivingTxns,
        setReceivingTxns,
        getAllMyReceiving,
        sendingTxns,
      }}
    >
      {children}
    </CloudContext.Provider>
  );
};
