export class MockDatabase {
  users: any[] = [];
  profiles: any[] = [];
  posts: any[] = [];
  reels: any[] = [];
  comments: any[] = [];
  likes: any[] = [];
  saves: any[] = [];
  follows: any[] = [];
  stories: any[] = [];
  storyViews: any[] = [];
  timeCapsules: any[] = [];
  wasteTimeLogs: any[] = [];
  streaks: any[] = [];
  conversations: any[] = [];
  participants: any[] = [];
  messages: any[] = [];
  messageReactions: any[] = [];
  notifications: any[] = [];

  reset() {
    this.users = [];
    this.profiles = [];
    this.posts = [];
    this.reels = [];
    this.comments = [];
    this.likes = [];
    this.saves = [];
    this.follows = [];
    this.stories = [];
    this.storyViews = [];
    this.timeCapsules = [];
    this.wasteTimeLogs = [];
    this.streaks = [];
    this.conversations = [];
    this.participants = [];
    this.messages = [];
    this.messageReactions = [];
    this.notifications = [];
  }
}

export const mockDb = new MockDatabase();

