#!/usr/bin/env node

const readline = require('readline');
const fetch = require('node-fetch');

// MCP mesajlarını stdin/stdout üzerinden okuyup yazmak için readline kullanıyoruz
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Sunucu başlatılırken serverInfo mesajı gönder
process.stdout.write(JSON.stringify({
  jsonrpc: "2.0",
  method: "serverInfo",
  params: {
    protocolVersion: "2.0",
    capabilities: {},
    serverInfo: {
      name: "json2video-mcp",
      version: "1.0.0"
    }
  }
}) + '\n');

// MCP mesajlarını işleyen fonksiyon
async function handleMCPMessage(message, apiKey) {
  const { method, params } = message;

  if (!apiKey) {
    throw new Error("apiKey is required");
  }

  if (method === "generate") {
    // Video oluştur
    const response = await fetch('https://api.json2video.com/v2/movies', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    const result = await response.json();
    return result;
  } else if (method === "get") {
    // Video bilgisini getir
    if (!params || !params.project) {
      throw new Error("project id is required in params.project");
    }
    const url = `https://api.json2video.com/v2/movies?project=${params.project}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey
      }
    });
    const result = await response.json();
    return result;
  } else {
    throw new Error("Unknown method. Use 'generate' or 'get'.");
  }
}

// Her satırda bir MCP mesajı bekliyoruz
rl.on('line', async (line) => {
  let message, id;
  try {
    message = JSON.parse(line);
    id = message.id;
    const apiKey = process.env.JSON2VIDEO_API_KEY || message.apiKey;
    const result = await handleMCPMessage(message, apiKey);

    // JSON-RPC 2.0 cevabı
    process.stdout.write(JSON.stringify({
      jsonrpc: "2.0",
      id,
      result
    }) + '\n');
  } catch (err) {
    process.stdout.write(JSON.stringify({
      jsonrpc: "2.0",
      id,
      error: { code: -32000, message: err.message }
    }) + '\n');
  }
}); 