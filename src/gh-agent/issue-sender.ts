import { fetchMessagesByParentId } from "../lark-agent/agent.ts";
import { createIssue } from "../utils/gh-api.ts";
import { Issue } from "../types/gh-api.ts";

// Get configuration from environment variables
const OPENAI_API_ENDPOINT = Deno.env.get("OPENAI_API_ENDPOINT");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const USER_ID = Deno.env.get("USER_ID");

export async function handleIssueCreateRequest(
  parentId: string,
  message: string,
) {
  const descriptionMessages = await fetchMessagesByParentId(parentId);
  if (!descriptionMessages) {
    console.error("No description messages found for parentId:", parentId);
    return;
  }

  const prompt = generatePrompt(descriptionMessages as string[], message);

  const issue: Issue = await generateIssueWithAIFallback(prompt);

  const response = await createIssue(issue);
  console.log("Create Issue Response", response);
}

// fixme: need a new account for issue sender
function generatePrompt(descriptionMessages: string[], description: string) {
  return 'As an AI assistant, extract key information from user conversations and descriptions to create GitHub Issues in JSON format.\n\n- **Task Objective**: Parse user requirements from conversations to generate structured GitHub Issues.\n- **Information to Extract**:\n  - Owner\n  - Repo\n  - Title\n  - Body (with sections on issue classification, background, solution design, specific implementation, personnel allocation)\n\n- **Missing Information**: If any information is missing from the dialogue, omit it in the output. Input missing values as empty strings in the JSON.\n\n# Steps:\n1. Search relevant information from the given conversation and description.\n2. Identify what kind of issue it is. Specify the type of issue in the "title" field. Like "Bug: xxx", "Feature: xxx", "Task: xxx", etc.\n3. Try to find the repo and owner from the conversation. If not found, use the default value "babel-agent" and "Wan-Hao" as the repo and owner.\n4. For Title, summarize the issue in one sentence with the category we specified in step 2.\n5. For Body, try to write it from these perspectives:(If not found, just omit it)\n  - I need a not too long description of the issue.\n  - What background information mentioned in the conversation or description?\n  - What is the solution mentioned in the conversation or description?\n  - What is the implementation mentioned in the conversation or description?\n  - What is the personnel allocation mentioned in the conversation or description?\n  And remember to write it in markdown format. And keep the original meaning and structure of the description and conversation at the end of the body.\n  Do not add any information that is not mentioned in the conversation or description.\n\n# Output Format\n\nProvide the output in a simple JSON format:\n\n{\n  "owner": "[Owner]",\n  "repo": "[Repo]",\n  "title": "[Issue Title]",\n  "body": "## Description\\n[Details]"\n}\n\n# Examples\n\n- Given Input: (might a little bit different in format)\n  - Conversation: "We need a feature for better notifications."\n  - Description: "User1: Current notifications are not customizable."\n\n- Expected Output:\n\n{\n  "owner": "",\n  "repo": "",\n  "title": "Implement customizable notifications",\n  "body": "## Description\\n- **Classification**: New Feature\\n- **Background**: Current notifications lack customization.\\n- **Solution Design**: Allow users to tailor notifications.\\n- **Implementation**: Develop a settings panel.\\n"\n}\n\n\n# Notes\n\n- Clearly separate each section in the "body" field.\n- If any section\'s information is unavailable, do not invent details.\n- Ensure JSON is syntactically correct and straightforward for systems to consume.\n\n# Input:\n- Description: ' +
    description + "\n- Conversation: " + descriptionMessages.join("\\n");
}

async function generateIssueWithAIFallback(prompt: string) {
  try {
    const response = await callOpenAI(prompt);
    const issue = JSON.parse(response);
    if (!issue.owner || !issue.title || !issue.body) {
      throw new Error("AI response missing required fields");
    }
    issue.repo = issue.repo || "agent";
    return issue;
  } catch (error) {
    console.error("Response parse error, adjust the prompt", error);

    // Generate current timestamp
    const timestamp = new Date().toISOString();

    // Fallback: Create a default issue with the original conversation and timestamp
    return {
      owner: "Lark-Base-Team",
      repo: "agent",
      title: `Auto-created Issue (AI Processing Failed) - ${timestamp}`,
      body: `## Original Conversation\n\n${prompt}`,
    };
  }
}

async function callOpenAI(content: string) {
  try {
    const response = await fetch(OPENAI_API_ENDPOINT!, {
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
        temperature: 1,
        n: 1,
        user: USER_ID,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that helps parse user requirements and create GitHub Issues. Based on the user's description, extract key information and generate an Issue in JSON format, including owner, repo, title, and body fields.",
          },
          {
            role: "user",
            content: content,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const data = await response.json();
    if (
      !data.choices || data.choices.length === 0 || !data.choices[0].message
    ) {
      throw new Error("Unexpected API response format");
    }
    const reply = data.choices[0].message.content;
    console.log("OpenAI Reply", reply);
    return reply.replace(/^```json\n/, "").replace(/\n```$/, "");
  } catch (error) {
    console.error("Failed to call OpenAI API:", error);
    throw error;
  }
}
