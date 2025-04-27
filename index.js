#!/usr/bin/env node

const readline = require('readline');
const fetch = require('node-fetch');

// MCP mesajlarını stdin/stdout üzerinden okuyup yazmak için readline kullanıyoruz
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// MCP mesajlarını işleyen fonksiyon
async function handleMCPMessage(message, apiKey) {
  const { action, data } = message;

  if (!apiKey) {
    return { error: "apiKey is required" };
  }

  if (action === "generate") {
    // Video oluştur
    const response = await fetch('https://api.json2video.com/v2/movies', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    return result;
  } else if (action === "get") {
    // Video bilgisini getir
    if (!data || !data.project) {
      return { error: "project id is required in data.project" };
    }
    const url = `https://api.json2video.com/v2/movies?project=${data.project}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey
      }
    });
    const result = await response.json();
    return result;
  } else {
    return { error: "Unknown action. Use 'generate' or 'get'." };
  }
}

// Her satırda bir MCP mesajı bekliyoruz
rl.on('line', async (line) => {
  try {
    const message = JSON.parse(line);
    const apiKey = process.env.JSON2VIDEO_API_KEY || message.apiKey;
    const response = await handleMCPMessage(message, apiKey);
    // Sonucu MCP formatında stdout'a yaz
    process.stdout.write(JSON.stringify(response) + '\n');
  } catch (err) {
    process.stderr.write(JSON.stringify({ error: err.message }) + '\n');
  }
}); 