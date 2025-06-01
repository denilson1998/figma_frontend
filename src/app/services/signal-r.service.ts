import { Injectable } from '@angular/core';
import signalR, { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  
   private hubConnection!: signalR.HubConnection;
    public componentAdded$ = new Subject<any>();
    public componentMoved$ = new Subject<any>();
    public componentRemoved$ = new Subject<any>();
    public userJoined$ = new Subject<string>();
    public userLeft$ = new Subject<string>();

  constructor() { }

  public async startConnection(): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7243/canvasHub')
      .withAutomaticReconnect()
      .build();

    try {
      await this.hubConnection.start();
      console.log('SignalR Connection started');
      this.registerSignalEvents();
    } catch (err) {
      console.error('Error starting SignalR connection:', err);
    }
  }

  private registerSignalEvents(): void {
    this.hubConnection.on('ComponentAdded', (component) => this.componentAdded$.next(component));
    this.hubConnection.on('ComponentMoved', (componentId, x, y) => this.componentMoved$.next({ componentId, x, y }));
    this.hubConnection.on('ComponentRemoved', (componentId) => this.componentRemoved$.next(componentId));
    this.hubConnection.on('UserJoined', (userName) => this.userJoined$.next(userName));
    this.hubConnection.on('UserLeft', (userName) => this.userLeft$.next(userName));
  }

  public async joinRoom(roomId: string, userName: string): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }
    await this.hubConnection.invoke('JoinRoom', roomId, userName);
  }

  public async addComponent(roomId: string, component: any): Promise<void> {
    await this.hubConnection.invoke('AddComponent', roomId, component);
  }

  public async moveComponent(roomId: string, componentId: string, x: number, y: number): Promise<void> {
    await this.hubConnection.invoke('MoveComponent', roomId, componentId, x, y);
  }

  public async removeComponent(roomId: string, componentId: string): Promise<void> {
    await this.hubConnection.invoke('RemoveComponent', roomId, componentId);
  }
}
