import type { CodeQualityMetrics, EngagementMetrics, GitHubEvent } from '~~/types/github'

export const calculateCodeQuality = defineCachedFunction(
  async (events: GitHubEvent[]): Promise<CodeQualityMetrics> => {
    const commits = events.filter(e => e.type === 'PushEvent')
    const prs = events.filter(e => e.type === 'PullRequestEvent')

    return {
      averageCommitSize: calculateAverageCommitSize(commits),
      prReviewParticipation: calculatePRParticipation(prs),
      issueResolutionRate: calculateResolutionRate(events),
      codeReviewThoroughness: calculateReviewThoroughness(prs),
    }
  },
  {
    maxAge: 60 * 30, // 30 minutes
    name: 'code-quality-metrics',
    getKey: events => `code-quality-${events[0]?.id || 'empty'}`,
  },
)

export const calculateEngagement = defineCachedFunction(
  async (events: GitHubEvent[]): Promise<EngagementMetrics> => {
    return {
      issueDiscussionCount: countIssueDiscussions(events),
      prReviewCount: countPRReviews(events),
      averageCommentsPerIssue: calculateAverageComments(events, 'issue'),
      averageCommentsPerPR: calculateAverageComments(events, 'pr'),
    }
  },
  {
    maxAge: 60 * 30, // 30 minutes
    name: 'engagement-metrics',
    getKey: events => `engagement-${events[0]?.id || 'empty'}`,
  },
)

/**
 * Calculates the average size of commits based on commit message length
 * Higher values indicate more detailed commit messages
 */
function calculateAverageCommitSize(commits: GitHubEvent[]): number {
  const sizes = commits
    .filter(c => c.payload.commits?.length)
    .map(c => c.payload.commits?.reduce((sum, commit) => sum + (commit.message.length || 0), 0) || 0)
  return sizes.length ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0
}

/**
 * Measures user's involvement in pull requests
 * Includes both opened PRs and review activities
 */
function calculatePRParticipation(prs: GitHubEvent[]): number {
  return prs.filter(pr => pr.payload.action === 'opened' || pr.payload.action === 'reviewed').length
}

/**
 * Calculates the percentage of issues that have been closed
 * Higher values indicate better issue resolution
 */
function calculateResolutionRate(events: GitHubEvent[]): number {
  const issues = events.filter(e => e.type === 'IssuesEvent')
  const closed = issues.filter(i => i.payload.action === 'closed').length
  return issues.length ? (closed / issues.length) * 100 : 0
}

/**
 * Measures how actively the user participates in code reviews
 * Returns percentage of PRs that received reviews
 */
function calculateReviewThoroughness(prs: GitHubEvent[]): number {
  const reviews = prs.filter(pr => pr.payload.action === 'reviewed').length
  return prs.length ? (reviews / prs.length) * 100 : 0
}

function countIssueDiscussions(events: GitHubEvent[]): number {
  return events.filter(e => e.type === 'IssueCommentEvent').length
}

function countPRReviews(events: GitHubEvent[]): number {
  return events.filter(e => e.type === 'PullRequestReviewEvent').length
}

function calculateAverageComments(events: GitHubEvent[], type: 'issue' | 'pr'): number {
  const comments = events.filter(e => e.type === `${type === 'pr' ? 'PullRequest' : 'Issue'}CommentEvent`).length
  const items = events.filter(e => e.type === `${type === 'pr' ? 'PullRequest' : 'Issues'}Event`).length
  return items ? comments / items : 0
}
