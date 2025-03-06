import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'AngularAuthentication';
  role="";
  isLoggedIn!:boolean;

  checkLoggedInUser(){
    this.isLoggedIn= this.authService.isLoggedIn();
    this.role=this.authService.getUserRole() ?? '';
  }
  logout(){
    this.authService.logout();
  }
  constructor(private authService:AuthService){
  }
}
