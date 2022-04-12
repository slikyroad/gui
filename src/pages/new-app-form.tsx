import { Button, ButtonGroup, Card, CardActions, CardContent, Container, Grid, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { ethers } from "ethers";
import { Fragment, useState } from "react";
import { toast } from "react-toastify";
import { useWallet } from "use-wallet";
import { NewAppFormState } from "../utils/dtos";
import LayerComponent from "./components/layer-component";
import LayersHelpTooltipComponent from "./components/layers-help-tooltip-component";
import Web3 from "web3";
import { startNewProject } from "../utils/api";
import Loading from "./components/loading";

const NewAppForm = () => {
  const wallet = useWallet();
  const defaultFormState: NewAppFormState = {
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
    layerConfigurations: [
      {
        growEditionSizeTo: 100,
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

  const [formState, setFormState] = useState<NewAppFormState>(defaultFormState);
  const [showLoading, setShowLoading] = useState(false);

  const [layers, setLayers] = useState<Array<string>>(["new-layer-0"]);

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

  const frontEndSign = async (signerOrProvider: any, account: any, message: string) => {
    const web3 = new Web3(signerOrProvider);
    const signature = await web3.eth.personal.sign(message, account, ""); // Last param is the password, and is null to request a signature in the wallet

    // console.log(message);
    // console.log(signature);
    return signature;
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

    const _formState = formState;
    _formState.name = formState.name + "-" + wallet.account;

    setShowLoading(true);
    try {
      const message = ethers.utils.hashMessage(_formState.name);
      const signature = await frontEndSign(wallet.ethereum, wallet.account, message);
      formState.hash = message;
      formState.signature = signature;
    } catch (error: any) {
      toast.error(`Message Signing Failed: ${error.toString()}`);
    }
    try {
      const response = (await startNewProject(formState)).data;
      setShowLoading(false);

      if (response.data.message) {
        if (response.status === "success") {
          toast.success(response.data.message);
          setFormState(defaultFormState);
        } else {
          toast.error(response.data.message);
        }
      } else {
        toast.error(`Can not determine response from server`);
      }
    } catch (error: any) {
      setShowLoading(false);
      toast.error(`Can not save new project: ${error.toString()}`);
    }
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
                    name="name"
                    type="text"
                    label="Project Name*"
                    defaultValue={formState?.name}
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
                    defaultValue={formState?.name}
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
                    defaultValue={formState?.tags}
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
                            defaultValue={formState.format.width}
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
                            defaultValue={formState.format.height}
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
                          defaultValue={formState.layerConfigurations[0].growEditionSizeTo}
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
                <Grid item xs={8}></Grid>
                <Grid item xs={4}>
                  <Button size="medium" color="primary" variant="contained" onClick={() => addNewApp()}>
                    Save App Settings
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </Fragment>
        </Card>
      </Box>
      <Loading open={showLoading} />
    </Container>
  );
};

export default NewAppForm;
