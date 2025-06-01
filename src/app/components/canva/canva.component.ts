import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SignalRService } from '../../services/signal-r.service';
import { RoomService } from '../../services/room.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-canva',
  imports: [CommonModule,
    FormsModule,
    DragDropModule],
  templateUrl: './canva.component.html',
  styleUrl: './canva.component.css'
})
export class CanvaComponent implements OnInit, OnDestroy{
  roomId: string = '';
  userName: string = '';
  currentRoom: any = null;
  components: any[] = [];
  connectedUsers: string[] = [];
  
  // Tamaños de dispositivos
  deviceSizes = [
    { name: 'Mobile Small', width: 320, height: 568 },
    { name: 'Mobile Medium', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet', width: 768, height: 1024 }
  ];
  
  selectedComponentType: string = 'button';
  private subscriptions: Subscription[] = [];
  constructor(
    private signalService: SignalRService,
    private roomService: RoomService
  ) {}

  async ngOnInit() {
    this.signalService.startConnection();
    // this.setupSignalRListeners();
    
    // Obtener roomId y userName de la ruta o servicio
    try {
      await this.signalService.joinRoom(this.currentRoom.id, 'MiUsuario');
      console.log('Joined room:', this.currentRoom.name);
    } catch (err) {
      console.error('Error joining room:', err);
    }

    // this.setupSignalRListeners();
  }
  

   setupSignalRListeners() {
    this.subscriptions.push(
      this.signalService.componentAdded$.subscribe((component: any) => {
        this.components.push(component);
      }),
      this.signalService.componentMoved$.subscribe(({ componentId, x, y }) => {
        const comp = this.components.find(c => c.id === componentId);
        if (comp) {
          comp.positionX = x;
          comp.positionY = y;
        }
      }),
      this.signalService.componentRemoved$.subscribe(componentId => {
        this.components = this.components.filter(c => c.id !== componentId);
      }),
      this.signalService.userJoined$.subscribe(userName => {
        this.connectedUsers.push(userName);
      }),
      this.signalService.userLeft$.subscribe(userName => {
        this.connectedUsers = this.connectedUsers.filter(u => u !== userName);
      })
    );
  }

  addComponent(event: MouseEvent, deviceIndex: number) {
    const newComponent = {
      id: this.generateId(),
      type: this.selectedComponentType,
      positionX: event.offsetX,
      positionY: event.offsetY,
      width: 100,
      height: 50,
      color: '#007bff',
      content: this.selectedComponentType === 'text' ? 'Texto' : '',
    };

    this.signalService.addComponent(this.currentRoom.id, newComponent);
  }

  onDragEnd(component: any, event: any) {
    this.signalService.moveComponent(this.currentRoom.id, component.id, component.positionX, component.positionY);
  }

  removeComponent(componentId: string) {
    this.signalService.removeComponent(this.currentRoom.id, componentId);
  }


  

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private getDefaultColor(type: string): string {
    const colors: {[key: string]: string} = {
      button: '#3f51b5',
      text: '#000000',
      image: 'transparent',
      input: '#ffffff'
    };
    return colors[type] || '#cccccc';
  }

  private getDefaultContent(type: string): string {
    const contents: {[key: string]: string} = {
      button: 'Button',
      text: 'Sample Text',
      input: 'Placeholder...'
    };
    return contents[type] || '';
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
