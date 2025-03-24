import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { LarkCrypto } from "./lark-crypto.ts";

Deno.test("LarkCrypto.decrypt - 测试解密功能", async () => {
  const encryptedData =
    "7hqaOupCTQ2v8NDq3xtruGM/EzE9CT3Gb7vIzziWx2DSlgJDNGOGoQmigEuKH4L84iPVSActtnUvj0d6r6cSmg+0pAEjUUC/+6RYEB6upkkCZMnQ9llf+Fb46X8RwznCFlOVJprzOZFZav1k1kOFGjSkn0JGInjpxp7c/0KQvkm8RcGwKPobwhNiG39bkRax";

  console.log("加密数据长度:", encryptedData.length);

  // Base64解码
  const decoded = atob(encryptedData);
  console.log("Base64解码后长度:", decoded.length);

  // 提取IV
  const iv = new Uint8Array(
    decoded.slice(0, 16).split("").map((c) => c.charCodeAt(0)),
  );
  console.log("IV (前16字节):", Array.from(iv));

  const larkCrypto = new LarkCrypto();
  const decrypted = await larkCrypto.decrypt(encryptedData);
  console.log("解密结果:", decrypted);

  // 解析 JSON 并验证结果
  const jsonData = JSON.parse(decrypted);
  console.log("解析后的 JSON 数据:", jsonData);

  // 验证解密后的数据结构
  assertEquals(jsonData.type, "url_verification");
  assertEquals(jsonData.token, "GJqrLHbeffESFwHuZ10cKfHqMVkjhaOy");
  assertEquals(
    typeof jsonData.challenge,
    "string",
    "challenge 应该是一个字符串",
  );
});
