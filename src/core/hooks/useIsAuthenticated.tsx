import { useUser } from '../ui/context/user';

export function useIsAuthenticated(): boolean {
  const user = useUser();

  return user.loggedIn;
}
