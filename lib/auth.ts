export function requireAdmin(req: Request) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    throw new Error('ADMIN_API_KEY is not configured on the server');
  }

  const header = req.headers.get('x-admin-key');
  if (!header || header !== adminKey) {
    return false;
  }
  return true;
}

export function getAdminCheck(req: Request) {
  try {
    return requireAdmin(req);
  } catch (err) {
    return false;
  }
}
