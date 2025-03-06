import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from "@auth0/angular-jwt";
import { RefreshTokenRequest } from '../models/refresh-token-reqest';
import { TokenService } from './token.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router:Router,private tokenService:TokenService) { }

  isLoggedIn(){
    return !!this.getAccessToken() && !this.isTokenExpired()
  }

  addUsername(username:string){
    localStorage.setItem('username',username);
  }

  addRole(role:string){
    localStorage.setItem('role',role);
  }

  addAccessToken(accessToken:string){
    localStorage.setItem('accessToken',accessToken);
  }


  addRefreshToken(refToken:string){
    localStorage.setItem('refreshToken',refToken);
  }

  getRole(){
    return localStorage.getItem('role');
  }

  getAccessToken(){
    return localStorage.getItem('accessToken');
  }

  getUsername(){
    return localStorage.getItem('username');
  }

  getRefreshToken(){
    return localStorage.getItem('refreshToken');
  }

  // check expiration of our token
  isTokenExpired(){
    const token: string=this.getAccessToken()??"";
        if(!token)
          return false;
        const tokenSplit:string=token.split('.')[1];
        const decodedString:string=atob(tokenSplit);
        const jsonString=JSON.parse(decodedString);
        const expiry = (jsonString).exp;
        return (Math.floor((new Date).getTime() / 1000)) >= expiry;

  }
  
  logout(){
     localStorage.removeItem("username");
     localStorage.removeItem("accessToken");
     localStorage.removeItem("refreshToken");
     this.router.navigate(['/login']);
  }

  getUserRole(){
    const helper = new JwtHelperService();
    const decodedToken = helper.decodeToken(this.getAccessToken()??"");
    if(decodedToken){
      console.log(decodedToken);
      const role = localStorage.getItem('role');
      return role; 
    }
    return "";
  }

  // refreshing the access token
  async refreshingToken():Promise<boolean>{
    const token = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    if(!token || !refreshToken){
       return false;
    }
    let success!:boolean;
    const data:RefreshTokenRequest={accessToken:token,refreshToken:refreshToken};

    this.tokenService.generateRefreshToken(data).subscribe({
       next: (response)=>{
          this.addAccessToken(response.accessToken);
          this.addRefreshToken(response.refreshToken);
       },
       error: (error)=>{
        console.log(error);
        success=false;
       }
    });
    return success;
  }

}
