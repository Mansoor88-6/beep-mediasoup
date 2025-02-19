export enum UserRole {
  Client = "client",
  Admin = "admin",
}

export enum Environment {
  Production = "production",
  Development = "development",
  Testing = "testing",
}

export enum WeekDays {
  Sunday = "Sunday",
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
}

export enum Platform {
  WINDOWS = "Windows",
  LINUX = "Linux",
  MAC = "Mac",
}

export const platformMap: { [key: string]: Platform } = {
  win32: Platform.WINDOWS,
  linux: Platform.LINUX,
  darwin: Platform.MAC,
};

export enum SupportedHashes {
  SHA1 = "SHA1",
  SHA256 = "SHA256",
  MD5 = "MD5",
}

export interface IHashType {
  type: SupportedHashes;
  value: string;
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