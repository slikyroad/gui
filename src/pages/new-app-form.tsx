import { Button, ButtonGroup, Card, CardActions, CardContent, Container, Grid, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { ethers } from "ethers";
import { Fragment, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useWallet } from "use-wallet";
import { Project } from "../utils/dtos";
import LayerComponent from "./components/layer-component";
import LayersHelpTooltipComponent from "./components/layers-help-tooltip-component";
import { editProject, frontEndSign, startNewProject } from "../utils/api";

interface Props {
  editMode: boolean;
  setShowLoading: (loading: boolean) => void;
  project?: Project;
}

const NewAppForm = (props: Props) => {
  const defaultFormState = useMemo(() => {
    return {
      name: "",
      hash: "",
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
    };
  }, []);

  const { editMode, project, setShowLoading } = props;
  const wallet = useWallet();
  const [mode, setMode] = useState(editMode);
  const [formState, setFormState] = useState<Project>(defaultFormState);  

  const [layers, setLayers] = useState<Array<string>>(["new-layer-0"]);

  useEffect(() => {
    console.log("editMode: ", mode);
    console.log("project: ", project);
    if (mode && project) {
      const lo = project.layerConfigurations.flatMap((l) => l.layersOrder).map((l) => l.name);
      console.log("Layers Order: ", lo);
      setLayers(lo);
      setFormState(project);
    }

    if (wallet.status === "connected" && !mode) {
      setFormState((f) => {
        return { ...f, wallet: wallet.account as string };
      });
    }
  }, [wallet, defaultFormState, mode, project]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value,
    });
  };

  const handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      _formState.layerConfigurations[0].growEditionSizeTo = +event.target.value;
      setFormState({
        ..._formState,
      });
    }
  };

  const handleLayersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const index = +event.target.name;
    const value = event.target.value;

    const _layers = layers;
    _layers[index] = value;

    setLayers(_layers);
  };

  const addNewLayer = () => {
    const index = layers.length;
    setLayers([...layers, `new-layer-${index}`]);
  };

  const removeLayer = (layer: string) => {
    let _layers = layers;
    const index = _layers.indexOf(layer);
    _layers.splice(index, 1);
    setLayers([..._layers]);
  };

  const addNewApp = async () => {
    if (!formState.name || formState.name.length === 0) {
      toast.error("Please enter Project Name");
      return;
    }

    if (!formState.description || formState.description.length === 0) {
      toast.error("Please enter Project Description");
      return;
    }

    if (!formState.format.width || +formState.format.width <= 0) {
      toast.error("Please enter width of generated NFT");
      return;
    }

    if (!formState.format.height || +formState.format.height <= 0) {
      toast.error("Please enter height of generated NFT");
      return;
    }

    layers.forEach((layer) => {
      if (!layer || layer.length === 0) {
        toast.error("One of the layers is missing");
        return;
      }
    });

    formState.layerConfigurations[0].layersOrder = layers.map((layer) => {
      return { name: layer };
    });

    setShowLoading(true);
    try {
      const message = ethers.utils.hashMessage(formState.name + "-" + wallet.account);
      const signature = await frontEndSign(wallet.ethereum, wallet.account, message);
      formState.hash = message;
      formState.signature = signature;
    } catch (error: any) {
      toast.error(`Message Signing Failed: ${error.toString()}`);
      return;
    }
    try {
      let response;
      if (mode) {
        response = (await editProject(formState)).data;
      } else {
        response = (await startNewProject(formState)).data;
      }

      console.log(response);
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
    setLayers(["new-layer-0"]);
    setFormState(defaultFormState);
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                            onChange={handleFormatChange}
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
                            onChange={handleFormatChange}
                          />
                        </Grid>
                      </Fragment>
                    </CardContent>
                  </Fragment>
                </Grid>
                <Grid item xs={12}>
                  <Fragment>
                    <CardContent>
                      <Typography variant="h5" color="ButtonShadow" gutterBottom>
                        Layers Configuration
                      </Typography>
                      <Grid item xs={12}>
                        <TextField
                          name="growEditionSizeTo"
                          type="number"
                          label="How Many NFTs do you want to generate*"
                          value={formState.layerConfigurations[0].growEditionSizeTo}
                          fullWidth
                          margin="dense"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onChange={handleFormatChange}
                        />
                      </Grid>
                      {layers.map((layer, index) => (
                        <LayerComponent
                          key={`${layer}-${index}`}
                          removeLayer={removeLayer}
                          layer={layer}
                          index={index}
                          disableRemove={layers.length === 1}
                          handleChange={handleLayersChange}
                        />
                      ))}
                    </CardContent>
                    <CardActions>
                      <Grid item xs={7}></Grid>
                      <Grid item xs={5}>
                        <ButtonGroup variant="contained" aria-label="outlined primary button group">
                          <Button variant="outlined" onClick={() => addNewLayer()}>
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
              </Grid>
            </CardContent>
            <CardActions>
              <Grid container spacing={2} style={{ marginTop: "10px" }}>
                <Grid item xs={6}></Grid>
                <Grid item xs={3}>
                  {mode && (
                    <Button size="medium" color="error" variant="contained" onClick={() => cancelMode()}>
                      Cancel Edit
                    </Button>
                  )}
                </Grid>
                <Grid item xs={3} sx={{ textAlign: "right" }}>
                  <Button size="medium" color="primary" variant="contained" onClick={() => addNewApp()}>
                    {mode ? "Edit App Settings" : "Save App Settings"}
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
