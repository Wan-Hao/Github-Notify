import { LARK_ENCRYPT_KEY } from "../config.ts";
import { encode as base64Encode } from "https://deno.land/std@0.192.0/encoding/base64.ts";

/**
 * 飞书事件订阅的加密/解密工具
 */
export class LarkCrypto {
  private key: Promise<Uint8Array>;

  constructor() {
    // 使用 SHA256 对 Encrypt Key 进行哈希处理
    const encoder = new TextEncoder();
    const keyData = encoder.encode(LARK_ENCRYPT_KEY);
    this.key = crypto.subtle.digest("SHA-256", keyData).then((buffer) =>
      new Uint8Array(buffer)
    );
  }

  /**
   * 解密飞书事件订阅的加密数据
   */
  async decrypt(encrypt: string): Promise<string> {
    try {
      // 1. Base64 解码
      const decoded = atob(encrypt);
      const buf = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) {
        buf[i] = decoded.charCodeAt(i);
      }

      // 2. 获取 IV 和加密数据
      const iv = buf.slice(0, 16);
      const data = buf.slice(16);

      // 3. 导入密钥
      const key = await crypto.subtle.importKey(
        "raw",
        await this.key,
        { name: "AES-CBC", length: 256 },
        false,
        ["decrypt"],
      );

      // 4. 解密
      const decrypted = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        key,
        data,
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error("解密失败:", error);
      throw error;
    }
  }

  /**
   * 加密数据
   */
  async encrypt(text: string): Promise<string> {
    try {
      // 1. 文本转字节
      const data = new TextEncoder().encode(text);

      // 2. 生成随机 IV
      const iv = crypto.getRandomValues(new Uint8Array(16));

      // 3. 导入密钥
      const key = await crypto.subtle.importKey(
        "raw",
        await this.key,
        { name: "AES-CBC", length: 256 },
        false,
        ["encrypt"],
      );

      // 4. 加密
      const encrypted = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        key,
        data,
      );

      // 5. 组合 IV 和加密数据
      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encrypted), iv.length);

      // 6. Base64 编码
      return base64Encode(result.buffer);
    } catch (error) {
      console.error("加密失败:", error);
      throw error;
    }
  }
}
