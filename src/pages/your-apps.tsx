import { Button, Card, CardActions, CardContent, Grid, Typography } from "@mui/material";
import { ethers } from "ethers";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useWallet } from "use-wallet";
import { frontEndSign, loadUserProjects, uploadLayersFile } from "../utils/api";
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

  const handleFileChanged = async (e: any, project: Project) => {
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
      toast.error(`Message Signing Failed: ${error.toString()}`);
      return;
    }

    setShowLoading(true);
    try {
      console.log(formData);
      const response = (await uploadLayersFile(formData)).data;

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
      toast.error(`Can not save new project: ${error}`);
    }
  };

  return (
    <Fragment>
      {projects &&
        projects.map((pr, index) => (
          <Card sx={{ minWidth: 275 }} key={pr.hash}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {pr.name}
              </Typography>
              <Typography sx={{ fontSize: 14 }} gutterBottom>
                {pr.description}
              </Typography>
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
                      <input hidden type="file" onChange={(e) => handleFileChanged(e, pr)} id="raised-button-file" />
                      <label htmlFor="raised-button-file">
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
                    <Grid item xs={3} sx={{ textAlign: "right" }}>
                      <Button
                        disabled={pr.status === Status.PENDING}
                        variant="contained"
                        color="primary"
                        size="medium"
                        onClick={() => editProject(pr)}>
                        Generate NFTs
                      </Button>
                    </Grid>
                    <Grid item xs={9}>
                      <input hidden type="file" onChange={(e) => handleFileChanged(e, pr)} id="raised-button-file" />
                      <label htmlFor="raised-button-file">
                        <Button variant="contained" component="span" size="medium" color="secondary">
                          Upload Layers (zipped folder)
                        </Button>
                      </label>
                    </Grid>
                  </Grid>
                </Fragment>
              )}
            </CardActions>
          </Card>
        ))}
    </Fragment>
  );
};

export default YourApps;
