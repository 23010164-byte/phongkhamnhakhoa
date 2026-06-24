import useAuthStore from '../store/auth.store'

const useAuth = () => {
  const user = useAuthStore((state) => state.user)

  return {
    user,
    role: user?.role,
    isDoctor: user?.role === 'doctor',
    isAdmin: user?.role === 'admin',
    isPatient: user?.role === 'patient',
    isReceptionist: user?.role === 'receptionist',
  }
}

export default useAuth