/** Represents a GitHub user's basic profile information */
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

/** Tracks user activity metrics aggregated over a specific time period */
export interface UserActivity {
  commits: number
  pullRequests: number
  issues: number
  comments: number
  repositories: number
  contributions: number
  timestamp: string
}

/**
 * Maps user activity to specific time slots in a week
 * day: 0 (Sunday) through 6 (Saturday)
 * hour: 0-23 representing hour of day
 * intensity: Activity level from 0 (none) to 4 (very high)
 */
export interface DailyActivity {
  day: number // 0-6 (Sunday-Saturday)
  hour: number // 0-23
  intensity: number // 0-4 (level of activity)
}

/** Defines the spirit animal match and associated characteristics */
export interface AnimalCharacteristic {
  animal: string
  percentage: number
  traits: string[]
  color: string
  emoji: string
}

/** Central user profile containing all analyzed data and metrics */
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
  metrics: SpiritAnimalMetrics
  activityTrends: ActivityTrends
}

/** Historical data point with date and count */
export interface TimelineData {
  date: string
  count: number
}

/**
 * Defines criteria and characteristics for matching users to spirit animals
 * Includes activity thresholds and behavioral patterns
 */
export interface AnimalProfile {
  name: string
  traits: string[]
  color: string
  emoji: string
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
 * Raw GitHub event data from the API
 * Used to analyze user behavior and calculate metrics
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

/** Payload data structure for different types of GitHub events */
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

/** Extended error type for GitHub API specific errors */
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

/** Simplified user profile data used for the main API endpoint */
export interface UserProfileData {
  avatar_url: string
  name: string | null
  login: string
  bio: string | null
  blog: string | null
  twitter_username: string | null
  followers: number
  following: number
  created_at: string
}

/** Collection of current activity statistics and metrics */
export interface ActivityStats {
  current: {
    daily: UserActivity
    weekly: UserActivity
    monthly: UserActivity
  }
  heatmap: DailyActivity[]
  codeQuality: CodeQualityMetrics
  engagement: EngagementMetrics
}

/** Results of spirit animal analysis including behavioral patterns */
export interface SpiritAnimalProfile {
  animals: AnimalCharacteristic[]
  dominantTraits: string[]
  activityPattern: 'diurnal' | 'nocturnal' | 'crepuscular'
  consistency: 'high' | 'medium' | 'low'
}

// Social stats types
export interface SocialStats {
  trends: {
    followers: TimelineData[]
    following: TimelineData[]
  }
}

export interface ActivityTrends {
  dailyAverage: number
  weeklyGrowth: number
  mostActiveDay: string
  mostActiveTime: string
}

export interface SpiritAnimalMetrics {
  activityLevel: number
  consistency: number
  collaboration: number
  codeQuality: number
  communityEngagement: number
}

export interface CodeQualityMetrics {
  averageCommitSize: number
  prReviewParticipation: number
  issueResolutionRate: number
  codeReviewThoroughness: number
}

export interface EngagementMetrics {
  issueDiscussionCount: number
  prReviewCount: number
  averageCommentsPerIssue: number
  averageCommentsPerPR: number
}
