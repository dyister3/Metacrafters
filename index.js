import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [news, setNews] = useState([]);
  const [usdValue, setUsdValue] = useState(null);
  const [phpValue, setPhpValue] = useState(null);
  const [showLearnAboutETH, setShowLearnAboutETH] = useState(false);

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
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(1);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(1);
      await tx.wait();
      getBalance();
    }
  };

  const fetchNews = async () => {
    const response = await fetch("https://newsapi.org/v2/everything?q=ethereum&apiKey=YOUR_NEWSAPI_KEY");
    const data = await response.json();
    setNews(data.articles);
  };

  const fetchExchangeRates = async () => {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd,php");
    const data = await response.json();
    const ethPriceInUsd = data.ethereum.usd;
    const ethPriceInPhp = data.ethereum.php;

    setUsdValue(balance * ethPriceInUsd);
    setPhpValue(balance * ethPriceInPhp);
  };

  const openLearnAboutETH = () => {
    setShowLearnAboutETH(true);
  };

  const closeLearnAboutETH = () => {
    setShowLearnAboutETH(false);
  };

  const LearnAboutETHModal = () => {
    return (
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={closeLearnAboutETH}>&times;</span>
          <h2>What is Ethereum (ETH)?</h2>
          <p>Ethereum is a decentralized, open-source blockchain system that features smart contract functionality. It is the second-largest cryptocurrency platform by market capitalization, after Bitcoin.</p>
          <p>Developed by Vitalik Buterin in 2013 and later implemented in 2015, Ethereum allows developers to build decentralized applications (DApps) on its blockchain. These applications can be used for a variety of purposes, including financial transactions, gaming, voting, and more.</p>
          <p>Ethereum's native cryptocurrency, Ether (ETH), is used to pay for transactions and computational services on the network. It is also traded on various cryptocurrency exchanges.</p>
        </div>
      </div>
    );
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Click to enter Jayster</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <button onClick={deposit}>Deposit 1 ETH</button>
        <button onClick={withdraw}>Withdraw 1 ETH</button>
        <button onClick={fetchNews}>See ETH News</button>
        <button onClick={fetchExchangeRates}>Convert Balance to USD & PHP</button>
        <button onClick={openLearnAboutETH}>Learn about ETH</button>
        {usdValue !== null && <p>Equivalent in USD: ${usdValue.toFixed(2)}</p>}
        {phpValue !== null && <p>Equivalent in PHP: ₱{phpValue.toFixed(2)}</p>}
        {news.length > 0 && (
          <div>
            <h2>Ethereum News</h2>
            <ul>
              {news.map((article, index) => (
                <li key={index}>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {showLearnAboutETH && <LearnAboutETHModal />}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header><h1>Welcome to Jayster</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
        .modal {
          display: ${showLearnAboutETH ? "block" : "none"};
          position: fixed;
          z-index: 1;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0,0,0,0.4);
        }
        .modal-content {
          background-color: #fefefe;
          margin
          : 15% auto;
          padding: 20px;
          border: 1px solid #888;
          width: 80%;
        }
        .close {
          color: #aaa;
          float: right;
          font-size: 28px;
          font-weight: bold;
        }
        .close:hover,
        .close:focus {
          color: black;
          text-decoration: none;
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}
