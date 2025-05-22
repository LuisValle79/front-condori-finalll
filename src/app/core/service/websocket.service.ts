import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { Product } from '../../shared/models/productModel';
import { environmentWebSocker } from '../../../environment/environment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: Client;
  private productSubject = new Subject<Product>();
  public productUpdates$ = this.productSubject.asObservable();

  constructor(private notificationService: NotificationService) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${environmentWebSocker.apiUrl}/ws`),
      reconnectDelay: 5000,
    });

    this.stompClient.onConnect = () => {
      this.stompClient.subscribe('/topic/products', (message: IMessage) => {
        const product: Product = JSON.parse(message.body);
        this.productSubject.next(product);
        
        // Mostrar notificación cuando se recibe un producto
        this.notificationService.showProductUpdate(product);
      });

      this.stompClient.subscribe ('/topic/products/activate', (message: IMessage) => {
        const product: Product = JSON.parse(message.body);
        this.productSubject.next(product);

        this.notificationService.showProductActivate(product)
      });
      console.log('[WebSocket] Conectado');
      this.notificationService.showSuccess('Conexión WebSocket establecida');
    };

    this.stompClient.onStompError = (frame) => {
      console.error('[WebSocket] STOMP error:', frame);
      this.notificationService.showError('Error en la conexión WebSocket');
    };
  }

  connect(): void {
    this.stompClient.activate();
  }

  disconnect(): void {
    this.stompClient.deactivate();
    this.notificationService.showInfo('Conexión WebSocket cerrada');
  }
}