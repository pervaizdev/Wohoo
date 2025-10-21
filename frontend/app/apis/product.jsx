// Apis/trending.js
import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const productAPI = {
  create: async (formData) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.PRODUCT.CREATE,
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

list: async (params = {}) => {
  try {
    // default pagination params
    const { page = 1, limit = 9 } = params;

    const response = await axiosInstance.get(ENDPOINTS.PRODUCT.LIST, {
      params: { page, limit }, // will send ?page=1&limit=9
    });

    // backend returns { success, data: [...], pagination: {...} }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch products" };
  }
},


  detail: async (slug) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.PRODUCT.DETAIL(slug));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch trending item" };
    }
  },

  update: async (id, formData) => {
    try {
      const response = await axiosInstance.put(
        ENDPOINTS.PRODUCT.UPDATE(id),
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

  remove: async (id) => {
    try {
      const response = await axiosInstance.delete(ENDPOINTS.PRODUCT.DELETE(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete trending item" };
    }
  },
};
