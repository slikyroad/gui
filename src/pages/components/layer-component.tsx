import { RemoveCircleOutline } from "@mui/icons-material";
import { Button, Grid, TextField } from "@mui/material";
import React from "react";

export interface Props {
  layer: string;
  index: number;
  lcIndex: number;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeLayer: (layer: string, lcIndex: number) => void;
  disableRemove: boolean;
}
const LayerComponent = (props: Props) => {
  const { layer, lcIndex, index, handleChange, removeLayer, disableRemove } = props;
  return (
    <Grid container spacing={2} style={{ marginTop: "10px" }}>
      <Grid item xs={10}>
        <TextField
          name={`${index}`}
          type="text"
          label="Layer Name*"
          defaultValue={layer}
          fullWidth
          margin="dense"
          InputLabelProps={{
            shrink: true,
          }}
          onChange={handleChange}
        />
      </Grid>

      <Grid item xs={2} style={{ marginTop: "10px" }}>
        <Button variant="outlined" disabled={disableRemove} onClick={() => removeLayer(layer, lcIndex)}>
          <RemoveCircleOutline fontSize="large" color="warning" />
        </Button>
      </Grid>
    </Grid>
  );
};

export default LayerComponent;
