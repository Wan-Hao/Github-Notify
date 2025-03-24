import { LarkCrypto } from "../utils/lark-crypto.ts";
import { LARK_VERIFICATION_TOKEN } from "../config.ts";

interface VerificationRequest {
  type?: string;
  token?: string;
  challenge?: string;
  encrypt?: string;
}

/**
 * 处理飞书事件订阅的验证请求
 */
export async function handleVerification(
  body: VerificationRequest,
): Promise<Response | null> {
  const larkCrypto = new LarkCrypto();

  // 处理加密数据
  if (body.encrypt) {
    const decrypted = await larkCrypto.decrypt(body.encrypt);
    const decryptedBody = JSON.parse(decrypted);
    console.log("解密后的数据:", decryptedBody);

    // 验证 token
    if (decryptedBody.token !== LARK_VERIFICATION_TOKEN) {
      return new Response("Invalid token", { status: 401 });
    }

    return new Response(
      JSON.stringify({ challenge: decryptedBody.challenge }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  return null;
}
