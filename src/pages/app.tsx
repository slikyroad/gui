import { Container, Tab, Tabs } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useWallet } from "use-wallet";
import NavBar from "./nav-bar";
import NewAppForm from "./new-app-form";

const App = () => {
  const [value, setValue] = React.useState(0);

  const wallet = useWallet();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
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

      <TabPanel value={value} index={0}>
      {wallet.isConnected() && <NewAppForm />}
      </TabPanel>            
      <TabPanel value={value} index={1}>
        Your Apps
      </TabPanel>
      </Container>
  );
};

export default App;
