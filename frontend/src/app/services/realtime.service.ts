import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private socket?: WebSocketSubject<any>;
  private incoming$ = new Subject<any>();
  private statusSubject = new Subject<'connecting' | 'connected' | 'closed' | 'error'>();
  private url?: string;
  private reconnectAttempts = 0;
  private reconnectTimer?: any;

  get messages$(): Observable<any> {
    return this.incoming$.asObservable();
  }

  get status$(): Observable<'connecting' | 'connected' | 'closed' | 'error'> {
    return this.statusSubject.asObservable();
  }

  connect(url: string): void {
    if (this.socket && !this.socket.closed) return;
    this.url = url;
    this.clearReconnect();
    this.statusSubject.next('connecting');

    this.socket = webSocket({
      url,
      deserializer: (e) => JSON.parse(e.data),
      openObserver: {
        next: () => {
          this.reconnectAttempts = 0;
          this.statusSubject.next('connected');
        },
      },
      closeObserver: {
        next: () => {
          this.statusSubject.next('closed');
          this.scheduleReconnect();
        },
      },
    });

    this.socket.subscribe({
      next: (msg) => this.incoming$.next(msg),
      error: () => {
        this.statusSubject.next('error');
        this.cleanup();
        this.scheduleReconnect();
      },
      complete: () => {
        this.cleanup();
        this.scheduleReconnect();
      },
    });
  }

  send(message: any): void {
    if (!this.socket || this.socket.closed) return;
    this.socket.next(message);
  }

  close(): void {
    if (!this.socket || this.socket.closed) return;
    this.socket.complete();
    this.cleanup();
  }

  private cleanup(): void {
    this.socket = undefined;
    this.statusSubject.next('closed');
  }

  private scheduleReconnect(): void {
    if (!this.url) return;
    if (this.socket && !this.socket.closed) return;
    const delay = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts++));
    this.clearReconnect();
    this.reconnectTimer = setTimeout(() => {
      if (this.url) this.connect(this.url);
    }, delay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }
}
