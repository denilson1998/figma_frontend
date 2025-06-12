import { CommonModule } from '@angular/common';
import { Component, ViewChild, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email = '';
  password = '';

  showRegisterModal = false;
  registerData = {
    name: '',
    email: '',
    password: ''
  };
  
  constructor(private userService: UserService, private router: Router)
  {

  }

  login() {
    console.log('Login enviado', this.email, this.password);
    this.userService.login({ Email: this.email, Password: this.password })
      .subscribe({
        next: (res) => {
          console.log('Login exitoso', res);
          sessionStorage.setItem("userId", res.data);
          alert("Login exitoso");
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error al iniciar sesión', err);
        }
      });
  }

  openRegisterModal() {
    this.showRegisterModal = true;
  }

  closeRegisterModal() {
    this.showRegisterModal = false;
  }

  registerUser() {
    console.log('Usuario registrado', this.registerData);

    this.userService.register({
      Email: this.registerData.email,
      Password: this.registerData.password,
      Username: this.registerData.name
    }).subscribe({
      next: (res) => {
        console.log(res);
        console.log('Usuario registrado correctamente', res);
        this.closeRegisterModal();
      },
      error: (err) => {
        console.error('Error al registrar usuario', err);
      }
    });
  }

}
