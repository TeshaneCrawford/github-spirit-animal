import type { UserActivity, AnimalCharacteristic, AnimalProfile, DailyActivity } from '~~/types/github'

/**
 * Predefined spirit animal profiles with their characteristics and matching conditions.
 * Each animal represents different GitHub activity patterns and work styles:
 * - Wolf: Team player, predominantly active at night
 * - Cat: Independent contributor, active during twilight hours
 * - Beaver: Consistent builder, active during daytime
 * - Owl: Code reviewer, active during night hours
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
 * Analyzes user's activity pattern based on their commit timing
 * - Diurnal: Predominantly active during daylight (6:00-18:00)
 * - Nocturnal: Predominantly active during night (18:00-6:00)
 * - Crepuscular: Active during twilight hours or mixed patterns
 */
function determineActivityPattern(activityHeatmap: DailyActivity[]): 'diurnal' | 'nocturnal' | 'crepuscular' {
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
 * Main analysis function that determines a user's GitHub spirit animals
 * Process:
 * 1. Analyzes activity patterns (time of day preferences)
 * 2. Evaluates contribution consistency
 * 3. Matches behavior against animal profiles
 * 4. Returns sorted array of matching animals with percentages
 *
 * @param activity - User's activity metrics (commits, PRs, etc.)
 * @param activityHeatmap - Temporal distribution of user's activity
 * @returns Array of matching animal characteristics, sorted by match percentage
 */
export function analyzeGitHubSpirit(
  activity: UserActivity,
  activityHeatmap: DailyActivity[],
): AnimalCharacteristic[] {
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
