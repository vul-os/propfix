
const extractEmailUsername = (email) => {
    // Split the email by '@' and take the first part
    const [username] = email.split('@');
  
    // Trim the spaces
    return username.trim();
  };
  
export default extractEmailUsername