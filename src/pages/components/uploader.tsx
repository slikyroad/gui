import { RemoveCircleOutline } from "@mui/icons-material";
import { Button, Grid, Typography } from "@mui/material";
import React, { Fragment } from "react";
import { FileUploader } from "react-drag-drop-files";

export interface Props {
  layer: string;
  onFilesDropped: (files: FileList, layer: string) => void;
  removeOneLayer: (layer: string) => void;
  layerImages: (layer: string) => string[];
  resetLayerImages: (layer: string) => void;
}

const fileTypes = ["JPEG", "PNG", "GIF"];
const ImageUploader = (props: Props) => {
  const { layer, onFilesDropped, removeOneLayer, layerImages, resetLayerImages } = props;
  return (
    <Grid item xs={12} key={layer}>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="body1" color="ButtonShadow" gutterBottom>
            Upload{" "}
            <b>
              <u>{layer}</u>
            </b>{" "}
            Files
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <FileUploader
            classes="file-uploder"
            multiple={true}
            // handleChange={handleChange}
            handleChange={(files: FileList) => onFilesDropped(files, layer)}
            name={`layer-files-${layer}`}
            types={fileTypes}
            label="Upload or drag file(s) here"
          />
        </Grid>
        <Grid item xs={4}>
          <Button variant="outlined" color="success" onClick={() => removeOneLayer(layer)}>
            <RemoveCircleOutline fontSize="large" color="warning" />
          </Button>
        </Grid>
        <Grid item xs={12}>
          {layerImages(layer).map((layerImage) => (
            <Typography variant="caption" color="ButtonShadow" gutterBottom>
              <a href={layerImage}>{layerImage.substring(layerImage.lastIndexOf("/") + 1)}</a>
              {"/,"}
            </Typography>
          ))}
          <br />
          {layerImages(layer).length > 0 && (
            <Fragment>
              <Button sx={{ marginTop: "5px" }} variant="outlined" color="error" onClick={() => resetLayerImages(layer)}>
                Reset Images
              </Button>
            </Fragment>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ImageUploader;
