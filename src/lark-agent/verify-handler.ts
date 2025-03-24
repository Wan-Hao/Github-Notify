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

    // 验证 token
    if (decryptedBody.token !== LARK_VERIFICATION_TOKEN) {
      return new Response("Invalid token", { status: 401 });
    }

    if (decryptedBody.type === "url_verification") {
      // 加密响应数据
      const response = { challenge: decryptedBody.challenge };
      const encrypted = await larkCrypto.encrypt(JSON.stringify(response));
      return new Response(
        JSON.stringify({ challenge: JSON.parse(encrypted).challenge }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
  }

  // 处理未加密数据
  if (body.type === "url_verification") {
    if (body.token !== LARK_VERIFICATION_TOKEN) {
      return new Response("Invalid token", { status: 401 });
    }

    return new Response(
      JSON.stringify({ challenge: body.challenge }),
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
