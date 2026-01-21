export const useUserRole = () => {
  const isSuperAdmin = ref(false)
  const userRole = ref<'user' | 'admin' | 'superAdmin' | null>(null)
  const loading = ref(true)

  const checkUserRole = async () => {
    loading.value = true
    
    try {
      const supabase = useSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        isSuperAdmin.value = false
        userRole.value = null
        return
      }

      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

      if (error || !usuario) {
        isSuperAdmin.value = false
        userRole.value = null
        return
      }

      userRole.value = usuario.role
      isSuperAdmin.value = usuario.role === 'superAdmin'
    } catch (error) {
      console.error('Erro ao verificar role do usuário:', error)
      isSuperAdmin.value = false
      userRole.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    isSuperAdmin,
    userRole,
    loading,
    checkUserRole
  }
}
