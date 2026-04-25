import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  isRegisterMode = false;
  isLoading = false;

  username = '';
  email = '';
  password = '';
  identifier = '';

  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  switchToLogin() {
    if (this.isLoading) return;
    this.isRegisterMode = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.password = '';
  }

  switchToRegister() {
    if (this.isLoading) return;
    this.isRegisterMode = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.password = '';
  }

  register() {
    if (this.isLoading) return;

    if (!this.username.trim()) {
      this.errorMessage = 'Username is required';
      return;
    }
    if (this.username.trim().length < 3) {
      this.errorMessage = 'Username must be at least 3 characters';
      return;
    }
    if (!this.email.trim()) {
      this.errorMessage = 'Email is required';
      return;
    }
    if (!this.email.includes('@') || !this.email.includes('.')) {
      this.errorMessage = 'Enter a valid email address';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'Password is required';
      return;
    }
    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.authService.register(this.username.trim(), this.email.trim(), this.password).subscribe({
      next: () => {
        this.successMessage = 'Account created! Now log in.';
        this.username = '';
        this.email = '';
        this.password = '';
        this.identifier = '';
        this.isLoading = false;
        setTimeout(() => {
          this.isRegisterMode = false;
          this.successMessage = '';
        }, 2000);
      },
      error: (err) => {
        if (err.error?.username) {
          this.errorMessage = 'Username already taken';
        } else if (err.error?.email) {
          this.errorMessage = 'Email already registered';
        } else {
          this.errorMessage = 'Registration failed. Try again.';
        }
        this.isLoading = false;
      }
    });
  }

  login() {
    if (this.isLoading) return;

    if (!this.identifier.trim()) {
      this.errorMessage = 'Username or email is required';
      return;
    }
    if (!this.password) {
      this.errorMessage = 'Password is required';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.authService.login(this.identifier.trim(), this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage = 'Invalid username/email or password';
        this.isLoading = false;
      }
    });
  }
}