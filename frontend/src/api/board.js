import axios from 'axios';
import config from '../config/config';

// Define the base URL for the API
const API_BASE_URL = `${config.apiUrl}`;

// Define the URL for the "board" endpoint
const BOARD_URL = `${API_BASE_URL}/board`;

// Function to fetch the board data
export async function fetchBoard(idToken) {
  try {
    const response = await axios.get(BOARD_URL, { headers: { Authorization: idToken } });
    return response.data;
  } catch (error) {
    console.error('Error fetching board:', error);
    return null;
  }
}

