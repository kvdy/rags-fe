import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Status } from 'src/app/models/status';
import { AuthService } from 'src/app/services/auth.service';
import { SignupService } from 'src/app/services/signup.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  frm!:FormGroup;
  status!:Status;
  
    get f(){
    return this.frm.controls;  // needed for validation in html file 
  }



  constructor(private signupService:SignupService, private fb:FormBuilder,
    private authService:AuthService, private router:Router
    ) { }

   onPost(){
    this.status = {statusCode:0,message:"wait...."};

    this.signupService.login(this.frm.value).subscribe({
      next: (res)=>{
        // save username, accesstoken and refresh token into localStorage
        console.log(res);
        this.authService.addAccessToken(res.token);
        this.authService.addUsername(res.email);
        let role = res.grant === 0 ? "Administrator" : res.grant === 1 ? "Editor" : "Viewer";
        this.authService.addRole(role);
        this.status.statusCode=res.statusCode;
        this.status.message=res.message;
        this.router.navigate(['./dashboard']);

      },
      error: (err)=>{
        console.log(err);
        this.status.statusCode=0;
        this.status.message="some error on server side";
      }
    })
     
 
  }

  ngOnInit(): void {
    this.frm= this.fb.group({
      'username':['',Validators.required],
      'password':['',Validators.required]
    })
    if(this.authService.isLoggedIn()){
      this.router.navigate(['./dashboard']);
    }
  }

}
