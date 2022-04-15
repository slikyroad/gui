import axios from "axios";
import { Project } from "./dtos";
import Web3 from "web3";

const API = axios.create({
  //baseURL: "http://localhost:8998",
  baseURL: "https://silkroad-server-v2.herokuapp.com",
});

export const frontEndSign = async (signerOrProvider: any, account: any, message: string) => {
  const web3 = new Web3(signerOrProvider);
  const signature = await web3.eth.personal.sign(message, account, ""); // Last param is the password, and is null to request a signature in the wallet

  return signature;
};


export const uploadToIPFS = async (project: Project): Promise<any> => {
  console.log("POSTing.....", project);
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

export const generateNFTs = async (project: Project): Promise<any> => {
  console.log("POSTing.....", project);
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

export const resetProject = async (project: Project): Promise<any> => {
  console.log("POSTing.....", project);
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

export const uploadLayersFile = async (formData: any): Promise<any> => {
  console.log("POSTing.....", formData);
  return new Promise((resolve, reject) => {
    API.post("/layers/upload", formData).then(
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

export const editProject = (formState: Project): Promise<any> => {
  console.log("POSTing.....", formState);
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

export const startNewProject = (formState: Project): Promise<any> => {
  console.log("POSTing.....", formState);
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

export const loadUserProjects = (wallet: string): Promise<any> => {
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
