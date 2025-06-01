import { CommonModule } from '@angular/common';
import { Component, ViewChild, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  //nueva logica para el modal de registro
  showRegisterModal = false;
  registerData = {
    name: '',
    email: '',
    password: ''
  };

  login() {
    // Implement login logic here
    console.log('Login enviado', this.email, this.password);
  }

  openRegisterModal() {
    console.log('====================================');
    console.log(this.showRegisterModal);
    console.log('====================================');
    this.showRegisterModal = true;
    console.log(this.showRegisterModal);
  }

  closeRegisterModal() {
    this.showRegisterModal = false;
  }

  registerUser() {
    // Handle modal close event if needed
    console.log('Usuario registrado', this.registerData);
    this.closeRegisterModal();
  }

}
