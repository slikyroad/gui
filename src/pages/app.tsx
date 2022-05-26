import { Container, Tab, Tabs } from "@mui/material";
import { Box } from "@mui/system";
import React, { Fragment, useState } from "react";
import { useWallet } from "use-wallet";
import { Project } from "../utils/dtos";
import Loading from "../components/loading";
import NavBar from "../components/nav-bar";
import NewAppForm from "../tabs/new-app-form";
import YourApps from "../tabs/your-apps";
import CreateCollectionForm from "../tabs/create-collection";
import { Outlet } from "react-router-dom";

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
  };

  const selectProject = (project: Project) => {
    setTab(0);
    setEditMode(true);
    setProject(project);
  };

  const changeTab = (tabIndex: number) => {
    setTab(tabIndex);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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
        <Tab label="Create Collection" />
      </Tabs>

      {wallet.isConnected() && (
        <Fragment>
          <TabPanel value={value} index={0}>
            <NewAppForm editMode={editMode} project={project} setShowLoading={setShowLoading} changeTab={changeTab} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <YourApps forceReload={reload} editProject={selectProject} setShowLoading={setShowLoading} />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <CreateCollectionForm setShowLoading={setShowLoading} />
          </TabPanel>
          <Loading open={showLoading} />
        </Fragment>
      )}
      <Outlet />
    </Container>
  );
};

export default App;
