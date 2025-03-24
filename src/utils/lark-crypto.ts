import { LARK_ENCRYPT_KEY } from "../config.ts";
import { encode as base64Encode } from "https://deno.land/std@0.192.0/encoding/base64.ts";

/**
 * 飞书事件订阅的加密/解密工具
 */
export class LarkCrypto {
  private key: Uint8Array;

  constructor() {
    this.key = new TextEncoder().encode(LARK_ENCRYPT_KEY);
  }

  /**
   * 解密飞书事件订阅的加密数据
   */
  async decrypt(encrypt: string): Promise<string> {
    const decoded = atob(encrypt);
    const buf = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      buf[i] = decoded.charCodeAt(i);
    }

    const decipher = await crypto.subtle.importKey(
      "raw",
      this.key,
      { name: "AES-CBC", length: 256 },
      true,
      ["decrypt"],
    );

    // 前16字节是IV
    const iv = buf.slice(0, 16);
    const data = buf.slice(16);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      decipher,
      data,
    );

    return new TextDecoder().decode(decrypted);
  }

  /**
   * 加密数据
   */
  async encrypt(text: string): Promise<string> {
    const data = new TextEncoder().encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(16));

    const cipher = await crypto.subtle.importKey(
      "raw",
      this.key,
      { name: "AES-CBC", length: 256 },
      true,
      ["encrypt"],
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      cipher,
      data,
    );

    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encrypted), iv.length);

    return base64Encode(result.buffer);
  }
}
