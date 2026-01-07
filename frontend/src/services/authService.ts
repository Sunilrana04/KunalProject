export const authService = {
  async login(username: string, password: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    localStorage.setItem('authToken', data.token);
    localStorage.setItem('authUser', JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('authUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },

  getToken() {
    return localStorage.getItem('authToken');
  },
};