const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
};

const modelMap = {
  "Chat GPT": process.env.OPENAI_MODEL || "gpt-5.2",
};

const shouldUseMock = process.env.LOCAL_MOCK === "true" || !process.env.OPENAI_API_KEY;

const readJsonBody = async (request) => {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
};

const extractResponseText = (payload) => {
  if (payload.output_text) {
    return payload.output_text;
  }

  return (payload.output || [])
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join("")
    .trim();
};

const sendJson = (response, status, data) => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
};

const createMockAnswer = (messages, model) => {
  const lastMessage = [...messages].reverse().find((message) => message.role === "user");
  const query = String(lastMessage?.content || "").trim();
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("сайт") || lowerQuery.includes("дизайн")) {
    return `${model} · тестовый режим\n\nЯ бы предложил двигаться так: сначала закрепить главный сценарий, потом настроить визуальные состояния, а после этого подключать реальные модели. Сейчас это mock-ответ, но интерфейс уже ведет себя как разговорный чат.`;
  }

  if (lowerQuery.includes("привет") || lowerQuery.includes("здравств")) {
    return `${model} · тестовый режим\n\nПривет. Я локальный тестовый ассистент для проверки чата без API. Можешь писать вопросы, отправлять через Enter и смотреть, как будет выглядеть диалог.`;
  }

  return `${model} · тестовый режим\n\nЯ получил запрос: «${query}».\n\nПока это локальный mock-ответ без подключения к API. Он нужен, чтобы проверить механику чата, анимацию, расположение сообщений и общий UX.`;
};

const handleChat = async (request, response) => {
  const body = await readJsonBody(request);
  const selectedModel = body.model || "Chat GPT";
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (shouldUseMock) {
    sendJson(response, 200, { text: createMockAnswer(messages, selectedModel), mock: true });
    return;
  }

  const apiModel = modelMap[selectedModel];

  if (!apiModel) {
    sendJson(response, 400, {
      error: `${selectedModel} пока не подключен. Сейчас API-ответы настроены для Chat GPT.`,
    });
    return;
  }

  const input = [
    {
      role: "system",
      content: "Ты дружелюбный разговорный AI-ассистент. Отвечай на русском языке, если пользователь не просит иначе.",
    },
    ...messages.map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: String(message.content || ""),
    })),
  ];

  const apiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: apiModel,
      input,
    }),
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    sendJson(response, apiResponse.status, {
      error: data.error?.message || "OpenAI API вернул ошибку.",
    });
    return;
  }

  sendJson(response, 200, { text: extractResponseText(data) });
};

const handleStatic = async (request, response) => {
  const url = new URL(request.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.resolve(ROOT, pathname.replace(/^\/+/, ""));

  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    response.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream" });
    response.end(file);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "POST" && request.url === "/api/chat") {
      await handleChat(request, response);
      return;
    }

    await handleStatic(request, response);
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Внутренняя ошибка сервера." });
  }
});

server.listen(PORT, () => {
  console.log(`NeuroHAB is running at http://localhost:${PORT}`);
  if (shouldUseMock) {
    console.log("LOCAL_MOCK mode is active. Set OPENAI_API_KEY to use OpenAI API.");
  }
});
