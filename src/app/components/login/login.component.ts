import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isRegisterMode = false;
  loading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    if (this.isRegisterMode) {
      this.loginForm.addControl('name', this.formBuilder.control('', Validators.required));
      this.loginForm.addControl('email', this.formBuilder.control('', [Validators.required, Validators.email]));
      this.loginForm.addControl('confirmPassword', this.formBuilder.control('', Validators.required));
    }
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
    this.submitted = false;
    this.initForm();
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    if (this.isRegisterMode) {
      // Validate password match
      if (this.f['password'].value !== this.f['confirmPassword'].value) {
        this.f['confirmPassword'].setErrors({ matching: true });
        this.loading = false;
        return;
      }

      const newUser = {
        id: uuidv4(),
        username: this.f['username'].value,
        email: this.f['email'].value,
        name: this.f['name'].value
      };

      const success = this.authService.register(newUser);
      
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Username already exists';
      }
    } else {
      const success = this.authService.login(
        this.f['username'].value,
        this.f['password'].value
      );
      
      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Invalid username or password';
      }
    }

    this.loading = false;
  }
}
