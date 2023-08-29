import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}`;

// Function to fetch job data by ID
export async function getJob(jobId, idToken) {
  try {
    const params = [jobId, idToken];
    return await jsonRpcRequest('Jobs.GetJob', params, idToken);
  } catch (error) {
    console.error('Error fetching job:', error);
    return null;
  }
}

// Function to create a new job
export async function createJob(jobData, idToken) {
  try {
    const params = [jobData, idToken];
    return await jsonRpcRequest('Jobs.CreateJob', params, idToken);
  } catch (error) {
    console.error('Error creating job:', error);
    return null;
  }
}

// Function to update an existing job
export async function updateJob(jobId, jobData, idToken) {
  try {
    const params = [jobId, jobData, idToken];
    return await jsonRpcRequest('Jobs.UpdateJob', params, idToken);
  } catch (error) {
    console.error('Error updating job:', error);
    return null;
  }
}

// Function to delete a job by ID
export async function deleteJob(jobId, idToken) {
  try {
    const params = [jobId, idToken];
    await jsonRpcRequest('Jobs.DeleteJob', params, idToken);
  } catch (error) {
    console.error('Error deleting job:', error);
  }
}

// Function to fetch all jobs
export async function getAllJobs(idToken) {
  try {
    const params = [idToken];
    return await jsonRpcRequest('Jobs.GetAllJobs', params, idToken);
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    return [];
  }
}

export async function getBoard(idToken, organizationId) {
  try {
    const params = [{organizationId}];

    return await jsonRpcRequest('Jobs.GetKanbanBoard', params, idToken);
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    return [];
  }
}
