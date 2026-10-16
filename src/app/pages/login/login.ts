import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest } from '../../core/services/auth.service';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  message = signal('');

  constructor(private router: Router, private authService: AuthService) {}

  login(): void {
    const data: LoginRequest = { email: this.email, password: this.password };
    this.authService.login(data).subscribe({
      next: () => this.router.navigate(['/home']),
      error: () => this.message.set('Correo o contraseña incorrectos'),
    });
  }
}