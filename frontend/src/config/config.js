function getConfig() {
  const defaultConfig = {
    apiUrl: 'https://propfix-backend-go-mm4ahu6lbq-uc.a.run.app',
    supabaseUrl: 'https://tcgmonunzroeujvmqcir.supabase.co',
    supabaseKey: '***REMOVED-SUPABASE-ANON-KEY***'
  };

  const location = window.location.href;
  
  if (location.includes('localhost')) {
    return defaultConfig;
  } 
  return defaultConfig;

}

const config = getConfig();

export default config;
