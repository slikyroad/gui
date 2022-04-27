import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import React, { Fragment } from "react";
import { Project } from "../utils/dtos";

interface Props {
  data: Project;
}

const Collection = (props: Props) => {
  const { data } = props;

  return (
    <Fragment>
      <Card variant="outlined">
          <CardHeader>
              Go Back
          </CardHeader>
        <CardContent>
          <Typography variant="h5" color="ButtonShadow" gutterBottom>
            Create Collection Form
          </Typography>
        </CardContent>
      </Card>
    </Fragment>
  );
};

export default Collection;
