"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { NewBidEvent, OutbidEvent, AuctionEndedEvent } from "@/types";
import { useAuthStore } from "@/store/auth";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

interface UseAuctionSocketOptions {
  auctionId: string;
  onNewBid?: (data: NewBidEvent) => void;
  onOutbid?: (data: OutbidEvent) => void;
  onAuctionEnded?: (data: AuctionEndedEvent) => void;
  onTimeExtended?: (data: { auctionId: string; newEndTime: string }) => void;
  onBuyNow?: (data: { buyerId: string; price: number }) => void;
  onAuctionSold?: () => void;
}

export function useAuctionSocket({
  auctionId,
  onNewBid,
  onOutbid,
  onAuctionEnded,
  onTimeExtended,
  onBuyNow,
  onAuctionSold,
}: UseAuctionSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    // Connect to socket
    socketRef.current = io(`${SOCKET_URL}/auctions`, {
      transports: ["websocket"],
      autoConnect: true,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to auction socket");

      // Join auction room
      socket.emit("join-auction", { auctionId });

      // Authenticate if logged in
      if (user && accessToken) {
        socket.emit("authenticate", { userId: user.id });
      }
    });

    // Event listeners
    socket.on("new-bid", (data: NewBidEvent) => {
      onNewBid?.(data);
    });

    socket.on("outbid", (data: OutbidEvent) => {
      onOutbid?.(data);
    });

    socket.on("auction-ended", (data: AuctionEndedEvent) => {
      onAuctionEnded?.(data);
    });

    socket.on(
      "time-extended",
      (data: { auctionId: string; newEndTime: string }) => {
        onTimeExtended?.(data);
      },
    );

    socket.on("buy-now", (data: { buyerId: string; price: number }) => {
      onBuyNow?.(data);
      onAuctionSold?.();
    });

    socket.on("auction-sold", () => {
      onAuctionSold?.();
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from auction socket");
    });

    // Cleanup
    return () => {
      socket.emit("leave-auction", { auctionId });
      socket.disconnect();
    };
  }, [
    auctionId,
    user,
    accessToken,
    onNewBid,
    onOutbid,
    onAuctionEnded,
    onTimeExtended,
    onBuyNow,
    onAuctionSold,
  ]);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  }, []);

  return { socket: socketRef.current, reconnect };
}
