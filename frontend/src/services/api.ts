import axios, { AxiosError } from "axios";
import type {
  AuthResponse,
  User,
  Auction,
  AuctionListResponse,
  AuctionQueryParams,
  Bid,
  PlaceBidResponse,
  LandedPrice,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },
};

// Users API
export const usersApi = {
  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/users/me");
    return response.data;
  },

  updateMe: async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): Promise<User> => {
    const response = await api.put<User>("/users/me", data);
    return response.data;
  },

  getPublicProfile: async (userId: string) => {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  },

  addFunds: async (
    amount: number,
  ): Promise<{ walletBalance: number; message: string }> => {
    const response = await api.post<{ walletBalance: number; message: string }>(
      "/users/me/add-funds",
      { amount },
    );
    return response.data;
  },

  // Admin
  getAll: async (): Promise<{ users: User[]; total: number }> => {
    const response = await api.get<{ users: User[]; total: number }>("/users");
    return response.data;
  },

  ban: async (userId: string, reason: string): Promise<void> => {
    await api.post(`/users/${userId}/ban`, { reason });
  },

  unban: async (userId: string): Promise<void> => {
    await api.post(`/users/${userId}/unban`);
  },

  verify: async (userId: string): Promise<void> => {
    await api.post(`/users/${userId}/verify`);
  },
};

// Auctions API
export const auctionsApi = {
  getLive: async (
    params?: AuctionQueryParams,
  ): Promise<AuctionListResponse> => {
    const response = await api.get<AuctionListResponse>("/auctions/live", {
      params,
    });
    return response.data;
  },

  getFeatured: async (): Promise<Auction[]> => {
    const response = await api.get<Auction[]>("/auctions/featured");
    return response.data;
  },

  getEndingSoon: async (limit?: number): Promise<Auction[]> => {
    const response = await api.get<Auction[]>("/auctions/ending-soon", {
      params: { limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Auction> => {
    const response = await api.get<Auction>(`/auctions/${id}`);
    return response.data;
  },

  getByIdAdmin: async (id: string): Promise<Auction> => {
    const response = await api.get<Auction>(`/auctions/admin/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<string[]> => {
    const response = await api.get<string[]>("/auctions/categories");
    return response.data;
  },

  calculatePrice: async (
    id: string,
    international?: boolean,
  ): Promise<LandedPrice> => {
    const response = await api.get<LandedPrice>(
      `/auctions/${id}/price-calculator`,
      {
        params: { international },
      },
    );
    return response.data;
  },

  requestPrivateAccess: async (id: string, password: string) => {
    const response = await api.post(`/auctions/${id}/access`, { password });
    return response.data;
  },

  // Admin
  getAll: async (params?: AuctionQueryParams): Promise<AuctionListResponse> => {
    const response = await api.get<AuctionListResponse>("/auctions", {
      params,
    });
    return response.data;
  },

  create: async (data: Partial<Auction>): Promise<Auction> => {
    const response = await api.post<Auction>("/auctions", data);
    return response.data;
  },

  update: async (id: string, data: Partial<Auction>): Promise<Auction> => {
    const response = await api.put<Auction>(`/auctions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/auctions/${id}`);
  },

  publish: async (id: string): Promise<Auction> => {
    const response = await api.post<Auction>(`/auctions/${id}/publish`);
    return response.data;
  },

  close: async (id: string): Promise<Auction> => {
    const response = await api.post<Auction>(`/auctions/${id}/close`);
    return response.data;
  },

  acceptBid: async (id: string): Promise<Auction> => {
    const response = await api.post<Auction>(`/auctions/${id}/accept-bid`);
    return response.data;
  },

  buyNow: async (
    id: string,
  ): Promise<{ message: string; auction: Auction; price: number }> => {
    const response = await api.post<{
      message: string;
      auction: Auction;
      price: number;
    }>(`/auctions/${id}/buy-now`);
    return response.data;
  },
};

// Bids API
export const bidsApi = {
  place: async (
    auctionId: string,
    amount: number,
  ): Promise<PlaceBidResponse> => {
    const response = await api.post<PlaceBidResponse>("/bids", {
      auctionId,
      amount,
    });
    return response.data;
  },

  getHistory: async (auctionId: string, limit?: number): Promise<Bid[]> => {
    const response = await api.get<Bid[]>(`/bids/auction/${auctionId}`, {
      params: { limit },
    });
    return response.data;
  },

  getMyBids: async (
    page?: number,
    limit?: number,
  ): Promise<{ bids: Bid[]; total: number }> => {
    const response = await api.get<{ bids: Bid[]; total: number }>(
      "/bids/my-bids",
      {
        params: { page, limit },
      },
    );
    return response.data;
  },

  getMyWinning: async (): Promise<Bid[]> => {
    const response = await api.get<Bid[]>("/bids/my-winning");
    return response.data;
  },
};

export default api;
