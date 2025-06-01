import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'https://localhost:7243/api/User';
  constructor(private http: HttpClient) 
  { 

  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  getAllUsers(): Observable<any> {
    return this.http.get<{ data: any[] }>(`${this.baseUrl}/GetAllUsers`)
    .pipe(map(res => res.data));
  }
}
