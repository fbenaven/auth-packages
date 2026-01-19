import type { MiddlewareHandler } from 'hono';

export const roleGuard = (requiredRoles: string | string[]): MiddlewareHandler => {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized: No user session found' }, 401);
    }

    // Logic to support Supabase, Auth0, and OIDC
    const userRoles: string[] = [];

    // 1. Check 'role' (Supabase default)
    if (typeof user.role === 'string') userRoles.push(user.role);

    // 2. Check 'roles' array (Common OIDC/Auth0)
    if (Array.isArray(user.roles)) userRoles.push(...user.roles);

    // 3. Check 'permissions' (Auth0 specific RBAC)
    if (Array.isArray(user.permissions)) userRoles.push(...user.permissions);

    // 4. Check 'app_metadata.roles' (Supabase custom or Auth0 custom)
    if (user.app_metadata && Array.isArray(user.app_metadata.roles)) {
      userRoles.push(...user.app_metadata.roles);
    }

    const hasAccess = roles.some(role => userRoles.includes(role));

    if (!hasAccess) {
      return c.json({ error: 'Forbidden: Insufficient permissions' }, 403);
    }

    await next();
  };
};
