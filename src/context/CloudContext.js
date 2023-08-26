import React, { createContext, useState, useEffect } from "react";
import Web3Modal from "web3modal";
// import { ethers } from "ethers";

export const CloudContext = createContext({});

export const CloudProvider = ({ children }) => {
  const [toggleTransferSuccess, setToggleTransferSuccess] = useState(false);
  const [visibleTransfer, setVisibleTransfer] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");

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
    }, [currentAccount]);

  return (
    <CloudContext.Provider
      value={{
        toggleTransferSuccess,
        setToggleTransferSuccess,
        visibleTransfer,
        setVisibleTransfer,
        currentAccount,
        setCurrentAccount,
        connectWallet
      }}
    >
      {children}
    </CloudContext.Provider>
  );
};
