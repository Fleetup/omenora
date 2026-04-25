export default defineEventHandler(async () => {
  const BASELINE = 47000

  try {
    const supabase = createSupabaseAdmin()
    const { count, error } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })

    if (error || count === null) {
      return { count: BASELINE }
    }

    return { count: BASELINE + count }
  } catch {
    return { count: BASELINE }
  }
})
