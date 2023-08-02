// Define the URL for the "comments" endpoint
const COMMENTS_URL = `${API_BASE_URL}/comments`;

// Function to fetch comment data by ID
export async function fetchCommentById(commentId, idToken) {
  try {
    const response = await axios.get(`${COMMENTS_URL}/${commentId}`, { headers: { Authorization: idToken } });
    return response.data;
  } catch (error) {
    console.error('Error fetching comment:', error);
    return null;
  }
}

// Function to create a new comment
export async function createComment(commentData, idToken) {
  try {
    const response = await axios.post(COMMENTS_URL, commentData, { headers: { Authorization: idToken } });
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    return null;
  }
}

// Function to update an existing comment
export async function updateComment(commentId, commentData, idToken) {
  try {
    const response = await axios.put(`${COMMENTS_URL}/${commentId}`, commentData, { headers: { Authorization: idToken } });
    return response.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    return null;
  }
}

// Function to delete a comment by ID
export async function deleteComment(commentId, idToken) {
  try {
    await axios.delete(`${COMMENTS_URL}/${commentId}`, { headers: { Authorization: idToken } });
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
}
