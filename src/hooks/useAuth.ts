// useAuth hook for authentication and role-aware UI
export const useAuth = () => {
  // TODO: Implement authentication logic
  return {
    user: null,
    token: null,
    isManager: false,
    isOwner: false,
  };
};
