import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const cartAPI = {
  addItem: async (item) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.CART.ADD_ITEM,
        item
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to add item to cart" };
    }
  },

  removeItem: async (itemId) => {
    try {
      const response = await axiosInstance.delete(
        `${ENDPOINTS.CART.REMOVE_ITEM}/${itemId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to remove item from cart" };
    }
  },

  updateItem: async (itemId, updates) => {
    try {
      const response = await axiosInstance.patch(
        `${ENDPOINTS.CART.UPDATE_ITEM}/${itemId}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update cart item" };
    }
  },

  clearCart: async () => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.CART.CLEAR);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to clear cart" };
    }
  },

  getCart: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.CART.GET);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch cart" };
    }
  },
};






  

  

