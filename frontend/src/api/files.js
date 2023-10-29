import axios from 'axios';
import { supabase } from './supabase'; // Update the path as needed


// Function to upload a file
export async function uploadFile(jobId, file) {
  console.log(file)
  try {
    const filePath = `jobs/${jobId}/${file.name}`;

    const { error } = await supabase.storage.from('attachments').upload(filePath, file);
    
    if (error) {
        console.error('Error uploading file:', error);
        return false
    } 
    return true
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

// Function to get a file
export async function getFile(jobIdFilename) {
  const filePath = `jobs/${jobIdFilename}`;

  try {
    const { publicURL, error } = supabase.storage.from('attachments').getPublicUrl(filePath);
    if (error) {
        console.error('Error uploading file:', error);
        return false
    } 

    const response = await axios.get(publicURL);
    console.log("IMPORTANT: ", response)
    console.log('File fetched successfully!', response.data);
    // Here you can use the file data in the response as needed
    return response.data;
  } catch (error) {
    console.error('Error fetching file:', error);
    return null;
  }
}

export async function getFiles(jobId, filenames) {
  if (!Array.isArray(filenames)) {
      console.error('Expected an array of filenames');
      return null;
  }

  const fetchFile = async (filename) => {
      const filePath = `jobs/${jobId}/${filename}`;
      console.log("Fetching:", filePath);

      try {
          const resp = await supabase.storage.from('attachments').download(filePath);

          // Check if there's an error in the response
          if (resp.error) {
              console.error(`Error downloading file ${filename}:`, resp.error);
              return null;
          }

          // Check if the data exists in the response
          if (!resp.data) {
              console.error(`No data found for file ${filename}`);
              return null;
          }

          return {"name": filename, "data": resp.data}
      } catch (error) {
          console.error(`Error fetching file ${filename}:`, error);
          return null;
      }
  };

  const fileContents = await Promise.all(filenames.map(fetchFile));
  console.log("Downloaded files:", fileContents);
  return fileContents;
}



export async function deleteFile(jobId, filename) {
  try {
    const filePath = `jobs/${jobId}/${filename}`;

    const { error } = await supabase.storage.from('attachments').remove([filePath]);
    
    if (error) {
        console.error('Error uploading file:', error);
        return false
    } 
    return true
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}
