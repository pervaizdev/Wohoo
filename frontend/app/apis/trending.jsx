// Apis/trending.js
import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const trendingAPI = {
  create: async (formData) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.TRENDS.CREATE,
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
      const response = await axiosInstance.get(ENDPOINTS.TRENDS.LIST);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch trending items" };
    }
  },

  detail: async (slug) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TRENDS.DETAIL(slug));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch trending item" };
    }
  },

  update: async (slug, formData) => {
    try {
      const response = await axiosInstance.put(
        ENDPOINTS.TRENDS.UPDATE(slug),
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
      const response = await axiosInstance.delete(ENDPOINTS.TRENDS.DELETE(slug));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete trending item" };
    }
  },
};
