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

export function getCustomerName(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const nameCookie = cookies.find(cookie => cookie.trim().startsWith('customer_name='));
  
  if (!nameCookie) return null;
  
  try {
    const value = nameCookie.split('=')[1];
    return decodeURIComponent(value) || null;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window === 'undefined') return;

  // Call server route to clear httpOnly cookies as well
  fetch('/api/public/logout', { method: 'POST' })
    .catch(() => {})
    .finally(() => {
      // Redirect to home
      window.location.href = '/';
    });
}
