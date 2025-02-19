import * as mediasoup from "mediasoup";
import { config } from "@config/mediasoup";
import { logger } from "@config/logger";
import {
  Worker,
  Router,
  Transport,
  Producer,
  Consumer,
} from "mediasoup/node/lib/types";

interface Room {
  id: string;
  router: Router;
  peers: Map<string, Peer>;
}

interface Peer {
  id: string;
  name: string;
  transports: Map<string, Transport>;
  producers: Map<string, Producer>;
  consumers: Map<string, Consumer>;
}

export class RoomManager {
  private static instance: RoomManager;
  private workers: Worker[] = [];
  private rooms: Map<string, Room> = new Map();
  private workerIndex = 0;

  private constructor() {
    this.createWorkers();
  }

  public static getInstance(): RoomManager {
    if (!RoomManager.instance) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
  }

  private async createWorkers() {
    const { numWorkers = 1 } = config.worker;
    logger.info(`[MediaSoup] Creating ${numWorkers} workers...`);

    for (let i = 0; i < numWorkers; i++) {
      const worker = await mediasoup.createWorker({
        logLevel: config.worker.logLevel as mediasoup.types.WorkerLogLevel,
        logTags: config.worker.logTags as mediasoup.types.WorkerLogTag[],
        rtcMinPort: config.worker.rtcMinPort,
        rtcMaxPort: config.worker.rtcMaxPort,
      });

      worker.on("died", () => {
        logger.error(
          `[MediaSoup] Worker died, exiting in 2 seconds... [pid:${worker.pid}]`
        );
        setTimeout(() => process.exit(1), 2000);
      });

      this.workers.push(worker);
    }
  }

  private getNextWorker(): Worker {
    const worker = this.workers[this.workerIndex];
    this.workerIndex = (this.workerIndex + 1) % this.workers.length;
    return worker;
  }

  public async createRoom(roomId: string): Promise<Room> {
    if (this.rooms.has(roomId)) {
      return this.rooms.get(roomId)!;
    }

    logger.info(`[MediaSoup] Creating room: ${roomId}`);
    const worker = this.getNextWorker();
    const router = await worker.createRouter({
      mediaCodecs: config.router.mediaCodecs,
    });

    const room: Room = {
      id: roomId,
      router,
      peers: new Map(),
    };

    this.rooms.set(roomId, room);
    return room;
  }

  public async createPeer(
    roomId: string,
    peerId: string,
    peerName: string
  ): Promise<Peer> {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    if (room.peers.has(peerId)) {
      return room.peers.get(peerId)!;
    }

    logger.info(`[MediaSoup] Creating peer: ${peerId} in room: ${roomId}`);
    const peer: Peer = {
      id: peerId,
      name: peerName,
      transports: new Map(),
      producers: new Map(),
      consumers: new Map(),
    };

    room.peers.set(peerId, peer);
    return peer;
  }

  public async createWebRtcTransport(
    roomId: string,
    peerId: string,
    direction: "send" | "receive"
  ): Promise<Transport> {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    const peer = room.peers.get(peerId);
    if (!peer) {
      throw new Error(`Peer ${peerId} not found`);
    }

    const transport = await room.router.createWebRtcTransport({
      ...config.webRtcTransport,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      appData: { type: direction },
    });

    peer.transports.set(transport.id, transport);

    transport.on("dtlsstatechange", (dtlsState) => {
      if (dtlsState === "closed") {
        transport.close();
      }
    });

    transport.on("@close", () => {
      peer.transports.delete(transport.id);
    });

    return transport;
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public getPeer(roomId: string, peerId: string): Peer | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;
    return room.peers.get(peerId);
  }

  public async closeRoom(roomId: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.peers.forEach((peer) => {
      this.closePeer(roomId, peer.id);
    });

    room.router.close();
    this.rooms.delete(roomId);
    logger.info(`[MediaSoup] Room closed: ${roomId}`);
  }

  public async closePeer(roomId: string, peerId: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const peer = room.peers.get(peerId);
    if (!peer) return;

    peer.producers.forEach((producer) => producer.close());
    peer.consumers.forEach((consumer) => consumer.close());
    peer.transports.forEach((transport) => transport.close());

    room.peers.delete(peerId);
    logger.info(`[MediaSoup] Peer closed: ${peerId} in room: ${roomId}`);
  }
}
