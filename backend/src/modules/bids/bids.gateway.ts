import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/auctions',
})
export class BidsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socket ids

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Clean up user socket mappings
    this.userSockets.forEach((sockets, userId) => {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    });
  }

  @SubscribeMessage('join-auction')
  handleJoinAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auctionId: string },
  ) {
    client.join(`auction:${data.auctionId}`);
    console.log(`Client ${client.id} joined auction:${data.auctionId}`);
    return { event: 'joined', data: { auctionId: data.auctionId } };
  }

  @SubscribeMessage('leave-auction')
  handleLeaveAuction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auctionId: string },
  ) {
    client.leave(`auction:${data.auctionId}`);
    return { event: 'left', data: { auctionId: data.auctionId } };
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    if (!this.userSockets.has(data.userId)) {
      this.userSockets.set(data.userId, new Set());
    }
    const userSocketSet = this.userSockets.get(data.userId);
    if (userSocketSet) {
      userSocketSet.add(client.id);
    }
    client.join(`user:${data.userId}`);
    return { event: 'authenticated' };
  }

  // Broadcast new bid to all clients watching an auction
  broadcastBid(auctionId: string, bidData: any) {
    this.server.to(`auction:${auctionId}`).emit('new-bid', bidData);
  }

  // Notify a specific user they've been outbid
  notifyOutbid(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('outbid', data);
  }

  // Notify auction ended
  notifyAuctionEnded(auctionId: string, data: any) {
    this.server.to(`auction:${auctionId}`).emit('auction-ended', data);
  }

  // Notify Buy Now used
  notifyBuyNow(auctionId: string, data: any) {
    this.server.to(`auction:${auctionId}`).emit('buy-now', data);
  }

  // Broadcast time update (for anti-snipe)
  broadcastTimeExtension(auctionId: string, newEndTime: Date) {
    this.server.to(`auction:${auctionId}`).emit('time-extended', {
      auctionId,
      newEndTime,
    });
  }

  // Get number of watchers for an auction
  async getAuctionWatchers(auctionId: string): Promise<number> {
    const room = this.server.sockets.adapter.rooms.get(`auction:${auctionId}`);
    return room ? room.size : 0;
  }
}
