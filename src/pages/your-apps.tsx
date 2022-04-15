import { Button, Card, CardActions, CardContent, Grid, Typography } from "@mui/material";
import { ethers } from "ethers";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useWallet } from "use-wallet";
import { frontEndSign, generateNFTs, loadUserProjects, resetProject, uploadLayersFile } from "../utils/api";
import { Project, Stage, Status } from "../utils/dtos";

interface Props {
  forceReload: boolean;
  editProject: (project: Project) => void;
  setShowLoading: (loading: boolean) => void;
}
const YourApps = (props: Props) => {
  const { forceReload, editProject, setShowLoading } = props;
  const wallet = useWallet();

  const [projects, setProjects] = useState<Array<Project>>([]);

  const loadProjects = useCallback(async () => {
    const _projects = await loadUserProjects(wallet.account as string);
    console.log("Loaded Projects: ", _projects.data);
    setProjects(_projects.data);
  }, [wallet]);

  useEffect(() => {
    loadProjects();
  }, [wallet, forceReload, loadProjects]);

  const callAPI = async (data: any, method: (data: any) => Promise<any>) => {
    setShowLoading(true);
    try {
      const response = (await method(data)).data;

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

  const handleFileChanged = async (e: any, project: Project) => {
    console.log("Handling File Chnaged: ", project);
    const selectedFile = e.target.files[0];
    const formData = new FormData();

    formData.append("layers", selectedFile);
    formData.append("name", project.name);
    formData.append("hash", project.hash);
    formData.append("wallet", wallet?.account || "");

    try {
      const message = ethers.utils.hashMessage(project.name + "-" + wallet.account);
      const signature = await frontEndSign(wallet.ethereum, wallet.account, message);
      formData.append("signature", signature);
    } catch (error: any) {
      toast.error(`Message Signing Failed`);
      return;
    }

    callAPI(formData, uploadLayersFile);
  };

  const prepareSignature = async (pr: Project) => {
    try {
      pr.signature = "";
      const message = ethers.utils.hashMessage(pr.name + "-" + wallet.account);
      const signature = await frontEndSign(wallet.ethereum, wallet.account, message);
      pr.signature = signature;
    } catch (error: any) {
      toast.error("Message Signing Failed");
      return;
    }
  };

  const generate = async (pr: Project) => {
    await prepareSignature(pr);
    if (pr.signature && pr.signature.length > 0) {
      callAPI(pr, generateNFTs);
    }
  };

  const reset = async (pr: Project) => {
    const reset = window.confirm("Are you sure you want to reset this project. This action can not be reversed.");
    if (reset) {
      await prepareSignature(pr);
      if (pr.signature && pr.signature.length > 0) {
        callAPI(pr, resetProject);
      }
    }
  };

  return (
    <Fragment>
      {projects &&
        projects.map((pr) => (
          <Card sx={{ minWidth: 275 }} key={pr.hash}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {pr.name}
              </Typography>
              <Typography sx={{ fontSize: 15 }} gutterBottom>
                {pr.description}
              </Typography>
              {pr.statusMessage && pr.statusMessage.length > 0 && (
                <Typography sx={{ fontSize: 15, color: "red" }} gutterBottom>
                  {pr.statusMessage.substring(0, 500)}
                </Typography>
              )}
            </CardContent>
            <CardActions>
              {pr.stage === Stage.NEW_PROJECT && (
                <Fragment>
                  <Grid container spacing={2}>
                    <Grid item xs={3} sx={{ textAlign: "right" }}>
                      <Button variant="contained" color="primary" size="medium" onClick={() => editProject(pr)}>
                        Edit App
                      </Button>
                    </Grid>

                    <Grid item xs={9}>
                      <input hidden type="file" onChange={(e) => handleFileChanged(e, pr)} id={`${pr.hash}-upload-button`} />
                      <label htmlFor={`${pr.hash}-upload-button`}>
                        <Button variant="contained" component="span" size="medium" color="secondary">
                          Upload Layers (zipped folder)
                        </Button>
                      </label>
                    </Grid>
                  </Grid>
                </Fragment>
              )}

              {pr.stage === Stage.UPLOAD_LAYERS_FILE && (
                <Fragment>
                  <Grid container spacing={2}>
                    <Grid item xs={4} sx={{ textAlign: "right" }}>
                      <Button disabled={pr.status === Status.PENDING} variant="contained" color="primary" size="medium" onClick={() => generate(pr)}>
                        Generate NFTs
                      </Button>
                    </Grid>
                  </Grid>
                </Fragment>
              )}

              {pr.stage === Stage.GENERATE_NFTS && (
                <Fragment>
                  <Grid container spacing={2}>
                    <Grid item xs={4} sx={{ textAlign: "right" }}>
                      <Button disabled={pr.status === Status.PENDING} variant="contained" color="primary" size="medium" onClick={() => generate(pr)}>
                        Upload to IPFS
                      </Button>
                    </Grid>
                  </Grid>
                </Fragment>
              )}

              {pr.stage !== Stage.NEW_PROJECT && (
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Button variant="contained" color="error" size="medium" onClick={() => reset(pr)}>
                      Reset Project
                    </Button>
                  </Grid>
                </Grid>
              )}
            </CardActions>
          </Card>
        ))}
    </Fragment>
  );
};

export default YourApps;
