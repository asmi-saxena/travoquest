import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.loadMessages();
  }

  private loadMessages(): void {
    const storedMessages = localStorage.getItem('messages');
    const messages = storedMessages ? JSON.parse(storedMessages) : [];
    this.messagesSubject.next(messages);
  }

  getMessages(): Message[] {
    return this.messagesSubject.value;
  }

  getQuestMessages(questId: string): Message[] {
    return this.messagesSubject.value
      .filter(msg => msg.questId === questId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  addMessage(message: Message): void {
    const messages = [...this.messagesSubject.value, message];
    localStorage.setItem('messages', JSON.stringify(messages));
    this.messagesSubject.next(messages);
  }
} 