import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RoomService } from '../../services/room.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  newRoomName: string = '';
  rooms: any[] = [];
  asignedRooms: any[] = [];
  users: any[] = []; 
  selectedUsers: number[] = [];
  userId: any = "";
  showUserSelection: boolean = false;
  currentRoomId: string | null = null;
  selectedRoomId: number | null = null;
  
  constructor(private http: HttpClient, private userService: UserService, private roomService: RoomService, private router: Router) {
    this.userId = sessionStorage.getItem("userId");
  }

  ngOnInit() {
    
    this.loadUserRooms();
    this.loadAllUsers();
    this.loadAssignedUserRooms();
  }
  
  loadAllUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users: any) => this.users = users.filter((u: any) => u.UserId !== this.userId),
      error: (err: any) => console.error('Error loading users', err)
    });
  }

  loadUserRooms() {
    this.roomService.getUserRooms(this.userId).subscribe({
      next: (rooms: any) => this.rooms = rooms,
      error: (err: any) => console.error('Error loading rooms', err)
    });
  }

  loadAssignedUserRooms() {
    this.roomService.getAssignedUserRooms(this.userId).subscribe(
      {
        next: (resp: any) => {
          console.log(resp);
          this.asignedRooms = resp
        },
        error: (err: any) => console.error('Error loading rooms', err)
      }
    );
  }

  createRoom() {
    if (!this.newRoomName.trim()) return;

    const roomData = {
      name: this.newRoomName,
      creatorUserId: this.userId
    };

    this.roomService.createRoom(roomData).subscribe({
      next: (newRoom: any) => {
        this.rooms.push({
          id: newRoom.roomId,
          name: newRoom.name,
          createdAt: newRoom.createdAt,
          componentCount: 0,
          userCount: 1
        });
        this.currentRoomId = newRoom.roomId;
        this.newRoomName = '';
      },
      error: (err: any) => console.error('Error creating room', err)
    });
  }
  
  toggleUserSelection(userId: number) {
    const index = this.selectedUsers.indexOf(userId);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(userId);
    }
  }

  addUsersToRoom() {
    console.log(this.selectedRoomId);

    console.log(this.selectedUsers);
    
    if (!this.selectedRoomId || this.selectedUsers.length === 0) return;
  
    const requests = this.selectedUsers.map(userId => 
      this.roomService.addUserToRoom(this.selectedRoomId, userId)
    );
    
    console.log('Requests:', requests);
    forkJoin(requests).subscribe({
      next: () => {
        this.selectedUsers = [];
        this.showUserSelection = false;
        this.loadUserRooms();
      },
      error: (err: any) => console.error('Error adding users to room', err)
    });
  }

  getRoomUsers(roomId: string) {
    this.roomService.getRoomUsers(roomId).subscribe({
      next: (users: any) => {
        console.log('Usuarios en la sala:', users);
      },
      error: (err: any) => console.error('Error loading room users', err)
    });
  }

  async joinRoom(roomId: string) {
    try {
      this.getRoomUsers(roomId);
      console.log(this.userId);
      console.log(roomId);
      await this.router.navigate(['/canva', roomId], {
        queryParams: { userId: this.userId }
      });

    } catch (err) {
      console.error('Error al unirse a la sala:', err);
    }
  }

  openUserSelectionModal(roomId: number) {
    console.log(roomId);
    this.selectedRoomId = roomId;
    this.showUserSelection = true;
    
     this.userService.getAllUsers().subscribe({
        next: (resp) => {
          console.log(resp);
          this.users = resp.filter((c: any) => c.userId != this.userId);
          console.log(this.users);
        },
        error: (err) => {
          console.error('Error al obtener usuarios', err);
        }
      });

  }

  logout(){
    console.log("TEST");
    sessionStorage.clear();
    this.router.navigate(['/login']);
    console.log("TESTfinal");
  }
}
