// Apis/trending.js
import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const mostSalesAPI = {
  create: async (formData) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.MOST_SALES.CREATE,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create trending item" };
    }
  },

  list: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.MOST_SALES.LIST);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch most sales items" };
    }
  },

  detail: async (slug) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.MOST_SALES.DETAIL(slug));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch most sales item" };
    }
  },

  update: async (slug, formData) => {
    try {
      const response = await axiosInstance.put(
        ENDPOINTS.MOST_SALES.UPDATE(slug),
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update trending item" };
    }
  },

  delete: async (slug) => {
    try {
      const response = await axiosInstance.delete(ENDPOINTS.MOST_SALES.DELETE(slug));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete most sales item" };
    }
  },
};
