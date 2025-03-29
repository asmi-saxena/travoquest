import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Timeframe } from '../models/timeframe.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TimeframeService {
  private timeframesSubject = new BehaviorSubject<Timeframe[]>([]);
  public timeframes$ = this.timeframesSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadTimeframes();
  }

  private loadTimeframes(): void {
    const storedTimeframes = localStorage.getItem('timeframes');
    const timeframes = storedTimeframes ? JSON.parse(storedTimeframes) : [];
    this.timeframesSubject.next(timeframes);
  }

  getTimeframes(): Timeframe[] {
    return this.timeframesSubject.value;
  }

  getUserTimeframes(): Timeframe[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    return this.timeframesSubject.value.filter(tf => 
      tf.userId === currentUser.id
    );
  }

  addTimeframe(timeframe: Timeframe): void {
    const timeframes = [...this.timeframesSubject.value, timeframe];
    localStorage.setItem('timeframes', JSON.stringify(timeframes));
    this.timeframesSubject.next(timeframes);
  }

  updateTimeframe(updatedTimeframe: Timeframe): void {
    const timeframes = this.timeframesSubject.value.map(tf => 
      tf.id === updatedTimeframe.id ? updatedTimeframe : tf
    );
    
    localStorage.setItem('timeframes', JSON.stringify(timeframes));
    this.timeframesSubject.next(timeframes);
  }

  deleteTimeframe(id: string): void {
    const timeframes = this.timeframesSubject.value.filter(tf => tf.id !== id);
    localStorage.setItem('timeframes', JSON.stringify(timeframes));
    this.timeframesSubject.next(timeframes);
  }
} 