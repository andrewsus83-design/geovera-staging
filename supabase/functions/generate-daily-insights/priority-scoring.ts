// Priority scoring system for task ranking

import { InsightTask, TaskPriority, TaskCategory } from './types.ts';

const CATEGORY_WEIGHTS: Record<TaskCategory, number> = {
  'crisis_response': 10,
  'competitor_intelligence': 8,
  'performance_decline': 8,
  'seo_alert': 7,
  'trend_opportunity': 6,
  'keyword_opportunity': 5,
  'content_optimization': 4,
  'partnership_opportunity': 4,
  'local_seo_alert': 7,
  'content_publishing': 3,
  'content_promotion': 2,
  'content_creation': 2,
  'ai_recommendation': 6,
  'market_opportunity': 6,
};

const BASE_PRIORITY_SCORES: Record<TaskPriority, number> = {
  'urgent': 90,
  'high': 70,
  'medium': 50,
  'low': 30,
};

export function calculatePriorityScore(task: InsightTask): number {
  // Base score from priority level
  const basePriority = BASE_PRIORITY_SCORES[task.priority];

  // Factor 1: Impact Score (0-100) - default to 50 if not specified
  const impactScore = 50;

  // Factor 2: Time Sensitivity (0-20)
  const timeSensitivity = calculateTimeSensitivity(task.deadline);

  // Factor 3: Data Confidence (0-10)
  const confidenceBonus = (task.sourceData.confidenceScore || 0.5) * 10;

  // Factor 4: Category Weight (0-10)
  const categoryWeight = CATEGORY_WEIGHTS[task.category] || 3;

  // Factor 5: Recency Bonus (0-5)
  const dataAge = task.sourceData.dataAge || 48;
  const recencyBonus = dataAge < 24 ? 5 : dataAge < 72 ? 3 : 0;

  // Calculate final score (0-100)
  const finalScore =
    basePriority * 0.4 +
    impactScore * 0.3 +
    timeSensitivity * 0.15 +
    confidenceBonus * 0.05 +
    categoryWeight * 0.05 +
    recencyBonus * 0.05;

  // Cap at 100
  return Math.min(finalScore, 100);
}

function calculateTimeSensitivity(deadline: Date): number {
  const now = new Date();
  const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDeadline < 24) {
    return 20; // Extremely urgent
  } else if (hoursUntilDeadline < 48) {
    return 15; // Very urgent
  } else if (hoursUntilDeadline < 72) {
    return 10; // Urgent
  } else if (hoursUntilDeadline < 168) {
    return 5; // Moderate (1 week)
  } else {
    return 0; // Low
  }
}

export function selectDiverseTasks(rankedTasks: InsightTask[], limit: number): InsightTask[] {
  const selected: InsightTask[] = [];
  const categoryCount: Record<string, number> = {};
  const sourceCount: Record<string, number> = {};

  // Priority 1: Always include crisis tasks (up to 3)
  const crisisTasks = rankedTasks.filter((t) => t.category === 'crisis_response');
  for (const crisis of crisisTasks.slice(0, 3)) {
    selected.push(crisis);
    categoryCount['crisis_response'] = (categoryCount['crisis_response'] || 0) + 1;
  }

  // Priority 2: Fill remaining slots with diversity
  for (const task of rankedTasks) {
    if (selected.length >= limit) {
      break;
    }

    // Skip if already selected
    if (selected.includes(task)) {
      continue;
    }

    // Diversity constraint: Max 4 tasks per category
    if ((categoryCount[task.category] || 0) >= 4) {
      continue;
    }

    // Diversity constraint: Max 5 tasks per source type
    if ((sourceCount[task.sourceType] || 0) >= 5) {
      continue;
    }

    // Add task
    selected.push(task);
    categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
    sourceCount[task.sourceType] = (sourceCount[task.sourceType] || 0) + 1;
  }

  return selected;
}

export function getTierLimit(tier: 'basic' | 'premium' | 'partner'): number {
  switch (tier) {
    case 'basic':
      return 8;
    case 'premium':
      return 10;
    case 'partner':
      return 12;
    default:
      return 8;
  }
}
