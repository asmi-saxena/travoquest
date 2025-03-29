import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Quest } from '../models/quest.model';
import { Preference } from '../models/preference.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class QuestService {
  private questsSubject = new BehaviorSubject<Quest[]>([]);
  public quests$ = this.questsSubject.asObservable();

  constructor(private authService: AuthService) {
    this.loadQuests();
  }

  private loadQuests(): void {
    const storedQuests = localStorage.getItem('quests');
    const quests = storedQuests ? JSON.parse(storedQuests) : [];
    this.questsSubject.next(quests);
  }

  getQuests(): Quest[] {
    return this.questsSubject.value;
  }

  getUserQuests(): Quest[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return [];
    
    return this.questsSubject.value.filter(quest => 
      quest.members.includes(currentUser.id)
    );
  }

  getQuest(id: string): Quest | undefined {
    return this.questsSubject.value.find(quest => quest.id === id);
  }

  createQuest(quest: Quest): void {
    const quests = [...this.questsSubject.value, quest];
    localStorage.setItem('quests', JSON.stringify(quests));
    this.questsSubject.next(quests);
  }

  updateQuest(updatedQuest: Quest): void {
    const quests = this.questsSubject.value.map(quest => 
      quest.id === updatedQuest.id ? updatedQuest : quest
    );
    
    localStorage.setItem('quests', JSON.stringify(quests));
    this.questsSubject.next(quests);
  }

  addPreference(questId: string, preference: Preference): void {
    const quests = this.questsSubject.value.map(quest => {
      if (quest.id === questId) {
        if (!quest.preferences) {
          quest.preferences = {};
        }
        quest.preferences[preference.userId] = preference;
      }
      return quest;
    });
    
    localStorage.setItem('quests', JSON.stringify(quests));
    this.questsSubject.next(quests);
  }

  findOptimalTimeAndPlace(questId: string): void {
    const quest = this.getQuest(questId);
    if (!quest || !quest.preferences) return;
    
    // This is a simplified implementation
    // In a real app, you'd have a more complex algorithm
    
    // Find common dates by overlapping timeframes
    const timeframes = Object.values(quest.preferences)
      .filter(p => p.preferredTimeframe)
      .map(p => p.preferredTimeframe!);
    
    if (timeframes.length > 0) {
      // Simple algorithm - use the earliest start and latest end dates
      // that satisfy the most preferences
      const startDates = timeframes.map(t => new Date(t.startDate));
      const endDates = timeframes.map(t => new Date(t.endDate));
      
      const latestStart = new Date(Math.max(...startDates.map(d => d.getTime())));
      const earliestEnd = new Date(Math.min(...endDates.map(d => d.getTime())));
      
      if (latestStart <= earliestEnd) {
        quest.selectedTimeframe = {
          startDate: latestStart,
          endDate: earliestEnd
        };
      }
    }
    
    // Find most common place preference
    const placeCounts = new Map<string, number>();
    
    Object.values(quest.preferences)
      .filter(p => p.preferredPlace)
      .forEach(p => {
        const place = p.preferredPlace!;
        placeCounts.set(place, (placeCounts.get(place) || 0) + 1);
      });
    
    let bestPlace = '';
    let maxCount = 0;
    
    placeCounts.forEach((count, place) => {
      if (count > maxCount) {
        maxCount = count;
        bestPlace = place;
      }
    });
    
    if (bestPlace) {
      quest.selectedPlace = bestPlace;
    }
    
    // Find most common theme
    const themeCounts = new Map<string, number>();
    
    Object.values(quest.preferences)
      .filter(p => p.preferredTheme)
      .forEach(p => {
        const theme = p.preferredTheme!;
        themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
      });
    
    let bestTheme = '';
    maxCount = 0;
    
    themeCounts.forEach((count, theme) => {
      if (count > maxCount) {
        maxCount = count;
        bestTheme = theme;
      }
    });
    
    if (bestTheme) {
      quest.selectedTheme = bestTheme;
    }
    
    this.updateQuest(quest);
  }
} 