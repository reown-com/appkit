export function getProjectId() {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID
  if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not defined')
  }

  return projectId
}
