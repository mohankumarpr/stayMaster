import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: '@user_token',
  USER_DATA: '@user_data',
  SETTINGS: '@settings',
} as const;

class Storage {
  // Store string data
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
      console.log(`Stored ${key}:`, value); // Add logging for debugging
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  // Store object data
  static async setObject(key: string, value: object): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      console.log(`Stored object ${key}:`, jsonValue); // Add logging for debugging
    } catch (error) {
      console.error('Error storing object:', error);
      throw error;
    }
  }

  // Get string data
  static async getItem(key: string): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      console.log(`Retrieved ${key}:`, value); // Add logging for debugging
      return value;
    } catch (error) {
      console.error('Error retrieving data:', error);
      throw error;
    }
  }

  // Get object data
  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving object:', error);
      throw error;
    }
  }

  // Remove item
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  }

  // Clear all data
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  // Get all keys
  static async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      throw error;
    }
  }
}

export default Storage; 