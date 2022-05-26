import React from "react";
import ReactDOM from "react-dom";
import { UseWalletProvider } from "use-wallet";
import "./index.css";
import App from "./pages/app";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import BuyNft from "./pages/buy-nft";
import Collection from "./pages/collection";

const chainId = process.env.REACT_APP_CHAIN_ID as string;

ReactDOM.render(
  <React.StrictMode>
    <UseWalletProvider
      autoConnect
      connectors={{
        injected: {
          chainId: [chainId],
        },
      }}>
      <ToastContainer />
      <BrowserRouter>
      <Routes>
      <Route path="/" element={<App />} />
      <Route path="/gui" element={<App />} />
      <Route path="buy" element={<BuyNft />} />
      <Route path="my-collection" element={<Collection />} />
    </Routes>
      </BrowserRouter>      
    </UseWalletProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
