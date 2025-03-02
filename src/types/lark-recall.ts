import { LarkCardParam } from "./lark-card.ts";

export interface CallbackPayload {
  schema: "2.0";
  header: Header;
  event: EventDetail;
}

interface Header {
  event_id: string;
  token: string;
  create_time: string;
  event_type: "card.action.trigger";
  tenant_key: string;
  app_id: string;
}

interface EventDetail {
  operator: Operator;
  token: string;
  action: Action;
  host: string;
  delivery_type: "url_preview";
  context: Context;
}

interface Operator {
  tenant_key: string;
  user_id: string;
  open_id: string;
  union_id: string;
}

interface Action {
  value: Value;
  tag: string;
  timezone: string;
  form_value: Record<string, string | string[]>;
  name: string;
}

interface Context {
  url: string;
  preview_token: string;
  open_message_id: string;
  open_chat_id: string;
}

interface Value {
  prRepo: string;
  cardParam: LarkCardParam;
  actionRequest: string;
}
