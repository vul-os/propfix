import axios from 'axios';
import config from '../config/config';

// Define the base URL for the API
const API_BASE_URL = `${config.apiUrl}`;

// Define the URL for the "members" endpoint
const MEMBERS_URL = `${API_BASE_URL}/members`;

// Function to fetch member data by ID
export async function fetchMemberById(memberId, idToken) {
  try {
    const response = await axios.get(`${MEMBERS_URL}/${memberId}`, { headers: { Authorization: idToken } });
    return response.data;
  } catch (error) {
    console.error('Error fetching member:', error);
    return null;
  }
}

// Function to create a new member
export async function createMember(memberData, idToken) {
  try {
    const response = await axios.post(MEMBERS_URL, memberData, { headers: { Authorization: idToken } });
    return response.data;
  } catch (error) {
    console.error('Error creating member:', error);
    return null;
  }
}

// Function to update an existing member
export async function updateMember(memberId, memberData, idToken) {
  try {
    const response = await axios.put(`${MEMBERS_URL}/${memberId}`, memberData, { headers: { Authorization: idToken } });
    return response.data;
  } catch (error) {
    console.error('Error updating member:', error);
    return null;
  }
}

// Function to delete a member by ID
export async function deleteMember(memberId, idToken) {
  try {
    await axios.delete(`${MEMBERS_URL}/${memberId}`, { headers: { Authorization: idToken } });
  } catch (error) {
    console.error('Error deleting member:', error);
  }
}
