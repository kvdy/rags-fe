import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChangePasswrd } from '../models/change-password';
import { LoginResponseModel } from '../models/login-response';
import { LoginRequestModel } from '../models/loginRequestModel';
import { SignupRequestModel } from '../models/signupReqModel';
import { Status } from '../models/status';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private baseUrl = environment.baseUrl+'/auth';
  constructor(private http:HttpClient) { 

  }

  login(model:LoginRequestModel){
    console.log(this.baseUrl)
    console.log(JSON.stringify(model));
    let loginRequest = {
      "email": model.username,
      "password": model.password
    };
    console.log(JSON.stringify(loginRequest))
  return this.http.post<LoginResponseModel>(this.baseUrl+'/login',loginRequest);
  }

  signup(model:SignupRequestModel){
     return this.http.post<Status>(this.baseUrl+'/register',model);
  }

  chagePassword(model:ChangePasswrd){
    return this.http.post<Status>(this.baseUrl+'/chagepassword',model);
    }

}
