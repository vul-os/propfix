function getConfig() {
  const defaultConfig = {
    apiUrl: 'https://propfix-backend-go-mm4ahu6lbq-uc.a.run.app',
  };

  const location = window.location.href;
  
  if (location.includes('localhost')) {
    return { apiUrl: 'http://localhost:8080' };
  } 
  return defaultConfig;

}

const config = getConfig();

export default config;
