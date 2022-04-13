import axios from "axios";
import { Project } from "./dtos";

const API = axios.create({
  baseURL: "http://localhost:8998",
});

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
