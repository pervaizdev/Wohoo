import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const authAPI = {
  signUp: async (userData) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.REGISTER,
        userData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Signup failed" };
    }
  },

  login: async (credentials) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  Me: async () => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.AUTH.ME,
   
      );
      return response.data; // Return the user data
    }
    catch (error) {
      throw error.response?.data || { message: "Error fetching user data" };
    }
  },
  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.FORGETPASSWORD,
        { email }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Password reset request failed" };
    }
  },

  verifyCode: async (email, code) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.VERIFYCODE,
        { email, code }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Code verification failed" };
    }
  },

  resetPassword: async (email, code, password, password_confirmation) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.AUTH.RESETPASSWORD,
        { email, code, password, password_confirmation }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Password reset failed" };
    }
  },


  

  
};
