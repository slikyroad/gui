import axios from "axios";
import { NftBought, Project } from "./dtos";
import Web3 from "web3";

export const frontEndSign = async (signerOrProvider: any, account: any, message: string) => {
  const web3 = new Web3(signerOrProvider);
  const signature = await web3.eth.personal.sign(message, account, ""); // Last param is the password, and is null to request a signature in the wallet

  return signature;
};


export const uploadToIPFS = async (baseUrl: string, project: Project): Promise<any> => {
  console.log("POSTing.....", project);

  const API = axios.create({
    baseURL: baseUrl
    // baseURL: "http://localhost:8998",
    // baseURL: "https://silkroad-server-v2.herokuapp.com",
  });
  
  return new Promise((resolve, reject) => {
    API.post("/project/ipfs", project).then(
      (response) => {
        resolve(response);
      },
      (error) => {
        if (error.response && error.response.data) {
          reject(error.response.data.data.error);
        } else {
          reject(error);
        }
      }
    );
  });    
}

export const generateNFTs = async (baseUrl: string, project: Project): Promise<any> => {
  console.log("POSTing.....", project);

  const API = axios.create({
    baseURL: baseUrl
    // baseURL: "http://localhost:8998",
    // baseURL: "https://silkroad-server-v2.herokuapp.com",
  });

  return new Promise((resolve, reject) => {
    API.post("/project/generate", project).then(
      (response) => {
        resolve(response);
      },
      (error) => {
        if (error.response && error.response.data) {
          reject(error.response.data.data.error);
        } else {
          reject(error);
        }
      }
    );
  });    
}

export const resetProject = async (baseUrl: string, project: Project): Promise<any> => {
  console.log("POSTing.....", project);

  const API = axios.create({
    baseURL: baseUrl
    // baseURL: "http://localhost:8998",
    // baseURL: "https://silkroad-server-v2.herokuapp.com",
  });

  return new Promise((resolve, reject) => {
    API.post("/project/reset", project).then(
      (response) => {
        resolve(response);
      },
      (error) => {
        if (error.response && error.response.data) {
          reject(error.response.data.data.error);
        } else {
          reject(error);
        }
      }
    );
  });    
}

export const getUserNfts = (baseUrl: string, wallet: string): Promise<any> => {

  const API = axios.create({
    baseURL: baseUrl
    // baseURL: "http://localhost:8998",
    // baseURL: "https://silkroad-server-v2.herokuapp.com",
  });

  return new Promise((resolve, reject) => {    
    API.get(`/project/user-nfts/${wallet}`).then(
      (response) => {
        resolve(response.data);
      },
      (error) => {
        if (error.response && error.response.data) {
          reject(error.response.data.data.error);
        } else {
          reject(error);
        }
      }
    );
  });
};

export const nftBought = (baseUrl: string, data: NftBought): Promise<any> => {
  console.log("POSTing.....", data);

  const API = axios.create({
    baseURL: baseUrl
    // baseURL: "http://localhost:8998",
    // baseURL: "https://silkroad-server-v2.herokuapp.com",
  });

  return new Promise((resolve, reject) => {
    API.post("/project/nft-bought", data).then(
      (response) => {
        resolve(response);
      },
      (error) => {
        if (error.response && error.response.data) {
          reject(error.response.data.data.error);
        } else {
          reject(error);
        }
      }
    );
  });  
}

export const editProject = (baseUrl: string, formState: Project): Promise<any> => {
  console.log("POSTing.....", formState);

  const API = axios.create({
    baseURL: baseUrl
    // baseURL: "http://localhost:8998",
    // baseURL: "https://silkroad-server-v2.herokuapp.com",
  });

  return new Promise((resolve, reject) => {
    API.put("/project", formState).then(
      (response) => {
        resolve(response);
      },
      (error) => {
        if (error.response && error.response.data) {
          reject(error.response.data.data.error);
        } else {
          reject(error);
        }
      }
    );
  });
};

export const startNewProject = (baseUrl: string, formState: Project): Promise<any> => {
  console.log("POSTing.....", formState);

  const API = axios.create({
    baseURL: baseUrl
    // baseURL: "http://localhost:8998",
    // baseURL: "https://silkroad-server-v2.herokuapp.com",
  });

  return new Promise((resolve, reject) => {
    API.post("/project", formState).then(
      (response) => {
        resolve(response);
      },
      (error) => {
        if (error.response && error.response.data) {
          reject(error.response.data.data.error);
        } else {
          reject(error);
        }
      }
    );
  });
};

export const loadUserProjects = (baseUrl: string, wallet: string): Promise<any> => {

  const API = axios.create({
    baseURL: baseUrl
    // baseURL: "http://localhost:8998",
    // baseURL: "https://silkroad-server-v2.herokuapp.com",
  });

  return new Promise((resolve, reject) => {    
    API.get(`/project/${wallet}`).then(
      (response) => {
        resolve(response.data);
      },
      (error) => {
        if (error.response && error.response.data) {
          reject(error.response.data.data.error);
        } else {
          reject(error);
        }
      }
    );
  });
};

export const loadProjects = (baseUrl: string): Promise<any> => {

  const API = axios.create({
    baseURL: baseUrl
    // baseURL: "http://localhost:8998",
    // baseURL: "https://silkroad-server-v2.herokuapp.com",
  });

  return new Promise((resolve, reject) => {    
    API.get(`/project`).then(
      (response) => {
        resolve(response.data);
      },
      (error) => {
        if (error.response && error.response.data) {
          reject(error.response.data.data.error);
        } else {
          reject(error);
        }
      }
    );
  });
};