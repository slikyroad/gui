import { Button, Card, CardActions, CardContent, Grid, Typography } from "@mui/material";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useWallet } from "use-wallet";
import { loadUserProjects } from "../utils/api";
import { getNftContract } from "../utils/contract.utils";
import { Project, Stage } from "../utils/dtos";

interface Props {
  setShowLoading: (loading: boolean) => void;
}

const BuyNft = (props: Props) => {
  const baseUrl = process.env.REACT_APP_SERVER_URL as string;
  const { setShowLoading } = props;
  const wallet = useWallet();

  const [projects, setProjects] = useState<Array<Project>>([]);

  const loadProjects = useCallback(async () => {
    const _projects = await loadUserProjects(baseUrl, wallet.account as string);
    if (_projects.data && _projects.data.length > 0) {
      setProjects(_projects.data);
    }
  }, [wallet, baseUrl]);

  useEffect(() => {
    loadProjects();
  }, [wallet, loadProjects]);

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
      toast.error(`Can not generate NFTs: ${error}`);
    }
  };

  const buyNft = async (collectionAddress: string) => {
    setShowLoading(true);
    if (wallet.isConnected()) {
      const nftContract = getNftContract(collectionAddress, wallet.ethereum);
      toast.info("Buying Nft....: ");
    } else {
      toast.error("Wallet is not connected");
      setShowLoading(false);
    }
  };
  return (
    <Fragment>
      {projects &&
        projects.map((pr: Project) => (
          <Fragment>
            {pr.stage === Stage.CREATED_COLLECTION && (
              <Card sx={{ minWidth: 275 }} key={pr.hash}>
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
                      <Fragment>
                        <img width="20px" src={nft.image} alt={pr.collection} />
                      </Fragment>
                    ))}
                  </Grid>
                </CardContent>
                <CardActions>
                  <Button variant="contained" color="primary" size="medium" onClick={() => buyNft(pr.collection)}>
                    Buy Nft
                  </Button>
                </CardActions>
              </Card>
            )}
          </Fragment>
        ))}
    </Fragment>
  );
};

export default BuyNft;
