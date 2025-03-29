import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { v4 as uuidv4 } from 'uuid';

import { HeaderComponent } from '../shared/header/header.component';
import { QuestFormComponent } from '../quest-form/quest-form.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { MessageBoardComponent } from '../message-board/message-board.component';

import { AuthService } from '../../services/auth.service';
import { QuestService } from '../../services/quest.service';
import { TimeframeService } from '../../services/timeframe.service';

import { Quest } from '../../models/quest.model';
import { Preference } from '../../models/preference.model';
import { Timeframe } from '../../models/timeframe.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    ButtonModule,
    CardModule,
    TabViewModule,
    DialogModule,
    CalendarModule,
    TableModule,
    AvatarModule,
    TagModule,
    QuestFormComponent,
    CalendarComponent,
    MessageBoardComponent
  ]
})
export class DashboardComponent implements OnInit {
  activeQuests: Quest[] = [];
  completedQuests: Quest[] = [];
  userTimeframes: Timeframe[] = [];
  minDate: Date = new Date();
  
  // Dialog control variables
  showQuestDialog = false;
  showCalendarFormDialog = false;
  showPreferenceFormDialog = false;
  showQuestDetailsDialog = false;
  
  selectedQuest: Quest | null = null;
  
  constructor(
    private authService: AuthService,
    private questService: QuestService,
    private timeframeService: TimeframeService
  ) {}
  
  ngOnInit(): void {
    // Load quests
    this.questService.quests$.subscribe(quests => {
      const userQuests = this.questService.getUserQuests();
      this.activeQuests = userQuests.filter(q => q.status !== 'completed');
      this.completedQuests = userQuests.filter(q => q.status === 'completed');
    });
    
    // Load timeframes
    this.timeframeService.timeframes$.subscribe(timeframes => {
      this.userTimeframes = this.timeframeService.getUserTimeframes();
    });
  }
  
  showNewQuestDialog(): void {
    this.showQuestDialog = true;
  }
  
  showCalendarDialog(): void {
    this.showCalendarFormDialog = true;
  }
  
  showPreferenceDialog(quest: Quest): void {
    this.selectedQuest = quest;
    this.showPreferenceFormDialog = true;
  }
  
  openQuestDetails(quest: Quest): void {
    this.selectedQuest = quest;
    this.showQuestDetailsDialog = true;
  }
  
  showAddFriendDialog(): void {
    // To be implemented
  }
  
  isTimeOff(date: any): boolean {
    const dateToCheck = new Date(date.year, date.month, date.day);
    return this.userTimeframes.some(tf => {
      const startDate = new Date(tf.startDate);
      const endDate = new Date(tf.endDate);
      return dateToCheck >= startDate && dateToCheck <= endDate;
    });
  }
  
  onQuestSaved(quest: Quest): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    
    const newQuest: Quest = {
      ...quest,
      id: uuidv4(),
      createdBy: currentUser.id,
      createdAt: new Date(),
      members: [currentUser.id, ...quest.members],
      status: 'planning'
    };
    
    this.questService.createQuest(newQuest);
    this.showQuestDialog = false;
  }
  
  onTimeOffAdded(timeframe: Timeframe): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    
    const newTimeframe: Timeframe = {
      ...timeframe,
      id: uuidv4(),
      userId: currentUser.id
    };
    
    this.timeframeService.addTimeframe(newTimeframe);
    this.showCalendarFormDialog = false;
  }
  
  onPreferenceAdded(preference: Preference): void {
    if (!this.selectedQuest) return;
    
    this.questService.addPreference(this.selectedQuest.id, preference);
    this.showPreferenceFormDialog = false;
    
    // After all preferences are added, find optimal time and place
    this.questService.findOptimalTimeAndPlace(this.selectedQuest.id);
  }
  
  getCreatorName(userId: string): string {
    // In a real app, you would get the user's name from a user service
    // For now, just return the ID
    return userId;
  }
  
  getMemberName(userId: string): string {
    // In a real app, you would get the member's name from a user service
    // For now, just return the ID
    return userId;
  }
  
  getMemberInitials(userId: string): string {
    // In a real app, you would get the user's initials from a user service
    // For now, just return the first letter
    return userId.charAt(0).toUpperCase();
  }
  
  calculateDuration(timeframe: { startDate: Date, endDate: Date }): number {
    const start = new Date(timeframe.startDate);
    const end = new Date(timeframe.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  }
  
  getPreferencesArray(): Preference[] {
    if (!this.selectedQuest || !this.selectedQuest.preferences) {
      return [];
    }
    
    return Object.values(this.selectedQuest.preferences);
  }
}
