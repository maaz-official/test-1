import AsyncStorage from '@react-native-async-storage/async-storage';

export const getToken = async () => {
  return await AsyncStorage.getItem('userToken');
};

export const handleUnauthorized = async () => {
  await AsyncStorage.removeItem('userToken');
  // Redirect to login or show a notification
};
