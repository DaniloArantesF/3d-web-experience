import WebSocket from "ws";

import { heartBeatRate, packetsUpdateRate, pingPongRate } from "./user-networking-settings";
import {
  AnimationState,
  UserNetworkingClientUpdate,
  UserNetworkingCodec,
} from "./UserNetworkingCodec";

export type Client = {
  socket: WebSocket;
  update: UserNetworkingClientUpdate;
};

const WebSocketOpenStatus = 1;

export class UserNetworkingServer {
  private clients: Map<number, Client> = new Map();
  private clientLastPong: Map<number, number> = new Map();

  constructor() {
    setInterval(this.sendUpdates.bind(this), packetsUpdateRate);
    setInterval(this.pingClients.bind(this), pingPongRate);
    setInterval(this.heartBeat.bind(this), heartBeatRate);
  }

  heartBeat() {
    const now = Date.now();
    this.clientLastPong.forEach((clientLastPong, id) => {
      if (now - clientLastPong > heartBeatRate) {
        this.clients.delete(id);
        this.clientLastPong.delete(id);
        const disconnectMessage = JSON.stringify({ id, disconnect: true });
        for (const { socket: otherSocket } of this.clients.values()) {
          if (otherSocket.readyState === WebSocketOpenStatus) {
            otherSocket.send(disconnectMessage);
          }
        }
      }
    });
  }

  pingClients() {
    this.clients.forEach((client) => {
      if (client.socket.readyState === WebSocketOpenStatus) {
        client.socket.send(JSON.stringify({ type: "ping" }));
      }
    });
  }

  getId(): number {
    let id = 1;
    while (this.clients.has(id)) id++;
    return id;
  }

  connectClient(socket: WebSocket) {
    const id = this.getId();

    const connectMessage = JSON.stringify({ id, connected: true });
    socket.send(connectMessage);
    for (const { socket: otherSocket } of this.clients.values()) {
      if (otherSocket.readyState === WebSocketOpenStatus) {
        otherSocket.send(connectMessage);
      }
    }

    for (const { update } of this.clients.values()) {
      socket.send(UserNetworkingCodec.encodeUpdate(update));
    }

    this.clients.set(id, {
      socket: socket as WebSocket,
      update: {
        id,
        position: { x: 0, y: 0, z: 0 },
        rotation: { quaternionY: 0, quaternionW: 0 },
        state: AnimationState.idle,
      },
    });

    socket.on("message", (message: WebSocket.Data, _isBinary: boolean) => {
      let update;

      if (message instanceof Buffer) {
        const arrayBuffer = new Uint8Array(message).buffer;
        update = UserNetworkingCodec.decodeUpdate(arrayBuffer);
      } else {
        try {
          const data = JSON.parse(message as string);
          if (data.type === "pong") {
            this.clientLastPong.set(data.id, Date.now());
          }
        } catch (e) {
          console.error("Error parsing JSON message", message, e);
        }

        return;
      }

      if (update) {
        update.id = id;
        if (this.clients.get(id) !== undefined) {
          this.clients.get(id)!.update = update;

          for (const { socket: otherSocket } of this.clients.values()) {
            if (otherSocket !== socket && otherSocket.readyState === WebSocketOpenStatus) {
              otherSocket.send(message);
            }
          }
        }
      }
    });

    socket.on("close", () => {
      this.clients.delete(id);
      const disconnectMessage = JSON.stringify({ id, disconnect: true });
      for (const [clientId, { socket: otherSocket }] of this.clients) {
        if (otherSocket.readyState === WebSocketOpenStatus) {
          otherSocket.send(disconnectMessage);
        }
      }
    });
  }

  sendUpdates(): void {
    const updates: UserNetworkingClientUpdate[] = [];
    for (const [clientId, client] of this.clients) {
      updates.push(client.update);
    }

    for (const update of updates) {
      const encodedUpdate = UserNetworkingCodec.encodeUpdate(update);
      for (const [clientId, client] of this.clients) {
        if (client.socket.readyState === WebSocketOpenStatus) {
          client.socket.send(encodedUpdate);
        }
      }
    }
  }
}
