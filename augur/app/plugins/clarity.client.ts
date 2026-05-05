import Clarity from '@microsoft/clarity'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const projectId = config.public.clarityProjectId as string

  if (!projectId) return

  Clarity.init(projectId)
})
