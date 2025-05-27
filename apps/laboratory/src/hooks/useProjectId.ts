import { useProjectIdContext } from '../context/ProjectIdContext'

export function useProjectId() {
  const { projectId, setProjectId, isProjectIdLoading } = useProjectIdContext()

  return { projectId, setProjectId, isProjectIdLoading }
}
