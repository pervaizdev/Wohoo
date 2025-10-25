import axiosInstance from "../utils/axiosInstance";
import { ENDPOINTS } from "../constants/apiEndpoints/endpoints";

export const orderAPI = {
  placeOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post(
        ENDPOINTS.ORDERS.CREATE,
        orderData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to place order" };
    }
  },
  getMyOrders: async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.ORDERS.MY_ORDERS);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch orders" };
    }
  },
  getOrderDetail: async (orderId) => {
    try {
      const response = await axiosInstance.get(
        ENDPOINTS.ORDERS.ORDER_DETAIL(orderId)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch order detail" };
    }
  },
  updateStatus: async (orderId, status) => {
    try {
      const response = await axiosInstance.patch(
        ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
        { status }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update order status" };
    }
  },
 listOrders: async (qs = "") => {
    const url = qs ? `${ENDPOINTS.ORDERS.LIST}?${qs}` : ENDPOINTS.ORDERS.LIST;
    try {
      const response = await axiosInstance.get(url);
      return response.data; // expect { success, orders, pagination }
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch orders list" };
    }
  },

};
