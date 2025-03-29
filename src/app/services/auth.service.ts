import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(username: string, password: string): boolean {
    // In a real app, this would make an API call
    // For now, we're simulating with localStorage
    const users = this.getUsers();
    
    const user = users.find(u => u.username === username);
    
    // For demo purposes, any password works
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return true;
    }
    
    return false;
  }

  register(user: User): boolean {
    const users = this.getUsers();
    
    // Check if username already exists
    if (users.some(u => u.username === user.username)) {
      return false;
    }
    
    // Add new user
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    
    return true;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getUsers(): User[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [{
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    }, {
      username: 'john',
      email: 'john@example.com', 
      firstName: 'John',
      lastName: 'Smith',
      role: 'user'
    }, {
      username: 'jane',
      email: 'jane@example.com',
      firstName: 'Jane',
      lastName: 'Doe', 
      role: 'user'
    }];
  }
} 