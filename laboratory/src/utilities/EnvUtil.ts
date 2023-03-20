export function getProjectId() {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not defined')
  }

  return projectId
}

type Theme = 'dark' | 'light'
export function getTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return (localStorage.getItem('THEME') as Theme) ?? 'dark'
}
