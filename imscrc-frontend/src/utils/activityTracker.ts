interface Activity {
  id: number;
  activity: string;
  description: string;
  time: string;
  timestamp: number;
  status: string;
  icon: string;
  user: string;
}

export class ActivityTracker {
  private static instance: ActivityTracker;
  private activities: Activity[] = [];

  private constructor() {
    this.loadActivities();
  }

  public static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }

  private loadActivities(): void {
    try {
      const stored = localStorage.getItem('recentActivities');
      if (stored) {
        this.activities = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      this.activities = [];
    }
  }

  private saveActivities(): void {
    try {
      localStorage.setItem('recentActivities', JSON.stringify(this.activities));
    } catch (error) {
      console.error('Error saving activities:', error);
    }
  }

  public addActivity(activity: Omit<Activity, 'id' | 'timestamp'>): void {
    const newActivity: Activity = {
      ...activity,
      id: Date.now(),
      timestamp: Date.now()
    };

    // Add to beginning of array
    this.activities.unshift(newActivity);
    
    // Keep only last 50 activities
    this.activities = this.activities.slice(0, 50);
    
    // Save to localStorage
    this.saveActivities();

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('activitiesUpdated', {
      detail: { activities: this.activities }
    }));
  }

  public getActivities(): Activity[] {
    return this.activities;
  }

  public getRecentActivities(limit: number = 10): Activity[] {
    return this.activities.slice(0, limit);
  }

  // Helper methods for common activities
  public addVisitorCheckIn(visitorName: string, userName: string = 'Staff'): void {
    this.addActivity({
      activity: "Visitor Check-in",
      description: `${visitorName} checked in for a visit`,
      time: this.getRelativeTime(Date.now()),
      status: "active",
      icon: "bi-box-arrow-in-right",
      user: userName
    });
  }

  public addVisitorCheckOut(visitorName: string, userName: string = 'Staff'): void {
    this.addActivity({
      activity: "Visitor Check-out",
      description: `${visitorName} checked out after visit`,
      time: this.getRelativeTime(Date.now()),
      status: "completed",
      icon: "bi-box-arrow-right",
      user: userName
    });
  }

  public addPDLRegistration(pdlName: string, userName: string = 'Staff'): void {
    this.addActivity({
      activity: "PDL Registration",
      description: `${pdlName} registered as new PDL`,
      time: this.getRelativeTime(Date.now()),
      status: "completed",
      icon: "bi-person-plus",
      user: userName
    });
  }

  public addReportGeneration(reportType: string, userName: string = 'Staff'): void {
    this.addActivity({
      activity: "Report Generated",
      description: `${reportType} report created`,
      time: this.getRelativeTime(Date.now()),
      status: "completed",
      icon: "bi-file-text",
      user: userName
    });
  }

  private getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

// Export singleton instance
export const activityTracker = ActivityTracker.getInstance();
