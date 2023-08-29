import axios from 'axios';
import config from '../config/config';

const API_BASE_URL = `${config.apiUrl}`;

// Function to upload a file
export async function uploadFile(jobId, file, token) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${API_BASE_URL}/file/${jobId}`,
      formData,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log('File uploaded successfully!', response.data);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}

// Function to get a file
export async function getFile(jobId, filename, idToken) {
  try {
    const response = await axios.get(`${API_BASE_URL}/file/${jobId}/${filename}`, {
      headers: {
        Authorization: idToken,
      },
    });

    console.log('File fetched successfully!', response.data);
    // Here you can use the file data in the response as needed
    return response.data;
  } catch (error) {
    console.error('Error fetching file:', error);
    return null;
  }
}

// Function to delete a file
export async function deleteFile(jobId, filename, idToken) {
  try {
    await axios.delete(`${API_BASE_URL}/file/${jobId}/${filename}`, {
      headers: {
        Authorization: idToken,
      },
    });

    console.log('File deleted successfully!');
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}
