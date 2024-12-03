export const getConfig = (key: string, defaultValue: string = ''): string => {
  // In a real app, this would load from environment variables or a config file
  const config: { [key: string]: string } = {
    API_URL: 'http://localhost:3000/api',
    OTP_EXPIRATION: '300',
  };
  
  return config[key] || defaultValue;
};