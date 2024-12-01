export interface GitHubUser {
  login: string
  name: string | null
  bio: string | null
  avatar_url: string
  html_url: string
  twitter_username: string | null
  blog: string | null
  followers: number
  following: number
  public_repos: number
  created_at: string
}

export interface UserActivity {
  commits: number
  pullRequests: number
  issues: number
  comments: number
  repositories: number
  contributions: number
  timestamp: string
}

export interface DailyActivity {
  day: number // 0-6 (Sunday-Saturday)
  hour: number // 0-23
  intensity: number // 0-4 (level of activity)
}

export interface AnimalCharacteristic {
  animal: string
  percentage: number
  traits: string[]
  color: string
}

export interface UserProfile {
  user: GitHubUser
  activities: {
    daily: UserActivity
    weekly: UserActivity
    monthly: UserActivity
    yearly: UserActivity
  }
  animalProfile: AnimalCharacteristic[]
  activityHeatmap: DailyActivity[]
  followersHistory: TimelineData[]
  followingHistory: TimelineData[]
}

export interface TimelineData {
  date: string
  count: number
}

// Animal profile configuration
export interface AnimalProfile {
  name: string
  traits: string[]
  color: string
  conditions: {
    minCommits?: number
    maxCommits?: number
    minPRs?: number
    maxPRs?: number
    minIssues?: number
    maxIssues?: number
    activityPattern?: 'diurnal' | 'nocturnal' | 'crepuscular'
    consistency?: 'high' | 'medium' | 'low'
  }
}

/**
 * Represents a GitHub event from the API
 */
export interface GitHubEvent {
  id: string
  type: string | null
  actor: {
    id: number
    login: string
    display_login?: string
    gravatar_id: string | null
    url: string
    avatar_url: string
  }
  repo: {
    id: number
    name: string
    url: string
  }
  org?: {
    id: number
    login: string
    gravatar_id: string | null
    url: string
    avatar_url: string
  }
  payload: GitHubEventPayload
  public: boolean
  created_at: string | null
}

export interface GitHubEventPayload {
  action?: string
  ref?: string
  ref_type?: string
  size?: number
  commits?: Array<{
    sha: string
    message: string
    author: { name: string, email: string }
  }>
  pull_request?: {
    number: number
    state: string
    title: string
  }
  issue?: {
    number: number
    title: string
    state: string
  }
}

export interface GitHubError extends Error {
  status?: number
  response?: {
    status: number
    data: {
      message: string
      documentation_url?: string
    }
  }
}
