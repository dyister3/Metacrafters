import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [depositAmount, setDepositAmount] = useState(1);
  const [withdrawAmount, setWithdrawAmount] = useState(1);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account[0]);
    } else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const addTransaction = (type, amount) => {
    const newTransaction = {
      type,
      amount,
      timestamp: new Date().toLocaleString(),
    };
    setTransactionHistory([...transactionHistory, newTransaction]);
  }

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
      addTransaction('Deposit', depositAmount);
    }
  }

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(withdrawAmount);
      await tx.wait();
      getBalance();
      addTransaction('Withdraw', withdrawAmount);
    }
  }

  const increaseDeposit = () => {
    setDepositAmount(depositAmount + 1);
  }

  const decreaseDeposit = () => {
    if (depositAmount > 1) {
      setDepositAmount(depositAmount - 1);
    }
  }

  const increaseWithdraw = () => {
    setWithdrawAmount(withdrawAmount + 1);
  }

  const decreaseWithdraw = () => {
    if (withdrawAmount > 1) {
      setWithdrawAmount(withdrawAmount - 1);
    }
  }

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Click here to open Jayster's Wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <div>
          <button onClick={decreaseDeposit}>-</button>
          <span>Deposit Amount: {depositAmount} ETH</span>
          <button onClick={increaseDeposit}>+</button>
          <button onClick={deposit}>Deposit</button>
        </div>
        <div>
          <button onClick={decreaseWithdraw}>-</button>
          <span>Withdraw Amount: {withdrawAmount} ETH</span>
          <button onClick={increaseWithdraw}>+</button>
          <button onClick={withdraw}>Withdraw</button>
        </div>
        <h2>Transaction History</h2>
        <ul>
          {transactionHistory.map((tx, index) => (
            <li key={index}>{`${tx.timestamp} - ${tx.type}: ${tx.amount} ETH`}</li>
          ))}
        </ul>
      </div>
    )
  }

  useEffect(() => { getWallet(); }, []);

  return (
    <main className="container">
      <header><h1>Welcome to Jayster's Wallet</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}
