import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { ethers } from "ethers";
import React, { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useWallet } from "use-wallet";
import { editProject, frontEndSign, loadUserProjects } from "../utils/api";
import { getSilkRoadContract, isTransactionMined } from "../utils/contract.utils";
import { Project, Stage, Status } from "../utils/dtos";
import { WalletStateContext } from "../utils/WalletStateContext";

interface CreateCollectionFormState {
  project: string;
  name: string;
  symbol: string;
  randomType: string;
  price: number;
}

interface Props {
  setShowLoading: (loading: boolean) => void;
}

const CreateCollectionForm = (props: Props) => {
  const silkRoadAddress = process.env.REACT_APP_SILKROAD_CONTRACT_ADDRESS as string;
  const baseUrl = process.env.REACT_APP_SERVER_URL as string;

  const { setShowLoading } = props;
  const [randomContracts, setRandomContracts] = useState<Array<string>>([]);

  const [formState, setFormState] = useState<CreateCollectionFormState>({
    project: "",
    name: "",
    symbol: "",
    randomType: "SilkRandom",
    price: 0,
  });

  const [isNameError, setIsNameError] = useState(false);
  const [nameError, setNameError] = useState("");

  const [isPriceError, setIsPriceError] = useState(false);
  const [priceError, setPriceError] = useState("");

  const [isSymbolError, setIsSymbolError] = useState(false);
  const [symbolError, setSymbolError] = useState("");

  const [projects, setProjects] = useState<Array<Project>>([]);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();

  const wallet = useWallet();
  const walletStateContext = useContext(WalletStateContext);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value,
    });
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setFormState({
      ...formState,
      [event.target.name]: event.target.value,
    });

    if (event.target.name === "project") {
      setSelectedProject(projects.find((pr) => pr.name === event.target.value));
    }
  };

  const loadProjects = useCallback(async () => {
    if (wallet.isConnected()) {
      const _projects = await loadUserProjects(baseUrl, wallet.account as string);
      if (_projects.data && _projects.data.length > 0) {
        setProjects(_projects.data);
        setFormState((oldState) => {
          return { ...oldState, project: _projects.data[0].name };
        });
        setSelectedProject(_projects.data[0]);
      }
    }
  }, [wallet, baseUrl]);

  useEffect(() => {
    const loadRandomContracts = async () => {
      if (wallet.isConnected()) {
        const silkRoadContract = getSilkRoadContract(silkRoadAddress, wallet.ethereum);
        const _randomContracts = await silkRoadContract.getRandomContractsLists();
        setRandomContracts(_randomContracts);
      }
    };

    loadRandomContracts();
    loadProjects();
  }, [wallet, loadProjects, silkRoadAddress]);

  const resetErrors = () => {
    setIsNameError(false);
    setNameError("");
    setIsSymbolError(false);
    setSymbolError("");
    setIsPriceError(false);
    setPriceError("");
  };

  const validate = (): boolean => {
    resetErrors();

    if (!formState.name || formState.name === "") {
      setIsNameError(true);
      setNameError("Please enter name of collection");
      return false;
    }

    if (!formState.price || formState.price === 0) {
      setIsPriceError(true);
      setPriceError("Please enter price of collection");
      return false;
    }

    if (!formState.symbol || formState.symbol === "") {
      setIsSymbolError(true);
      setSymbolError("Please enter collection symbol");
      return false;
    }

    return true;
  };

  const getCollectionAddress = (txReceipt: any) => {
    const relevantTransferEvent = txReceipt.events.find((e: any) => e.event === "CollectionCreated");

    const owner = relevantTransferEvent.args.owner;
    const address = relevantTransferEvent.args.collection;
    return { owner, address };
  };

  const callAPI = async (data: any, method: (url: string, data: any) => Promise<any>) => {
    setShowLoading(true);
    try {
      const response = (await method(baseUrl, data)).data;

      setShowLoading(false);

      if (response.status) {
        if (response.status === "success") {
          toast.success(response.message);
          loadProjects();
        } else {
          toast.error(response.message);
        }
      } else {
        toast.error(`Can not determine response from server`);
      }
    } catch (error: any) {
      setShowLoading(false);
      toast.error(`Can not generate NFTs: ${error}`);
    }
  };

  const prepareSignature = async (pr: Project) => {
    try {
      pr.signature = "";
      const message = ethers.utils.hashMessage(pr.name + "-" + wallet.account);
      const signature = await frontEndSign(wallet.ethereum, wallet.account, message);
      pr.signature = signature;
    } catch (error: any) {
      toast.error("Message Signing Failed");
      return;
    }
  };

  const createCollection = async () => {
    try {
      setShowLoading(true);
      if (validate()) {
        if (wallet.isConnected()) {
          const silkRoadContract = getSilkRoadContract(silkRoadAddress, wallet.ethereum);
          toast.info("Creating Collection....: ");
          console.log("Price: ", ethers.utils.parseUnits(formState.price.toString(), "ether"));
          const createCollectionTxPromise = silkRoadContract.createCollection(
            selectedProject?.layerConfigurations[0].growEditionSizeTo,
            ethers.utils.parseUnits(formState.price.toString(), "ether"),
            selectedProject?.hash + "1",
            formState.name,
            formState.symbol,
            formState.randomType
          );

          walletStateContext.addNewQueuedTx(createCollectionTxPromise, "Creating Collection...", {});

          const mintTx = await createCollectionTxPromise;
          const mintTxExecuted = await mintTx.wait(1);

          const isMined = await isTransactionMined(
            wallet.ethereum,
            mintTxExecuted.transactionHash,
            +(process.env.REACT_APP_TX_WAIT_BLOCK_COUNT as string)
          );

          if (!isMined) {
            toast.error(`Transaction not found after ${process.env.REACT_APP_TX_WAIT_BLOCK_COUNT as string} blocks`);
            return;
          } else {
            const { address } = getCollectionAddress(mintTxExecuted);

            toast.success("Collection Created Successfully.");

            toast.info("Cleaning up...");

            if (selectedProject) {
              selectedProject.collection = address;
              selectedProject.stage = Stage.CREATED_COLLECTION;
              selectedProject.status = Status.COMPLETED;
            }

            await prepareSignature(selectedProject as Project);
            callAPI(selectedProject, editProject);

            toast.info(`New Collection: ${address}`);
          }
        } else {
          toast.error("Wallet is not connected");
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`Error occured creating collection: ${error.message ? error.message : error.toString()}`);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <Fragment>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" color="ButtonShadow" gutterBottom>
            Create Collection Form
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
                <Select name="project" value={formState.project} onChange={handleSelectChange} inputProps={{ "aria-label": "Select App" }}>
                  {projects.map((project) => (
                    <MenuItem value={project.name} key={project.hash}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select App</FormHelperText>
              </FormControl>
            </Grid>
            {selectedProject && selectedProject.stage === Stage.CREATED_COLLECTION && selectedProject.status === Status.COMPLETED && (
              <Fragment>
                <Typography variant="body2" sx={{ padding: "5px", margin: "5px" }}>
                  You have created a collection for this project at : <b>{selectedProject.collection}</b>
                </Typography>
              </Fragment>
            )}
            {selectedProject && selectedProject.stage === Stage.UPLOAD_TO_IPFS && selectedProject.status === Status.COMPLETED ? (
              <Fragment>
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    type="text"
                    label="Collection Name"
                    value={formState.name}
                    fullWidth
                    margin="dense"
                    onChange={handleChange}
                    error={isNameError}
                    helperText={nameError}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="symbol"
                    type="text"
                    label="Collection Symbol"
                    value={formState.symbol}
                    fullWidth
                    margin="dense"
                    onChange={handleChange}
                    error={isSymbolError}
                    helperText={symbolError}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="price"
                    type="number"
                    label="Price per NFT"
                    value={formState.price}
                    fullWidth
                    margin="dense"
                    onChange={handleChange}
                    error={isPriceError}
                    helperText={priceError}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
                    <Select
                      value={formState.randomType}
                      onChange={handleSelectChange}
                      displayEmpty
                      inputProps={{ "aria-label": "Select Random Contract" }}>
                      {randomContracts.map((rc) => (
                        <MenuItem key={rc} value={rc}>{`${rc} Contract`}</MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Select Random Contract</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={4}>
                  <Button variant="contained" color="primary" size="medium" onClick={() => createCollection()}>
                    Create Collection
                  </Button>
                </Grid>
              </Fragment>
            ) : (
              null
            )}
          </Grid>
        </CardContent>
      </Card>
    </Fragment>
  );
};

export default CreateCollectionForm;
