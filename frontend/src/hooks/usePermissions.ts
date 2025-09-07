import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../types/constants';

export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isRoot = (): boolean => {
    return hasRole(USER_ROLES.ROOT);
  };

  const isGestaoDados = (): boolean => {
    return hasRole(USER_ROLES.GESTAO_DADOS);
  };

  const isVisualizacao = (): boolean => {
    return hasRole(USER_ROLES.VISUALIZACAO);
  };

  const canManageUsers = (): boolean => {
    return isRoot();
  };

  const canManageData = (): boolean => {
    return hasAnyRole([USER_ROLES.ROOT, USER_ROLES.GESTAO_DADOS]);
  };

  const canViewOnly = (): boolean => {
    return hasAnyRole([USER_ROLES.ROOT, USER_ROLES.GESTAO_DADOS, USER_ROLES.VISUALIZACAO]);
  };

  const canAccessAudit = (): boolean => {
    return isRoot();
  };

  const canImportExport = (): boolean => {
    return hasAnyRole([USER_ROLES.ROOT, USER_ROLES.GESTAO_DADOS]);
  };

  return {
    hasRole,
    hasAnyRole,
    isRoot,
    isGestaoDados,
    isVisualizacao,
    canManageUsers,
    canManageData,
    canViewOnly,
    canAccessAudit,
    canImportExport,
    userRole: user?.role
  };
};
