import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useWallet } from "use-wallet";
import { Box, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function NavBar() {
  const wallet = useWallet();

  const chainId = process.env.REACT_APP_CHAIN_ID as string;

  const addGnosisChainNetwork = React.useCallback(async () => {
    try {
      await wallet.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainId }], // Hexadecimal version of 80001, prefixed with 0x
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await wallet.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainId.replace,
                chainName: "Gnosis Chain",
                nativeCurrency: {
                  name: "Gnosis",
                  symbol: "xDAI",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.xdaichain.com"],
                blockExplorerUrls: ["https://blockscout.com/xdai/mainnet"],
                iconUrls: [""],
              },
            ],
          });
        } catch (addError) {
          console.log("Did not add network");
          throw addError;
        }
      }
    }
  }, [chainId, wallet.ethereum]);

  React.useEffect(() => {
    if (wallet.status === "connected" && wallet.chainId !== +chainId) {
      addGnosisChainNetwork();
    }
  }, [addGnosisChainNetwork, chainId, wallet.chainId, wallet.status]);

  const NavButtons = () => {
    return (
      <Box style={{ paddingTop: "10px", display: "flex", gap: "10px" }}>
        <Button
          color="warning"
          variant="contained"
          onClick={() => {
            if (!wallet.isConnected()) {
              wallet.connect("provided");
            }
          }}>
          {wallet.status !== "connected" ? "Connect Wallet to Start" : wallet.account}
        </Button>

        {wallet.status === "connected" && (
          <React.Fragment>
            <Button variant="contained" color="error" onClick={() => wallet.reset()}>
              Disconnect
            </Button>

            <Link to="/buy">
              <Button color="secondary" variant="contained">
                Buy Nfts
              </Button>
            </Link>
            <Link to="/my-collection">
              <Button color="secondary" variant="contained">
                Your Collection
              </Button>
            </Link>
          </React.Fragment>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" className="no-decoration">
              SilkRoad NFT Generator
            </Link>
          </Typography>
          <NavButtons />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
