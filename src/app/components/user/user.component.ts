import { Component, OnInit } from '@angular/core';
import { ProtectedService } from 'src/app/services/protected.service';

interface User {
  id: number;
  created: string;
  updated: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  isModalOpen = false;

  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'Viewer' // Default role
  };

  constructor(private protectedService: ProtectedService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.protectedService.getUserData().subscribe({
      next: (res) => {
        console.log("Raw API Response:", res);
        this.users = res.map((user: any) => ({
          ...user,
          role: this.getRole(user.grant)
        }));
        console.log("Processed Users Array:", this.users); // Check if this contains data
      },
      error: (err) => console.error("Error fetching user data:", err)
    });
  }
  
  getRole(grant: number): string {
    return grant === 0 ? "Administrator" : grant === 1 ? "Editor" : "Viewer";
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  addUser(): void {
    const newUserPayload = {
      name: this.newUser.name,
      email: this.newUser.email,
      password: this.newUser.password,
      grant: this.newUser.role === "Administrator" ? 0 : this.newUser.role === "Editor" ? 1 : 2
    };

    this.protectedService.addUser(newUserPayload).subscribe({
      next: () => {
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => console.error("Error adding user:", err)
    });
  }
}
