import { Status } from "./status";

export interface LoginResponseModel extends Status{
    email: string,
    grant: number,
    name: string, 
    token:string, 
}