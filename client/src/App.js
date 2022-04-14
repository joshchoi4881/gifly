import React, { useState, useEffect } from "react";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import gifly from "./utils/gifly.json";
import keypair from "./scripts/keypair.json";
import "./styles/App.css";

const PROGRAM_ID = new PublicKey(gifly.metadata.address);
const NETWORK = clusterApiUrl("devnet");
const OPTIONS = {
  preflightCommitment: "processed",
};
const ARR = Object.values(keypair._keypair.secretKey);
const SECRET = new Uint8Array(ARR);
const BASE_ACCOUNT = web3.Keypair.fromSecretKey(SECRET);
const { SystemProgram } = web3;

const App = () => {
  const [account, setAccount] = useState(null);
  const [link, setLink] = useState("");
  const [gifs, setGifs] = useState([]);

  useEffect(() => {
    isConnected();
  }, []);

  useEffect(() => {
    if (account) {
      getGifs();
    }
  }, [account]);

  const isConnected = async () => {
    function handleAccountsChanged() {
      window.location.reload();
    }
    function handleChainChanged() {
      window.location.reload();
    }
    try {
      if (!window.solana || !window.solana.isPhantom) {
        alert("download phantom @ https://phantom.app/download");
        return;
      }
      const account = await window.solana.connect({ onlyIfTrusted: true });
      setAccount(account.publicKey.toString());
      window.solana.on("accountsChanged", handleAccountsChanged);
      window.solana.on("chainChanged", handleChainChanged);
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.solana || !window.solana.isPhantom) {
        alert("download phantom @ https://phantom.app/download");
        return;
      }
      const account = await window.solana.connect();
      setAccount(account.publicKey.toString());
    } catch (error) {
      console.error(error);
    }
  };

  const getProvider = () => {
    const connection = new Connection(NETWORK, OPTIONS.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      OPTIONS.preflightCommitment
    );
    return provider;
  };

  const initialize = async () => {
    try {
      const provider = getProvider();
      const program = new Program(gifly, PROGRAM_ID, provider);
      await program.rpc.initialize({
        accounts: {
          baseAccount: BASE_ACCOUNT.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [BASE_ACCOUNT],
      });
      await getGifs();
    } catch (error) {
      console.error(error);
    }
  };

  const addGif = async () => {
    if (link.length === 0) {
      return;
    }
    try {
      const provider = getProvider();
      const program = new Program(gifly, PROGRAM_ID, provider);
      await program.rpc.addGif(link, {
        accounts: {
          baseAccount: BASE_ACCOUNT.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      await getGifs();
    } catch (error) {
      console.error(error);
    } finally {
      setLink("");
    }
  };

  const getGifs = async () => {
    try {
      const provider = getProvider();
      const program = new Program(gifly, PROGRAM_ID, provider);
      const account = await program.account.baseAccount.fetch(
        BASE_ACCOUNT.publicKey
      );
      setGifs(account.gifs);
    } catch (error) {
      console.error(error);
      setGifs(null);
    }
  };

  const onLinkChange = (e) => {
    setLink(e.target.value);
  };

  const renderConnectWallet = () => (
    <>
      <button
        className="cta-button connect-wallet-button"
        onClick={connectWallet}
      >
        connect phantom
      </button>
    </>
  );

  const renderConnected = () => {
    if (gifs === null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={initialize}>
            initialize
          </button>
        </div>
      );
    } else {
      return (
        <div className="connected-container">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addGif();
            }}
          >
            <input
              type="text"
              placeholder="enter gif link"
              value={link}
              onChange={onLinkChange}
            />
            <button type="submit" className="cta-button submit-gif-button">
              submit
            </button>
          </form>
          <div className="gif-grid">
            {gifs.map((item, i) => (
              <div className="gif-item" key={i}>
                <img src={item.gifLink} alt={item.gifLink} />
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="App">
      <div className={account ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">gifly</p>
          <p className="sub-text">send some dank memes homie</p>
          {!account ? renderConnectWallet() : renderConnected()}
        </div>
      </div>
    </div>
  );
};

export default App;
