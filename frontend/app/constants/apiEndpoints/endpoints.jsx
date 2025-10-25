export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME:"/auth/me",
  },
  TRENDS: {
    BASE: "/trending",
    CREATE: "/trending",         // POST
    LIST: "/trending",           // GET all
    DETAIL: (slug) => `/trending/${slug}`, // GET one
    UPDATE: (slug) => `/trending/${slug}`, // PUT
    DELETE: (slug) => `/trending/${slug}`, // DELETE
  },
  MOST_SALES: {
    BASE: "/most-sales",
    CREATE: "/most-sales",         // POST
    LIST: "/most-sales",           // GET all
    DETAIL: (slug) => `/most-sales/${slug}`, // GET one
    UPDATE: (slug) => `/most-sales/${slug}`, // PUT
    DELETE: (slug) => `/most-sales/${slug}`, // DELETE
  },
  PRODUCT: {
    BASE: "/product",
    CREATE: "/product",         // POST
    LIST: "/product",           // GET all
    DETAIL: (id) => `/product/${id}`, // GET one
    UPDATE: (id) => `/product/${id}`, // PUT
    DELETE: (id) => `/product/${id}`, // DELETE
  },
  CART: {
    ADD_ITEM: "/cart/add",
    REMOVE_ITEM: "/cart/remove",
    UPDATE_ITEM: "/cart/item",
    CLEAR: "/cart/clear",
    GET: "/cart",
  },
  ORDERS: {
    CREATE: "/orders",
    MY_ORDERS: "/orders/mine",
    ORDER_DETAIL: (id) => `/orders/${id}`,
    LIST: "/orders",
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
  },
  



};
