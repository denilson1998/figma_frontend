import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Subject, throttleTime } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  
  private hubConnection!: HubConnection;
  public componentAdded$ = new Subject<any>();
  public componentMoved$ = new Subject<any>();
  public componentRemoved$ = new Subject<any>();
  public userJoined$ = new Subject<string>();
  public userLeft$ = new Subject<string>();
  public deviceSizeChanged$ = new Subject<any>();

  private moveComponentSubject = new Subject<{ roomId: string, componentId: string, x: number, y: number }>();


  constructor() { 
    // this.moveComponentSubject
    // .pipe(throttleTime(50)) // 20 FPS aprox
    // .subscribe(({ roomId, componentId, x, y }) => {
    //   if (this.hubConnection && this.hubConnection.state === HubConnectionState.Connected) {
    //     this.hubConnection.invoke('MoveComponent', roomId, componentId, x, y);
    //   }
    // });
  }

  public async startConnection(): Promise<void> {
    this.hubConnection = new HubConnectionBuilder()
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
    this.hubConnection.on('DeviceSizeChanged', (userName: string, name: string, width: number, height: number) => {
      this.deviceSizeChanged$.next({ userName, name, width, height });
    });
  }

  public async joinRoom(roomId: string, userName: string): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
      throw new Error('SignalR connection is not established');
    }
    await this.hubConnection.invoke('JoinRoom', roomId, userName);
  }

  public async addComponent(roomId: any, component: any): Promise<void> {
    await this.hubConnection.invoke('AddComponent', roomId, component);
  }

  public async moveComponent(roomId: string, componentId: string, x: number, y: number): Promise<void> {
    // await this.hubConnection.invoke('MoveComponent', roomId, componentId, x, y);
    try {
      if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
        throw new Error('SignalR connection is not established');
      }
  
      // Validación básica en el cliente antes de enviar
      if (x < 0 || y < 0 || x > 5000 || y > 5000) {
        console.warn(`Coordenadas inválidas: (${x}, ${y})`);
        return;
      }
  
      await this.hubConnection.invoke('MoveComponent', Number(roomId), componentId, Math.round(x), Math.round(y));
    } catch (err) {
      console.error('Error en moveComponent:', err);
      // Opcional: Notificar al componente para mostrar error al usuario
      throw err; // Propaga el error para que el componente lo maneje
    }
  }
  // public async moveComponent(roomId: string, componentId: string, x: number, y: number): Promise<void> {
  //   this.moveComponentSubject.next({ roomId, componentId, x, y });
  // }

  public async removeComponent(roomId: string, componentId: string): Promise<void> {
    await this.hubConnection.invoke('RemoveComponent', roomId, componentId);
  }

  public async changeDeviceSize(roomId: number, device: { name: string; width: number; height: number }) {
    this.hubConnection.invoke('ChangeDeviceSize', roomId, device.name, device.width, device.height);
  }
}
