import React, { createContext, useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

import Crossway from "./Crossway.json"

export const CloudContext = createContext({});

const contractAddress="0x6eb8D12d2B883265F006a162Eb803986c1b13d6C"
const contractAbi = Crossway.abi;

export const CloudProvider = ({ children }) => {
  const [toggleTransferSuccess, setToggleTransferSuccess] = useState(false);
  const [visibleTransfer, setVisibleTransfer] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [receivingTxns, setReceivingTxns] = useState([]);

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
        await getAllMyReceiving();
      })();
    }, []);

    const getAllMyReceiving = async () => {
      let results = [], txn;
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
        console.log("My listings: ", txRes);
  
        txRes && txRes.map((details, index) => {
          txn = {
            id: Number(details.transactionId._hex),
            verificationId: Number(details.verficationId._hex),
            sender: details.sender,
            receiver: details.receiver,
            amount: Number(details.amount._hex),
            chain: details.chain,
            status: details.status,
            startTime: Number(details.startTime._hex)
          }
  
          results.push(txn);
          txn={}
        })
  
        setReceivingTxns(results);
        console.log("Formatted Receiving: ", results);
      }
    }

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
        getAllMyReceiving
      }}
    >
      {children}
    </CloudContext.Provider>
  );
};
