import axios from 'axios';
import config from '../config/config';

// Define the base URL for the API
const API_BASE_URL = `${config.apiUrl}`;

// Define the URL for the "jobs" endpoint
const JOBS_URL = `${API_BASE_URL}/jobs`;

// Function to fetch job data by ID
export async function fetchJobById(jobId, idToken) {
  try {
    const response = await axios.get(`${JOBS_URL}/${jobId}`, { headers: { Authorization: idToken } });
    return response.data;
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}

// Function to create a new job
export async function createJob(jobData, idToken) {
  try {
    const response = await axios.post(JOBS_URL, jobData, { headers: { Authorization: idToken } });
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    return null;
  }
}

// Function to update an existing job
export async function updateJob(jobId, jobData, idToken) {
  try {
    const response = await axios.put(`${JOBS_URL}/${jobId}`, jobData, { headers: { Authorization: idToken } });
    return response.data;
  } catch (error) {
    console.error('Error updating job:', error);
    return null;
  }
}

// Function to delete a job by ID
export async function deleteJob(jobId, idToken) {
  try {
    await axios.delete(`${JOBS_URL}/${jobId}`, { headers: { Authorization: idToken } });
  } catch (error) {
    console.error('Error deleting job:', error);
  }
}
