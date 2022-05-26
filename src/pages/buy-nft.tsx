import { Button, Card, CardActions, CardContent, Container, Grid, Typography } from "@mui/material";
import { ethers } from "ethers";
import React, { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useWallet } from "use-wallet";
import Loading from "../components/loading";
import NavBar from "../components/nav-bar";
import { loadProjects as loadAllProjects, nftBought } from "../utils/api";
import { getNftContract, isTransactionMined } from "../utils/contract.utils";
import { NftBought, Project, Stage } from "../utils/dtos";
import { WalletStateContext } from "../utils/WalletStateContext";

const BuyNft = () => {
  const baseUrl = process.env.REACT_APP_SERVER_URL as string;
  const [showLoading, setShowLoading] = useState(false);

  const wallet = useWallet();

  const [projects, setProjects] = useState<Array<Project>>([]);

  const walletStateContext = useContext(WalletStateContext);

  const loadProjects = useCallback(async () => {
    const _projects = await loadAllProjects(baseUrl);
    if (_projects.data && _projects.data.length > 0) {
      setProjects(_projects.data.flat());
    }
  }, [baseUrl]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadProjects();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  });

  useEffect(() => {
    loadProjects();
  }, [wallet, loadProjects]);

  const getTokenId = (txReceipt: any) => {
    const relevantTransferEvent = txReceipt.events.find((e: any) => e.event === "Minted");

    const owner = relevantTransferEvent.args.owner;
    const tokenId = relevantTransferEvent.args.tokenId;
    return { tokenId, owner };
  };

  const callAPI = async (data: any, method: (url: string, data: any) => Promise<any>) => {
    setShowLoading(true);
    try {
      const response = (await method(baseUrl, data)).data;

      setShowLoading(false);

      if (response.status) {
        if (response.status === "success") {
          toast.success(response.message);
          loadProjects();
        } else {
          toast.error(response.message);
        }
      } else {
        toast.error(`Can not determine response from server`);
      }
    } catch (error: any) {
      setShowLoading(false);
      toast.error(`Error buying NFT: ${error}`);
    }
  };

  const buyNft = async (project: Project) => {
    try {
      setShowLoading(true);
      if (wallet.isConnected()) {
        const nftContract = getNftContract(project.collection, wallet.ethereum);
        toast.info("Buying Nft....: ");

        const price = ethers.utils.parseEther(project.price + "");

        const buyNftPromise = nftContract.mint({ value: price });

        // walletStateContext.addNewQueuedTx(buyNftPromise, "Minting NFT...", {});

        const buyTx = await buyNftPromise;
        const buyTxExecuted = await buyTx.wait(1);

        toast.info("Checking Blockchain for transaction....");
        const isMined = await isTransactionMined(
          wallet.ethereum,
          buyTxExecuted.transactionHash,
          +(process.env.REACT_APP_TX_WAIT_BLOCK_COUNT as string)
        );

        if (!isMined) {
          toast.error(`Transaction not found after ${process.env.REACT_APP_TX_WAIT_BLOCK_COUNT as string} blocks`);
          return;
        } else {
          toast.info("Setting token Metadata");

          const { tokenId } = getTokenId(buyTxExecuted);

          const uri = project.nfts[tokenId].metadata;

          const setUrIPromise = nftContract.setTokenUri(tokenId, uri);
          walletStateContext.addNewQueuedTx(setUrIPromise, "Setting token Metadata", {});

          const setUriTx = await setUrIPromise;
          const setUriTxExecuted = await setUriTx.wait(1);
          const isMined = await isTransactionMined(
            wallet.ethereum,
            setUriTxExecuted.transactionHash,
            +(process.env.REACT_APP_TX_WAIT_BLOCK_COUNT as string)
          );

          if (!isMined) {
            toast.error(`Transaction not found after ${process.env.REACT_APP_TX_WAIT_BLOCK_COUNT as string} blocks`);
            return;
          } else {
            const data: NftBought = {
              wallet: wallet.account as string,
              collection: project.collection,
              tokenId: Number(tokenId),
            };
            
            callAPI(data, nftBought);
            toast.success("Purchase successful");
            toast.info(`New Token Minted with ID: ${tokenId}`);
          }
        }
        setShowLoading(false);
      } else {
        toast.error("Wallet is not connected");
        setShowLoading(false);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`Error occured buying nft: ${error.message ? error.message : error.toString()}`);
    } finally {
      setShowLoading(false);
    }
  };
  return (
    <Container maxWidth="lg" style={{ paddingTop: "10px" }}>
      <NavBar />
      {projects &&
        projects.map((pr: Project) => (
          <Fragment key={pr.hash}>
            {pr.stage === Stage.CREATED_COLLECTION && (
              <Card sx={{ minWidth: 275, paddingTop: "10px" }} key={pr.hash}>
                <hr />
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {pr.name}
                  </Typography>
                  <Typography sx={{ fontSize: 15 }} gutterBottom>
                    {pr.description}
                  </Typography>
                  <Grid container style={{ marginTop: "10px" }}>
                    {pr.nfts.slice(0, 10).map((nft) => (
                      <Fragment key={nft.metadata}>
                        <img width="20px" src={nft.image} alt={pr.collection} />
                      </Fragment>
                    ))}
                  </Grid>
                </CardContent>
                <CardActions>
                  <Button variant="contained" color="primary" size="medium" onClick={() => buyNft(pr)}>
                    Buy Nft
                  </Button>
                </CardActions>
              </Card>
            )}
          </Fragment>
        ))}
      <Loading open={showLoading} />
    </Container>
  );
};

export default BuyNft;
