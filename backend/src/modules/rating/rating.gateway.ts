import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// @WebSocketGateway({ cors: { origin: '*' } })
@WebSocketGateway({ cors: { origin: 'http://localhost:3000' } })
export class RatingGateway {
  @WebSocketServer()
  server: Server;
  @SubscribeMessage('joinProductRoom')
  handleJoin(
    @MessageBody() bookId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(bookId);
    // console.log(` Client ${client.id} joined room ${bookId}`);
    return { event: 'joined', bookId };
  }

  sendRatingUpdate(bookId: string, rating: any) {
    // console.log(` Sending rating update for book ${bookId}`);
    this.server.to(bookId).emit('ratingUpdate', rating);
  }
}
