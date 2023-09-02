// config.js
// LOOK HERE! Never put a trailing '/' eg: https://abc.com/ <- dont do that
function getConfig() {
    const defaultConfig = {
      apiUrl: 'https://propfix-backend-go-mm4ahu6lbq-uc.a.run.app',
    };
  
    const location = window.location.href;
    
    switch (true) {
      case location.includes('propfix'):
        return defaultConfig;
      case location.includes('localhost'):
        return {
          apiUrl: 'http://localhost:8080/api/authenticated/',
        };
      case location.includes('gitpod'):
        return defaultConfig;
      default:
        return defaultConfig;
    }
  }
  

  const config = getConfig();

  export default config;  