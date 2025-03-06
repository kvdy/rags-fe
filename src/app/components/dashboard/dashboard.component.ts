import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

interface Directory {
  id: number;
  created: string;
  updated: string;
  name: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username: string;
  userInput = '';
  messages: { text: string, sender: string }[] = [];
  selectedDirectory = 'uploaded_docs';
  distinctDirectories: Directory[] = [];
  private queryUrl = 'http://127.0.0.1:8000/query/';
  private directoriesUrl = 'http://localhost:3000/directories';

  constructor(private http: HttpClient, private authService: AuthService) {
      this.username = this.authService.getUsername() || "";
  }

  ngOnInit(): void {
      this.fetchDirectories();
  }

  private getHeaders(): HttpHeaders {
      const authToken = localStorage.getItem('authToken') || '';
      return new HttpHeaders({
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
      });
  }

  fetchDirectories(): void {
      this.http.get<Directory[]>(this.directoriesUrl, { headers: this.getHeaders() })
          .subscribe(response => {
              this.distinctDirectories = response;
          }, error => {
              console.error("Error fetching directories:", error);
          });
  }

  sendMessage(): void {
      if (!this.userInput.trim()) return;
      
      this.messages.push({ text: this.userInput, sender: 'user' });
      const userQuery = this.userInput;
      this.userInput = '';
      
      const payload = { question: userQuery, directory: this.selectedDirectory };
      this.http.post<{ response: string }>(this.queryUrl, payload, { headers: this.getHeaders() })
          .subscribe(response => {
              this.messages.push({ text: response.response, sender: 'system' });
          }, error => {
              console.error("Error fetching response:", error);
          });
  }
}
