import React, { Fragment } from "react";
import NavBar from "./nav-bar";
import NewAppForm from "./new-app-form";

const App = () => {
  return (
    <Fragment>
      <NavBar />
      <NewAppForm />
    </Fragment>
  );
};

export default App;
