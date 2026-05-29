export function formatUsername(username: string | null | undefined) {
  if (username === null || username === undefined || username.length === 0) {
    return "";
  }

  return username.charAt(0).toLocaleUpperCase("fr-FR") + username.slice(1);
}
