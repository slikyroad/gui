import axios from 'axios';
import { NewAppFormState } from './dtos';


const API = axios.create({
  baseURL: "http://localhost:8998"
});

export const startNewProject = (formState: NewAppFormState): Promise<any> => {    
    console.log("POSTing.....", formState);
    return new Promise((resolve, reject) => {
        API.post('/project/start', formState).then(response => {
            resolve(response);
        }, error => {
            if(error.response && error.response.data) {
                reject(error.response.data.data.error);
            } else {            
                reject(error);
            }
        });
    })
}