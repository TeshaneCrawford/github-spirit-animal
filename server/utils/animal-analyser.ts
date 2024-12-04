import type { UserActivity, AnimalCharacteristic, AnimalProfile, DailyActivity } from '~~/types/github'

/**
 * Spirit Animals represent distinct work styles:
 * - Wolf: Night-active team collaborator
 * - Cat: Independent twilight worker
 * - Beaver: Consistent daytime builder
 * - Owl: Nocturnal code reviewer
 */
const ANIMAL_PROFILES: AnimalProfile[] = [
  {
    name: 'Wolf',
    traits: ['collaborative', 'night-focused', 'team-oriented'],
    color: '#4A4A4A',
    emoji: 'fluent-emoji:wolf',
    conditions: {
      minPRs: 5,
      activityPattern: 'nocturnal',
      consistency: 'high',
    },
  },
  {
    name: 'Cat',
    traits: ['independent', 'precise', 'selective'],
    color: '#FFA500',
    emoji: 'fluent-emoji:cat',
    conditions: {
      minIssues: 3,
      activityPattern: 'crepuscular',
      consistency: 'medium',
    },
  },
  {
    name: 'Beaver',
    traits: ['consistent', 'hardworking', 'structured'],
    color: '#8B4513',
    emoji: 'fluent-emoji:beaver',
    conditions: {
      minCommits: 10,
      activityPattern: 'diurnal',
      consistency: 'high',
    },
  },
  {
    name: 'Owl',
    traits: ['analytical', 'nocturnal', 'wise'],
    color: '#483D8B',
    emoji: 'fluent-emoji:owl',
    conditions: {
      minPRs: 2,
      activityPattern: 'nocturnal',
      consistency: 'medium',
    },
  },
]

/**
 * Maps activity timing to behavioral patterns
 * Diurnal (6-18h), Nocturnal (18-6h), or Mixed
 */
function determineActivityPattern(activityHeatmap: DailyActivity[]): 'diurnal' | 'nocturnal' | 'crepuscular' {
  if (!activityHeatmap || activityHeatmap.length === 0) {
    return 'diurnal' // default pattern if no data
  }

  const dayHours = activityHeatmap.filter(a => a.hour >= 6 && a.hour <= 18)
  const nightHours = activityHeatmap.filter(a => a.hour < 6 || a.hour > 18)

  const dayActivity = dayHours.reduce((sum, a) => sum + a.intensity, 0)
  const nightActivity = nightHours.reduce((sum, a) => sum + a.intensity, 0)

  if (dayActivity > nightActivity * 1.5) return 'diurnal'
  if (nightActivity > dayActivity * 1.5) return 'nocturnal'
  return 'crepuscular'
}

/**
 * Evaluates the consistency of user's contributions
 * - High: Exceeds daily average consistently
 * - Medium: Meets threshold but with some variation
 * - Low: Below threshold or irregular patterns
 */
function calculateConsistency(activity: UserActivity): 'high' | 'medium' | 'low' {
  if (!activity || !activity.commits) {
    return 'low' // default consistency if no activity
  }

  const dailyAverage = activity.commits / 7
  const threshold = dailyAverage * 0.5

  if (activity.commits >= dailyAverage * 7) return 'high'
  if (activity.commits >= threshold * 7) return 'medium'
  return 'low'
}

/**
 * Calculates how well a user's activity matches an animal profile
 * Scoring criteria (20 points each):
 * - Minimum commit threshold
 * - Pull request engagement
 * - Issue participation
 * - Activity timing pattern
 * - Contribution consistency
 */
function calculateAnimalMatch(profile: AnimalProfile, activity: UserActivity, pattern: string, consistency: 'high' | 'medium' | 'low'): number {
  if (!activity || !profile) {
    return 0 // no match if missing data
  }

  let score = 0
  const { conditions } = profile

  if (conditions.minCommits && activity.commits >= conditions.minCommits) score += 20
  if (conditions.minPRs && activity.pullRequests >= conditions.minPRs) score += 20
  if (conditions.minIssues && activity.issues >= conditions.minIssues) score += 20
  if (conditions.activityPattern === pattern) score += 20
  if (conditions.consistency === consistency) score += 20

  return Math.min(score, 100)
}

/**
 * Core spirit animal analysis function
 * Evaluates GitHub activity patterns and matches them to animal characteristics
 * Returns sorted array of matching animals with confidence percentages
 */
export function analyzeGitHubSpirit(
  activity: UserActivity,
  activityHeatmap: DailyActivity[],
): AnimalCharacteristic[] {
  if (!activity || !activityHeatmap) {
    return [] // return empty array if no data
  }

  const pattern = determineActivityPattern(activityHeatmap)
  const consistency = calculateConsistency(activity)

  const matches = ANIMAL_PROFILES.map(profile => ({
    animal: profile.name,
    percentage: calculateAnimalMatch(profile, activity, pattern, consistency),
    traits: profile.traits,
    color: profile.color,
    emoji: profile.emoji,
  }))

  // Sort by percentage descending and normalize to ensure total is 100%
  return matches
    .sort((a, b) => b.percentage - a.percentage)
    .map(match => ({
      ...match,
      percentage: Math.round(match.percentage * 100) / 100,
    }))
}

// Make these functions available for import
export { determineActivityPattern, calculateConsistency }
