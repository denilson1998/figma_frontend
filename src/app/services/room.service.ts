import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private baseUrl = 'https://localhost:7243/api/Rooms';
  
  constructor(private http: HttpClient) 
  { 

  }

  createRoom(roomData: { name: string, creatorUserId: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}`, roomData);
  }

  getUserRooms(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}?userId=${userId}`);
  }

  getAssignedUserRooms(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/GetAssignedUserRooms/${userId}`);
  }

  getRoomUsers(roomId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${roomId}/users`);
  }

  addUserToRoom(roomId: any, userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${roomId}/users`, { userId });
  }
}
