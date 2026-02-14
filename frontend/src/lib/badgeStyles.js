export const difficultyBadgeClassName = {
  EASY: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  MEDIUM: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  HARD: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
};

export const designStatusBadgeClassName = {
  DRAFT: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  SUBMITTED: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  GRADED: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
};

export const getDifficultyBadgeClassName = (difficulty) =>
  difficultyBadgeClassName[difficulty] || '';

export const getDesignStatusBadgeClassName = (status) =>
  designStatusBadgeClassName[status] || '';
