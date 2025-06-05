import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SignalRService } from '../../services/signal-r.service';
import { RoomService } from '../../services/room.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragMove, DragDropModule } from '@angular/cdk/drag-drop';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-canva',
  imports: [CommonModule,
    FormsModule,
    DragDropModule],
  templateUrl: './canva.component.html',
  styleUrl: './canva.component.css'
})
export class CanvaComponent implements OnInit, OnDestroy{
  roomId: any = 0;
  userName: string = '';
  currentRoom: any = null;
  components: any[] = [];
  connectedUsers: string[] = [];
  roomUserId: any;
  
  // Tamaños de dispositivos
  deviceSizes = [
    { name: 'Mobile Small', width: 320, height: 568 },
    { name: 'Mobile Medium', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet', width: 768, height: 1024 }
  ];
  selectedDevice = this.deviceSizes[0];
  
  selectedComponentType: string = 'button';
  private subscriptions: Subscription[] = [];
  constructor(
    private signalService: SignalRService,
    private roomService: RoomService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    
    this.route.params.subscribe(params => {
        console.log(params);
        this.roomId = +params['roomId'];
    });
    
    this.route.queryParams.subscribe(async query => {
      this.roomUserId = +query['userId'];
      console.log(this.roomId);
      console.log(this.roomUserId);
  
      try {
        await this.signalService.startConnection();
        await this.signalService.joinRoom(this.roomId, this.roomUserId);

        // this.signalService.deviceSizeChanged$.subscribe(({ userName, name, width, height }) => {
        //   console.log(`${userName} cambió el dispositivo a ${name} (${width}x${height})`);

        //   const matchedDevice = this.deviceSizes.find(
        //     d => d.name === name && d.width === width && d.height === height
        //   );
        
        //   if (matchedDevice) {
        //     this.selectedDevice = matchedDevice;
        //   }
        // });

        console.log('Unido correctamente a la sala');
      } catch (error) {
        console.error('Error al unirse a la sala:', error);
      }
  
      this.setupSignalRListeners();
    });
  }
  
  getRoomUsers(roomId: string) {
    this.roomService.getRoomUsers(roomId).subscribe({
      next: (users: any[]) => {
        this.connectedUsers = users.map(user => user.userName);
        console.log('Usuarios conectados actualizados:', this.connectedUsers);
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });
  }

  async joinRoom(roomId: string) {
    if (!roomId) return;
    
    try {
      await this.signalService.joinRoom(roomId, this.userName);
      console.log('Unido a la sala:', roomId);
      this.getRoomUsers(roomId);
    } catch (err) {
      console.error('Error al unirse a la sala:', err);
    }
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

  addComponent() {
  
    const width = this.selectedComponentType === 'text' ? 100 : 100;
    const height = this.selectedComponentType === 'text' ? 30 : 50;
  
    const maxX = this.selectedDevice.width - width;
    const maxY = this.selectedDevice.height - height;
  
    const positionX = Math.floor(Math.random() * maxX);
    const positionY = Math.floor(Math.random() * maxY);

    const newComponent = {
      id: this.generateId(), // number
      type: this.selectedComponentType, // string
      positionX: positionX, // int
      positionY: positionY, // int
      width: this.selectedComponentType === 'text' ? null : 100, // int?
      height: this.selectedComponentType === 'text' ? null : 50, // int?
      color: this.getDefaultColor(this.selectedComponentType), // string?
      content: this.getDefaultContent(this.selectedComponentType), // string?
      roomId: Number(this.roomId)
    };
    
    // this.components.push(newComponent);
    console.log(this.roomId);
    console.log(newComponent);
    this.signalService.addComponent(+this.roomId, newComponent);
  }
  
  addLoginComponents() {
    const containerId = this.generateId();
  
    const containerComponent = {
      id: containerId,
      type: 'form-container',
      positionX: 40,
      positionY: 40,
      width: 300,
      height: 280,
      color: '#ffffff',
      content: '', 
      roomId: Number(this.roomId),
      tailwindClasses: 'bg-white shadow-lg rounded-xl p-6 flex flex-col gap-4'
    };
  
    const fields = [
      { type: 'text', content: 'Iniciar sesión', offsetY: 0, class: 'text-xl font-bold text-center' },
      { type: 'text', content: 'Correo electrónico', offsetY: 40, class: 'text-sm font-medium' },
      {
        type: 'input',
        content: 'correo@ejemplo.com',
        offsetY: 65,
        class: 'px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400'
      },
      { type: 'text', content: 'Contraseña', offsetY: 110, class: 'text-sm font-medium' },
      {
        type: 'input',
        content: '********',
        offsetY: 135,
        class: 'px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400'
      },
      {
        type: 'button',
        content: 'Ingresar',
        offsetY: 190,
        class: 'bg-blue-600 text-white rounded py-2 px-4 w-full text-center hover:bg-blue-700'
      }
    ];
  
    // this.components.push(containerComponent);

    this.signalService.addComponent(containerComponent.roomId, containerComponent);
  
    fields.forEach((field, i) => {
      const newComponent = {
        id: this.generateId(),
        type: field.type,
        positionX: containerComponent.positionX + 20,
        positionY: containerComponent.positionY + field.offsetY + 20,
        width: containerComponent.width - 40,
        height: field.type === 'text' ? null : 40,
        color: field.type === 'text' ? 'transparent' : this.getDefaultColor(field.type),
        content: field.content,
        roomId: Number(this.roomId),
        tailwindClasses: field.class || ''
      };
      // this.components.push(newComponent);

      this.signalService.addComponent(containerComponent.roomId, newComponent);
    });

    
  }


  addRegisterComponents() {
    const formComponents = [
      { type: 'text', content: 'Registro de Usuario', posY: 10 },
      { type: 'text', content: 'Nombre completo', posY: 50 },
      { type: 'input', content: 'Ingrese su nombre', posY: 80 },
      { type: 'text', content: 'Correo electrónico', posY: 130 },
      { type: 'input', content: 'Ingrese su correo', posY: 160 },
      { type: 'text', content: 'Contraseña', posY: 210 },
      { type: 'input', content: 'Cree una contraseña', posY: 240 },
      { type: 'button', content: 'Registrarse', posY: 300 }
    ];
  
    formComponents.forEach((comp, i) => {
      const newComponent = {
        id: this.generateId(),
        type: comp.type,
        positionX: 20,
        positionY: comp.posY,
        width: comp.type === 'text' ? null : 200,
        height: comp.type === 'text' ? null : 40,
        color: this.getDefaultColor(comp.type),
        content: comp.content,
        roomId: Number(this.roomId)
      };
      this.components.push(newComponent);
      this.signalService.addComponent(newComponent.roomId, newComponent);
    });
  }
  
  

  onDragEnd(component: any, event: any) {
    const pos = event.source.getFreeDragPosition();
    component.positionX = pos.x;
    component.positionY = pos.y;
    
    this.signalService.moveComponent(
      this.roomId, 
      component.id, 
      component.positionX, 
      component.positionY
    );
  }

  onDragMoved(event: CdkDragMove, component: any) {
    const pos = event.pointerPosition;
  
    const boundingRect = (event.source.element.nativeElement as HTMLElement).offsetParent?.getBoundingClientRect();
    const offsetX = boundingRect?.left ?? 0;
    const offsetY = boundingRect?.top ?? 0;
  
    const newX = pos.x - offsetX;
    const newY = pos.y - offsetY;
  
    component.positionX = newX;
    component.positionY = newY;
  
    this.signalService.moveComponent(
      this.roomId,
      component.id,
      component.positionX,
      component.positionY
    );
  }

  removeComponent(componentId: any) {
    // Eliminar localmente
    this.components = this.components.filter(c => c.id !== componentId);
    
    // Enviar al servidor
    this.signalService.removeComponent(this.roomId, componentId);
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

  onDeviceChange(device: any) {
    // Envía el cambio al backend
    this.signalService.changeDeviceSize(this.roomId, device);
  }
}
