// config.js
// LOOK HERE! Never put a training '/' eg: https://abc.com/ <- dont do that
function getConfig() {
    const defaultConfig = {
      apiUrl: 'https://scraper-backend-go-gizrqdvcaq-uc.a.run.app',
    };
  
    const location = window.location.href;
    
    switch (true) {
      case location.includes('scraping-is-hard'):
        return defaultConfig;
      case location.includes('localhost'):
        return {
          apiUrl: 'http://localhost:8080',
        };
      case location.includes('gitpod'):
        return {
          apiUrl: 'https://8080-exolutionte-scraperback-1f6qg47a14l.ws-eu101.gitpod.io',
        };
      default:
        return defaultConfig;
    }
  }
  

  const config = getConfig();

  export default config;  