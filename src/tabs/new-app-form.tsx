import { Button, ButtonGroup, Card, CardActions, CardContent, Container, Grid, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { ethers } from "ethers";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useWallet } from "use-wallet";
import { CloudinaryLayerImages, Project } from "../utils/dtos";
import LayerComponent from "../components/layer-component";
import LayersHelpTooltipComponent from "../components/layers-help-tooltip-component";
import { editProject, frontEndSign, startNewProject } from "../utils/api";
import { cloneDeep } from "lodash";
import axios from "axios";
import ImageUploader from "../components/uploader";

interface Props {
  editMode: boolean;
  setShowLoading: (loading: boolean) => void;
  changeTab: (index: number) => void;
  project?: Project;
}

const NewAppForm = (props: Props) => {
  const baseUrl = process.env.REACT_APP_SERVER_URL as string;
  const defaultFormState = useMemo(() => {
    return {
      name: "",
      hash: "",
      price: 0,
      description: "",
      wallet: "",
      tags: "",
      rarityDelimiter: "#",
      editionNameFormat: "#",
      outputDirName: "output",
      outputImagesDirName: "images",
      outputJsonDirName: "json",
      outputJsonFileName: "metadata.json",
      shuffleLayerConfigurations: false,
      uniqueDnaTorrance: 10000,
      outputImagesCarFileName: "images.car",
      outputMetadataCarFileName: "metadata.car",
      collection: "",
      nfts: [],
      layerConfigurations: [
        {
          growEditionSizeTo: 100,
          layersOrder: [],
        },
      ],
      preview: {
        imageName: "preview.png",
        imageRatio: 1,
        thumbPerRow: 20,
        thumbWidth: 60,
      },
      format: {
        width: 100,
        height: 100,
      },
      svgBase64DataOnly: false,
      cloudinaryFiles: [],
      layersList: "face,head,eyes",
    };
  }, []);

  const { editMode, project, setShowLoading, changeTab } = props;
  const wallet = useWallet();
  const [mode, setMode] = useState(editMode);
  const [formState, setFormState] = useState<Project>(defaultFormState);

  const [layers, setLayers] = useState<Array<Array<string>>>([defaultFormState.layersList.split(",")]);

  const [numLayersConfig, setNumLayersConfig] = useState(1);

  const [filesUploading, setFilesUploading] = useState<boolean>(false);

  useEffect(() => {
    if (mode && project) {
      const _layers = [];
      const layersOrder = project.layerConfigurations.map((l) => l.layersOrder);
      setNumLayersConfig(layersOrder.length);
      for (let i = 0; i < layersOrder.length; i++) {
        const layers = layersOrder[i];
        const _thisLayers = layers.map((l) => l.name);
        _layers.push(_thisLayers);
      }
      setLayers(_layers);
      setFormState(project);
    }

    if (wallet.status === "connected" && !mode) {
      setFormState((f) => {
        return { ...f, wallet: wallet.account as string };
      });
    }
  }, [wallet, defaultFormState, mode, project]);

  const handleChange = (event: any) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value,
    });
  };

  const handleFormatChange = (event: any, lcIndex: number) => {
    const name = event.target.name;

    if (name === "width") {
      const _formState = formState;
      _formState.format.width = +event.target.value;
      setFormState({
        ..._formState,
      });
    } else if (name === "height") {
      const _formState = formState;
      _formState.format.height = +event.target.value;
      setFormState({
        ..._formState,
      });
    } else if (name === "growEditionSizeTo") {
      const _formState = formState;
      _formState.layerConfigurations[lcIndex].growEditionSizeTo = +event.target.value;
      setFormState({
        ..._formState,
      });
    }
  };

  const handleLayersChange = (event: any, lcIndex: number) => {
    const index = +event.target.name;
    const value = event.target.value;

    const _layers = layers;
    _layers[lcIndex][index] = value;
    setLayers(_layers);
  };

  const addNewLayer = (lcIndex: number) => {
    const index = layers[lcIndex].length;
    const _layers = layers;
    _layers[lcIndex].push(`new-layer-${index}`);
    setLayers([..._layers]);
  };

  const removeLayerInCombination = (layer: string, lcIndex: number) => {
    let _layers = layers;
    const index = _layers[lcIndex].indexOf(layer);
    _layers[lcIndex].splice(index, 1);
    setLayers([..._layers]);
  };

  const addNewApp = async () => {
    if (filesUploading) {
      toast.error("Please wait for pending uploads to finish");
      return;
    }

    if (formState.cloudinaryFiles.length < formState.layersList.split(",").length) {
      toast.error("Incomplete layers file. Please upload layers files");
      return;
    }

    const _formState = cloneDeep(formState);
    if (!_formState.name || _formState.name.length === 0) {
      toast.error("Please enter Project Name");
      return;
    }

    if (!_formState.description || _formState.description.length === 0) {
      toast.error("Please enter Project Description");
      return;
    }

    if (!_formState.format.width || +_formState.format.width <= 0) {
      toast.error("Please enter width of generated NFT");
      return;
    }

    if (!_formState.format.height || +_formState.format.height <= 0) {
      toast.error("Please enter height of generated NFT");
      return;
    }

    const _layers = cloneDeep(layers);
    _layers.forEach((layer) => {
      if (!layer || layer.length === 0) {
        toast.error("One of the layers is missing");
        return;
      }
    });

    getLayersConfigAsArray().forEach((_, index) => {
      _formState.layerConfigurations[index].layersOrder = _layers[index].map((layer) => {
        return { name: layer };
      });
    });

    setShowLoading(true);
    try {
      const message = ethers.utils.hashMessage(_formState.name + "-" + wallet.account);
      const signature = await frontEndSign(wallet.ethereum, wallet.account, message);
      _formState.hash = message;
      _formState.signature = signature;
    } catch (error: any) {
      toast.error(`Message Signing Failed: ${error.toString()}`);
      return;
    }
    try {
      let response;
      if (mode) {
        response = (await editProject(baseUrl, _formState)).data;
      } else {
        response = (await startNewProject(baseUrl, _formState)).data;
      }

      setShowLoading(false);

      if (response.status) {
        if (response.status === "success") {
          toast.success(response.message);
          cancelMode();
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

  const cancelMode = () => {
    setMode(false);
    setLayers([["new-layer-0"]]);
    setFormState(defaultFormState);
    if (mode) {
      changeTab(1);
    }
  };

  const getLayersConfigAsArray = (): Array<number> => {
    let sum = 0;
    const numLayers = Array.from(Array(numLayersConfig)).map((x) => ++sum);
    return numLayers;
  };

  const removeLayerCombination = () => {
    const _layers = layers;
    _layers.pop();
    setLayers([..._layers]);

    const layersConfig = formState.layerConfigurations;
    layersConfig.pop();

    setFormState({
      ...formState,
      layerConfigurations: layersConfig,
    });

    setNumLayersConfig(numLayersConfig - 1);
  };

  const addNewLayersConfig = () => {
    const _layers = layers;

    _layers.push(["new-layer-0"]);

    setLayers(_layers);

    setNumLayersConfig(numLayersConfig + 1);
    const lc = {
      growEditionSizeTo: 100,
      layersOrder: [],
    };

    const layersConfig = formState.layerConfigurations;
    layersConfig.push(lc);

    setFormState({
      ...formState,
      layerConfigurations: layersConfig,
    });
  };

  const layerImages = (layer: string): string[] => {
    const cli = formState.cloudinaryFiles.find((cf) => cf.layerName === layer);
    if (cli) {
      return cli.layerImages;
    }

    return [];
  };

  const onFilesDropped = async (files: FileList, layer: string) => {
    if (filesUploading) {
      toast.error("Please wait for pending uploads to finish");
      return;
    }

    console.log(layer);
    console.log(formState.cloudinaryFiles);

    toast("Uploading please wait....");
    let layerImagesIndex = formState.cloudinaryFiles.findIndex((cf) => cf.layerName === layer);

    let layersImages: CloudinaryLayerImages;

    const _cf = cloneDeep(formState.cloudinaryFiles);

    if (layerImagesIndex < 0) {
      layersImages = {
        layerName: layer,
        layerImages: [],
        originalFileNames: [],
      };
    } else {
      layersImages = _cf[layerImagesIndex];
      if (!layersImages.originalFileNames) {
        layersImages.originalFileNames = [];
      }
    }

    setFilesUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i) as File;
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "mrefmkcs");

      const image = await axios.post("https://api.cloudinary.com/v1_1/chimerahedonista/upload", data);

      const url = image.data.secure_url;

      console.log(url);

      layersImages.layerImages.push(url);
      layersImages.originalFileNames.push(file.name);
    }

    console.log(layersImages);

    if (layerImagesIndex >= 0) {
      _cf[layerImagesIndex] = layersImages;
    } else {
      _cf.push(layersImages);
    }

    console.log(_cf);

    setFormState({
      ...formState,
      cloudinaryFiles: _cf,
    });

    toast("Uploads finished succesfully");
    setFilesUploading(false);
  };

  const resetLayerImages = (layer: string) => {
    const cli = formState.cloudinaryFiles.find((cf) => cf.layerName === layer);
    const _cf = cloneDeep(formState.cloudinaryFiles);
    let layerImagesIndex = formState.cloudinaryFiles.findIndex((cf) => cf.layerName === layer);

    if (cli) {
      cli.layerImages = [];
      _cf[layerImagesIndex] = cli;
    }

    setFormState({
      ...formState,
      cloudinaryFiles: _cf,
    });
  };

  const removeOneLayer = (layer: string) => {
    resetLayerImages(layer);
    const layersAsList = formState.layersList.split(",");
    const _newLayersList = layersAsList.filter((l) => l !== layer).join(",");
    setFormState({ ...formState, layersList: _newLayersList });
  };

  return (
    <Container maxWidth="md" style={{ paddingTop: "10px" }}>
      <Box sx={{ minWidth: 275 }}>
        <Card variant="outlined">
          <Fragment>
            <CardContent>
              <Typography variant="h5" color="ButtonShadow" gutterBottom>
                New App Form
              </Typography>
              <Grid container spacing={2} style={{ marginTop: "10px" }}>
                <Grid item xs={12}>
                  <TextField
                    disabled={mode}
                    name="name"
                    type="text"
                    label="Project Name*"
                    value={formState.name}
                    fullWidth
                    margin="dense"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => handleChange(e)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="description"
                    type="text"
                    label="Description*"
                    value={formState.description}
                    fullWidth
                    margin="dense"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => handleChange(e)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    placeholder="comma separated list of tags"
                    name="tags"
                    type="text"
                    label="Tags"
                    value={formState.tags || ""}
                    fullWidth
                    margin="dense"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => handleChange(e)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Fragment>
                    <CardContent>
                      <Typography variant="h5" color="ButtonShadow" gutterBottom>
                        Format (in Pixels)
                      </Typography>
                      <Fragment>
                        <Grid item xs={12}>
                          <TextField
                            name="width"
                            type="number"
                            label="Width"
                            value={formState.format.width}
                            fullWidth
                            margin="dense"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            onChange={(e) => handleFormatChange(e, -1)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            name="height"
                            type="number"
                            label="Height"
                            value={formState.format.height}
                            fullWidth
                            margin="dense"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            onChange={(e) => handleFormatChange(e, -1)}
                          />
                        </Grid>
                      </Fragment>
                    </CardContent>
                  </Fragment>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    placeholder="comma separated list of your layers"
                    name="layersList"
                    type="layersList"
                    label="Layers List (comma separated list of your layers)"
                    value={formState.layersList}
                    fullWidth
                    margin="dense"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => handleChange(e)}
                  />
                </Grid>
                {formState.layersList
                  .split(",")
                  .filter((layer) => layer.length > 0)
                  .map((layer) => (
                    <ImageUploader
                      key={layer}
                      layer={layer}
                      layerImages={layerImages}
                      onFilesDropped={onFilesDropped}
                      removeOneLayer={removeOneLayer}
                      resetLayerImages={resetLayerImages}
                    />
                  ))}
                {getLayersConfigAsArray().map((_, lcIndex) => (
                  <Grid item xs={12} key={lcIndex}>
                    <Fragment>
                      <CardContent>
                        <Typography variant="h5" color="ButtonShadow" gutterBottom>
                          Layers Combination #{lcIndex + 1}
                        </Typography>
                        <Grid item xs={12}>
                          <TextField
                            name="growEditionSizeTo"
                            type="number"
                            label="How Many NFTs do you want to generate for this combination*"
                            value={formState.layerConfigurations[lcIndex].growEditionSizeTo}
                            fullWidth
                            margin="dense"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            onChange={(e) => handleFormatChange(e, lcIndex)}
                          />
                        </Grid>
                        {layers[lcIndex].map((layer, index) => (
                          <LayerComponent
                            key={`${layer}-${index}`}
                            removeLayer={removeLayerInCombination}
                            layer={layer}
                            index={index}
                            lcIndex={lcIndex}
                            disableRemove={layers[lcIndex].length === 1}
                            handleChange={(e) => handleLayersChange(e, lcIndex)}
                          />
                        ))}
                      </CardContent>
                      <CardActions>
                        <Grid item xs={2}></Grid>
                        <Grid item xs={5}></Grid>
                        <Grid item xs={5}>
                          <ButtonGroup variant="contained" aria-label="outlined primary button group">
                            <Button variant="outlined" onClick={() => addNewLayer(lcIndex)}>
                              Add New Layer
                            </Button>
                            <Button variant="outlined">
                              <LayersHelpTooltipComponent />
                            </Button>
                          </ButtonGroup>
                        </Grid>
                      </CardActions>
                    </Fragment>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
            <CardActions>
              <Grid container spacing={2} style={{ marginTop: "10px" }}>
                <Grid item xs={12}>
                  <ButtonGroup variant="contained" aria-label="outlined primary button group">
                    <Button variant="outlined" onClick={() => addNewLayersConfig()}>
                      Add New Layers Combination
                    </Button>
                    <Button disabled={numLayersConfig === 1} variant="contained" color="error" onClick={() => removeLayerCombination()}>
                      Remove Layer Combination
                    </Button>
                  </ButtonGroup>
                </Grid>
                <Grid item xs={4}></Grid>
                <Grid item xs={4}>
                  {mode && (
                    <Button size="medium" color="error" variant="contained" onClick={() => cancelMode()}>
                      Cancel Edit
                    </Button>
                  )}
                </Grid>
                <Grid item xs={4} sx={{ textAlign: "right" }}>
                  <Button size="medium" color="primary" variant="contained" onClick={() => addNewApp()}>
                    {mode ? "Update App Settings" : "Save App Settings"}
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </Fragment>
        </Card>
      </Box>
    </Container>
  );
};

export default NewAppForm;
