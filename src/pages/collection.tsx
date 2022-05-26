import { Container, Grid, Typography } from "@mui/material";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useWallet } from "use-wallet";
import Loading from "../components/loading";
import NavBar from "../components/nav-bar";
import { getUserNfts } from "../utils/api";
import { getNftContract } from "../utils/contract.utils";
import { NftBought } from "../utils/dtos";

const Collection = () => {
  const baseUrl = process.env.REACT_APP_SERVER_URL as string;

  const tokenUrl = "https://blockscout.com/xdai/mainnet/token/{collection}/instance/{tokenId}/token-transfers";
  const wallet = useWallet();

  const [showLoading, setShowLoading] = useState(false);
  const [nfts, setNfts] = useState<Array<NftBought>>([]);

  const getImageUrl = useCallback(
    async (collection: string, tokenId: number): Promise<string> => {
      const nftContract = getNftContract(collection, wallet.ethereum);
      const metadataUri = await nftContract.tokenURI(tokenId);
      const metadata = await fetch(metadataUri);
      const metadataJson = await metadata.json();

      return metadataJson.image;
    },
    [wallet]
  );

  const loadUserNfts = useCallback(async () => {
    setShowLoading(true);
    const _nfts = await getUserNfts(baseUrl, wallet.account || "");
    if (_nfts.data && _nfts.data.length > 0) {
      const data = _nfts.data;
      for (let d of data) {
        const imageUrl = await getImageUrl(d.collection, d.tokenId);
        d.imageUrl = imageUrl;
      }

      console.log(data);
      setNfts(data);
    }
    setShowLoading(false);
  }, [baseUrl, wallet, getImageUrl]);

  useEffect(() => {
    loadUserNfts();
  }, [loadUserNfts]);

  return (
    <Container maxWidth="lg" style={{ paddingTop: "10px" }}>
      <NavBar />
      <Grid container style={{ marginTop: "10px" }}>
        {nfts.map((nft) => (
          <Fragment key={nft.collection + nft.tokenId}>
            <Grid item xs={4}>
              <Grid container style={{ marginTop: "10px" }}>
                <Grid item xs={12}>
                  <img width="200px" src={nft.imageUrl} alt={nft.tokenId + ""} />
                </Grid>
                <Grid item xs={12}>                
                  <Typography variant="caption">
                      <a target="_blank" rel="noreferrer" href={tokenUrl.replace("{collection}", nft.collection).replace("{tokenId}", nft.tokenId+"")}>
                          View on Blockchain
                      </a>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Fragment>
        ))}
      </Grid>
      <Loading open={showLoading} />
    </Container>
  );
};

export default Collection;
