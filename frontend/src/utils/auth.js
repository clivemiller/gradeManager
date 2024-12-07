export function isAuthenticated() {
    return !!localStorage.getItem('token');
  }
  
  export function getRole() {
    return localStorage.getItem('role');
  }
  
  export function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
  }
  