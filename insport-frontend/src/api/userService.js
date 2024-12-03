// Example API base URL
const API_URL = 'https://localhost:5000/api'; // Replace with your actual API URL

export const userService = {
  login,
  logout,
  getCurrentUser,
};

// Function to log in a user
async function login(credentials) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem('user', JSON.stringify(data)); // Store user data in local storage (or secure storage)
    return data; // Return the user data
  } catch (error) {
    console.error('Login error:', error);
    throw error; // Rethrow the error to handle in UI
  }
}

// Function to log out the user
function logout() {
  localStorage.removeItem('user'); // Clear user from storage
  // Optionally: Make API call to handle server-side logout, if needed
  // Example: await fetch(`${API_URL}/logout`, { method: 'POST' });
}

// Function to get the current logged-in user
async function getCurrentUser() {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser); // Return user from local storage if available
    } else {
      // Optionally: Fetch current user from the server
      // const response = await fetch(`${API_URL}/current-user`);
      // const data = await response.json();
      // return data;
      return null; // No user found
    }
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null; // Return null if an error occurs
  }
}
