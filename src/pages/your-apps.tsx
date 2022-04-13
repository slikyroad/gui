import { Button, Card, CardActions, CardContent, Typography } from "@mui/material";
import React, { Fragment, useEffect, useState } from "react";
import { useWallet } from "use-wallet";
import { loadUserProjects } from "../utils/api";
import { Project, Stage } from "../utils/dtos";

interface Props {
  forceReload: boolean;
  editProject: (project: Project) => void;
}
const YourApps = (props: Props) => {
  const { forceReload, editProject } = props;
  const wallet = useWallet();

  const [projects, setProjects] = useState<Array<Project>>([]);

  useEffect(() => {
    const loadProjects = async () => {
      const _projects = await loadUserProjects(wallet.account as string);
      console.log("Loaded Projects: ", _projects.data);
      setProjects(_projects.data);
    };

    loadProjects();
  }, [wallet, forceReload]);

  return (
    <Fragment>
      {projects &&
        projects.map((pr) => (
          <Card sx={{ minWidth: 275 }} key={pr.hash}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {pr.name}
              </Typography>
              <Typography sx={{ fontSize: 14 }} gutterBottom>
                {pr.description}
              </Typography>
              <Typography sx={{ fontSize: 14 }} gutterBottom>
                {}
              </Typography>
            </CardContent>
            <CardActions>
              {pr.stage === Stage.NEW_PROJECT && (
                <Fragment>
                  <Button variant="contained" color="primary" size="medium" onClick={() => editProject(pr)}>
                    Edit App
                  </Button>

                  <Button variant="contained" color="primary" size="medium">
                    Upload Layers File
                  </Button>
                </Fragment>
              )}
            </CardActions>
          </Card>
        ))}
    </Fragment>
  );
};

export default YourApps;
