if (!import.meta.env.VITE_PROJECT_ID) {
  throw new Error('Env variable VITE_PROJECT_ID is required')
}

export const constants = {
  PROJECT_ID: import.meta.env.VITE_PROJECT_ID
}
