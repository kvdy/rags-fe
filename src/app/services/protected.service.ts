// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { environment } from 'src/environments/environment';
// import { Status } from '../models/status';
// import { Observable } from 'rxjs';
// import { User } from '../models/user';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProtectedService {
//   private baseUrl=environment.baseUrl;
//   constructor(private http:HttpClient) { }
  
//   // getUserData(){
//   //   return this.http.get<Status>(this.baseUrl+'/users');
//   // }

//   getUserData(): Observable<User[]> {
//     return this.http.get<User[]>('http://localhost:3000/users');
//   }
  
//   getAdminData(){
//     return this.http.get<Status>(this.baseUrl+'/admin/getdata');
//   }

// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { Status } from '../models/status';

interface UserPayload {
  name: string;
  email: string;
  grant: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProtectedService {
  private baseUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getUserData(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`);
  }

  addUser(user: UserPayload): Observable<any> {
    return this.http.post<any>(this.baseUrl, user);
  }

  
  getAdminData(){
    return this.http.get<Status>(this.baseUrl);
  }

}
