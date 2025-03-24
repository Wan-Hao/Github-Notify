import { fetchMessagesByParentId } from "../lark-agent/agent.ts";
import { createIssue } from "../utils/gh-api.ts";
import { CreateIssueParameters } from "../types/gh-api.ts";
import { issueSchema } from "../schemas/issue-schema.ts";
import { format } from "npm:date-fns";
import { zhCN } from "npm:date-fns/locale";
import {
  FunctionRegistry,
  GPT3Tokenizer,
  Message,
  Prompt,
  PromptFunctions,
  PromptMemory,
  PromptSectionBase,
  RenderedPromptSection,
  SystemMessage,
  Tokenizer,
  UserMessage,
  VolatileMemory,
} from "npm:promptrix";

// Get configuration from environment variables
const OPENAI_API_ENDPOINT = Deno.env.get("OPENAI_API_ENDPOINT");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const USER_ID = Deno.env.get("USER_ID");
const apiPath = "/api/ai-proxy/openai/v1/chat/completions";
const MAX_RETRIES = 3;

class IssuePromptSection extends PromptSectionBase {
  private templateContent: string;
  private description: string;
  private conversation: string[];

  constructor(
    templateContent: string,
    description: string,
    conversation: string[],
  ) {
    super(-1);
    this.templateContent = templateContent;
    this.description = description;
    this.conversation = conversation;
  }

  renderAsMessages(
    _memory: PromptMemory,
    _functions: PromptFunctions,
    tokenizer: Tokenizer,
    _maxTokens: number,
  ): Promise<RenderedPromptSection<Message<string>[]>> {
    const content = this.templateContent
      .replace("{{{description}}}", this.description)
      .replace("{{{conversation}}}", this.conversation.join("\n"));

    return Promise.resolve({
      output: [{
        role: "user",
        content: content,
      }],
      length: tokenizer.encode(content).length,
      tooLong: false,
    });
  }
}

export async function handleIssueCreateRequest(
  parentId: string,
  description: string,
) {
  const conversation = await fetchMessagesByParentId(parentId);
  if (!conversation) {
    console.error("No conversation found for parentId:", parentId);
    return;
  }

  const issue: CreateIssueParameters = await generateIssueWithAIFallback(
    conversation as string[],
    description,
  );

  const response = await createIssue(issue);
  console.log("Create Issue Response", response);
}

export function generatePrompt(
  descriptionMessages: string[],
  description: string,
) {
  const templateContent = Deno.readTextFileSync(
    new URL("../prompts/issue-create.prompt.md", import.meta.url),
  );

  const prompt = new Prompt([
    new SystemMessage(
      "You are a helpful assistant that creates GitHub issues from conversations. You must respond with valid JSON format that matches the schema requirements.",
    ),
    new IssuePromptSection(templateContent, description, descriptionMessages),
    new UserMessage(
      "Please create a GitHub issue based on the above information.",
    ),
  ]);

  return prompt;
}

export function validateAndParseIssue(
  jsonString: string,
): CreateIssueParameters {
  try {
    const parsedData = JSON.parse(jsonString);
    const validatedData = issueSchema.parse(parsedData);
    return validatedData;
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON format: ${err.message}`);
    }
    if (err instanceof Error) {
      throw new Error(`Schema validation failed: ${err.message}`);
    }
    throw new Error(`Schema validation failed: ${String(err)}`);
  }
}

export async function generateIssueWithAIFallback(
  conversation: string[],
  description: string,
) {
  const memory = new VolatileMemory({});
  const functions = new FunctionRegistry();
  const tokenizer = new GPT3Tokenizer();
  const maxTokens = Number.MAX_SAFE_INTEGER;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const prompt = generatePrompt(conversation, description);
      const result = await prompt.renderAsMessages(
        memory,
        functions,
        tokenizer,
        maxTokens,
      );

      const messages = result.output.map((msg) => ({
        role: msg.role,
        content: msg.content || "",
      }));

      const response = await callOpenAI(messages);
      const issue = validateAndParseIssue(response);
      return issue;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt < MAX_RETRIES) {
        memory.set("lastError", error.message);
      }
    }
  }

  console.error("All retry attempts failed, using fallback");
  const timestamp = format(new Date(), "MM-dd", { locale: zhCN });
  return {
    owner: "babelcloud",
    repo: "babel-agent",
    title: `Auto-created Issue (AI Processing Failed) - ${timestamp}`,
    body: `## Description\n${description}\n\n## Conversation\n${
      conversation.join("\n")
    }`,
  };
}

export async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
) {
  const aiProxyUrl = OPENAI_API_ENDPOINT! + apiPath;
  const response = await fetch(aiProxyUrl, {
    method: "POST",
    headers: {
      "User-Agent": "OpenAI/JS 4.82.0",
      "Accept": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "X-Usage-Meta": JSON.stringify({
        accountId: USER_ID,
        key: `usage:agent:${USER_ID}`,
        type: "AgentToken",
      }),
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.2,
      n: 1,
      user: USER_ID,
      stream: false,
      messages: messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API request failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
    throw new Error("Unexpected API response format");
  }

  const reply = data.choices[0].message.content;
  console.log("OpenAI Reply", reply);
  return reply.replace(/^```json\n/, "").replace(/\n```$/, "");
}
