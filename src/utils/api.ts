import axios from 'axios';
import { NewAppFormState } from './dtos';


const API = axios.create({
  baseURL: "http://localhost:8989"
});

export const startNewProject = (formState: NewAppFormState) => {    
    console.log("POSTing.....", formState);
    return API.post('/start-new-project', formState);
}