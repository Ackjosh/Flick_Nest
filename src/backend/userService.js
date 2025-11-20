import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class UserService {
  static async addToFavorites(userId, itemId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/favorites`, {
        userId,
        itemId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  static async removeFromFavorites(userId, itemId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/favorites`, {
        data: { userId, itemId }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  static async isInFavorites(userId, itemId) {
    try {
      const userData = await this.getUserData(userId);
      return userData.favorites && userData.favorites.includes(itemId);
    } catch (error) {
      console.error('Error checking favorites:', error);
      return false;
    }
  }

  static async addToWatchlist(userId, itemId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/watchlist`, {
        userId,
        itemId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  static async removeFromWatchlist(userId, itemId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/watchlist`, {
        data: { userId, itemId }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  static async getUserData(userId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }
}