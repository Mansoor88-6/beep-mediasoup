
export enum Environment {
  Production = "production",
  Development = "development",
  Testing = "testing",
}

type Initiator = {
  _id: string;
  email?: string;
  system_name?: string;
};

type Target = {
  _id: string;
  email?: string;
  system_name?: string;
  name?: string;
};

export interface IAuditLoggerObj {
  action: "create" | "update" | "read" | "delete" | "verify";
  initiator: Initiator;
  targets: Array<Target>;
}
export const enum SocketNamespace {
  Default = "/",
}

export interface MediasoupTypes {
  worker: {
    rtcMinPort: number;
    rtcMaxPort: number;
    logLevel: string;
    logTags: string[];
  };
  router: {
    mediaCodecs: any[];
  };
  webRtcTransport: {
    listenIps: {
      ip: string;
      announcedIp: string;
    }[];
    initialAvailableOutgoingBitrate: number;
    minimumAvailableOutgoingBitrate: number;
    maxSctpMessageSize: number;
    maxIncomingBitrate: number;
  };
}
