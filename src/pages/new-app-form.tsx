import {
  Button,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  styled,
  TextField,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { Fragment, useEffect, useState } from "react";
import { FormError, NewAppFormState } from "../utils/dtos";
import RemoveIcon from "@mui/icons-material/Remove";
import { LightbulbOutlined } from "@mui/icons-material";

interface LayerInterface {
  index: number;
  name: string;
}

const NewAppForm = () => {
  const [formState, setFormState] = useState<NewAppFormState>({});
  const [formErrors, setFormErrors] = useState<Array<FormError>>([]);
  const [layers, setLayers] = useState<Array<string>>(["new-layer-0"]);
  const [growEditionSizeTo, setGrowEditionSizeTo] = useState(100);

  const resetValidation = () => {};

  const getFormError = (name: string | undefined) => {
    if (name) {
      return formErrors.find((fe) => fe.component === name);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value,
    });
  };

  const handleLayersChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const index = +event.target.name;
    const value = event.target.value;

    const _layers = layers;
    _layers[index] = value;

    console.log(_layers);
    setLayers(_layers);
  };

  const addNewLayer = () => {
    const index = layers.length;
    setLayers([...layers, `new-layer-${index}`]);
  };

  const removeLayer = (layer: string) => {
    console.log("removing...", layer);
    let _layers = layers;
    const index = _layers.indexOf(layer);
    console.log(index);
    _layers.splice(index, 1);
    console.log(_layers);
    setLayers([..._layers]);
  };

  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#f5f5f9",
      color: "rgba(0, 0, 0, 0.87)",
      maxWidth: 320,
      fontSize: theme.typography.pxToRem(12),
      border: "1px solid #dadde9",
    },
  }));

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
                    label="Project Name"
                    defaultValue={formState?.name}
                    fullWidth
                    margin="dense"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={handleChange}
                    error={getFormError("name")?.isError}
                    helperText={getFormError("name")?.error}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    name="description"
                    type="text"
                    label="Description"
                    defaultValue={formState?.name}
                    fullWidth
                    margin="dense"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={handleChange}
                    error={getFormError("description")?.isError}
                    helperText={getFormError("description")?.error}
                  />
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
                          label="How Many NFTs do you want to generate"
                          defaultValue={growEditionSizeTo}
                          fullWidth
                          margin="dense"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          onChange={handleChange}
                          error={getFormError("name")?.isError}
                          helperText={getFormError("name")?.error}
                        />
                      </Grid>
                      {layers.map((layer, index) => (
                        <Fragment key={`${layer}-${index}`}>
                          <Grid container spacing={2} style={{ marginTop: "10px" }}>
                            <Grid item xs={10}>
                              <TextField
                                name={`${index}`}
                                type="text"
                                label="Layer Name"
                                defaultValue={layer}
                                fullWidth
                                margin="dense"
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                onChange={handleLayersChange}
                                error={getFormError(`${index}`)?.isError}
                                helperText={getFormError(`${index}`)?.error}
                              />
                            </Grid>

                            <Grid item xs={2} style={{ marginTop: "10px" }}>
                              <Button variant="outlined" disabled={layers.length === 1} onClick={() => removeLayer(layer)}>
                                <RemoveIcon fontSize="large" color="warning" />
                              </Button>
                            </Grid>
                          </Grid>
                        </Fragment>
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
                            <HtmlTooltip arrow
                              title={
                                <Fragment>
                                  <em>Each layer represents a folder that contains different images (traits) for that layer.</em>
                                  <p>
                                    <em>
                                      For instance, a <b>face</b> layer will contain the different types of faces for your project
                                    </em>
                                  </p>

                                  <p>
                                    {" "}
                                    <em>
                                      You can assign rarity by adding <b>#</b> and a number to your file names.
                                    </em>
                                  </p>

                                  <p>
                                    <em>If your faces folder contains two files, e.g <b>blue-eyes.png</b> and <b>brown-eyes.png</b>, you can rename them thus</em>{" "}
                                  </p>

                                  <p>
                                    {" "}
                                    <em>
                                      <b>blue-eyes#15.png</b> and <b>brown-eyes#85.png</b> this means that for every 100 NFTs generated, blue-eyes will appear 15
                                      times and brown-eyes will appear 85 times
                                    </em>
                                  </p>
                                  <p>
                                    <em>
                                      Typical layer names are <b>head</b>,<b>face</b>,<b>eyes</b>,<b>mouth</b>
                                    </em>
                                  </p>
                                </Fragment>
                              }>
                              <LightbulbOutlined />
                            </HtmlTooltip>
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
                  <Button size="medium" color="primary" variant="contained">
                    Save App Settings
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
