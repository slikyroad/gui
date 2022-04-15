import { Container, Tab, Tabs } from "@mui/material";
import { Box } from "@mui/system";
import React, { Fragment, useState } from "react";
import { useWallet } from "use-wallet";
import { Project } from "../utils/dtos";
import Loading from "./components/loading";
import NavBar from "./nav-bar";
import NewAppForm from "./new-app-form";
import YourApps from "./your-apps";

const App = () => {
  const [value, setValue] = React.useState(0);
  const [reload, setReload] = useState<boolean>(false);
  const [project, setProject] = useState<Project>();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [showLoading, setShowLoading] = useState(false);

  const forceReload = () => {
    setReload(!reload);
  };

  const wallet = useWallet();

  const setTab = (tab: number) => {
    setValue(tab);
  }

  const selectProject = (project: Project) => {
    setTab(0);
    setEditMode(true);
    setProject(project);
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    console.log("forcing reload");
    forceReload();
  };

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };
  return (
    <Container maxWidth="lg" style={{ paddingTop: "10px" }}>
      <NavBar />
      <Tabs value={value} onChange={handleChange} aria-label="Tabs">
        <Tab label="Create New App" />
        <Tab label="Your Apps" />
      </Tabs>

      {wallet.isConnected() && (
        <Fragment>
          <TabPanel value={value} index={0}>
            <NewAppForm editMode={editMode} project={project} setShowLoading={setShowLoading} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <YourApps forceReload={reload} editProject={selectProject} setShowLoading={setShowLoading} />
          </TabPanel>
          <Loading open={showLoading} />
        </Fragment>
      )}
    </Container>
  );
};

export default App;
