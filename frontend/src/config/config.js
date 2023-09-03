// config.js
// LOOK HERE! Never put a trailing '/' eg: https://abc.com/ <- dont do that
function getConfig() {
    const defaultConfig = {
      apiUrl: 'https://us-central1-propfix.cloudfunctions.net/function-backend-go',
    };
  
    const location = window.location.href;
    
    switch (true) {
      case location.includes('propfix'):
        return defaultConfig;
      case location.includes('localhost'):
        return {
          apiUrl: 'http://localhost:8080',
        };
      case location.includes('gitpod'):
        return defaultConfig;
      default:
        return defaultConfig;
    }
  }
  

  const config = getConfig();

  export default config;  