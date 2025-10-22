export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for customer_auth flag cookie (readable by JS)
  const cookies = document.cookie.split(';');
  return cookies.some(cookie => cookie.trim().startsWith('customer_auth='));
}

export function getCustomerEmail(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const emailCookie = cookies.find(cookie => cookie.trim().startsWith('customer_email='));
  
  if (!emailCookie) return null;
  
  try {
    const value = emailCookie.split('=')[1];
    return value || null;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  
  // Clear all auth cookies
  document.cookie = 'customer_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'customer_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'customer_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  // Redirect to home
  window.location.href = '/';
}
