declare module "node:fs/promises" {
  export function readFile(path: string, encoding: "utf8"): Promise<string>;
  export function writeFile(path: string, data: string): Promise<void>;
  export function mkdir(path: string, options: { recursive: boolean }): Promise<string | undefined>;
}
declare module "node:path" { export function dirname(path: string): string; }
declare module "node:crypto" {
  type Bytes = Uint8Array | string;
  export function createHmac(algorithm: string, key: string): { update(data: Bytes): { digest(encoding: "hex"): string } };
  export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean;
}
declare const Buffer: {
  from(data: string | Uint8Array, encoding?: string): Uint8Array & { toString(encoding?: string): string };
};
