# json2video MCP Server

A Model Context Protocol (MCP) server implementation for programmatically generating videos using the [json2video](https://json2video.com) API. This server exposes powerful video generation and status-checking tools for use with LLMs, agents, or any MCP-compatible client.

---

## Features

- Generate videos with rich scene and element support (text, image, video, audio, components, subtitles, etc.)
- Asynchronous video rendering with status polling
- Flexible, extensible JSON schema for video projects
- Designed for easy integration with LLMs, automation agents, and MCP-compatible tools
- API key authentication (env or per-request)
- Comprehensive error handling and logging

---

## Installation

### Running with npx

```bash
env JSON2VIDEO_API_KEY=your_api_key_here npx -y json2video-mcp
```

### Manual Installation

```bash
npm install -g json2video-mcp
```

### Windows Users
If you are on Windows and encounter issues, try:
```bash
cmd /c "set JSON2VIDEO_API_KEY=your_api_key_here && npx -y json2video-mcp"
```

---

## Running on Cursor

### Cursor v0.45.6+
1. Open Cursor Settings
2. Go to Features > MCP Servers
3. Click "+ Add New MCP Server"
4. Enter the following:
   - Name: "json2video-mcp" (or your preferred name)
   - Type: "command"
   - Command: `env JSON2VIDEO_API_KEY=your_api_key_here npx -y json2video-mcp`

### Cursor v0.48.6+
1. Open Cursor Settings
2. Go to Features > MCP Servers
3. Click "+ Add new global MCP server"
4. Enter the following code:
   ```json
   {
     "mcpServers": {
       "json2video-mcp": {
         "command": "npx",
         "args": ["-y", "json2video-mcp"],
         "env": {
           "JSON2VIDEO_API_KEY": "your_api_key_here"
         }
       }
     }
   }
   ```

Replace `your_api_key_here` with your json2video API key. You can get an API key from [json2video.com](https://json2video.com).

After adding, refresh the MCP server list to see the new tools. Your agent or LLM will automatically use json2video MCP when appropriate, or you can explicitly request it by describing your video generation needs.

---

## MCP Integration Example

Add this to your `mcp.json` or similar config:

```json
{
  "mcpServers": {
    "json2video-mcp": {
      "command": "npx",
      "args": ["-y", "json2video-mcp"],
      "env": {
        "JSON2VIDEO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

- Replace `your_api_key_here` with your actual json2video API key.
- This configuration allows your agent or LLM to start and communicate with the json2video MCP server automatically.
- The server will expose the `generate_video` and `get_video_status` tools for use in your workflows.

---

## Configuration

### Environment Variables

- `JSON2VIDEO_API_KEY` (required): Your json2video API key. Can be set as an environment variable or provided per request.

---

## Usage

### Available Tools

#### 1. Generate Video (`generate_video`)

Create a customizable video project with scenes and elements.

**Description:**
Creates a customizable video project. Each project can contain multiple scenes, and each scene can contain various elements such as text, images, video, audio, components, and more. Video generation is asynchronous; use the returned project ID to check status.

**Input Schema:**
```json
{
  "id": "string (optional)",
  "comment": "string (optional)",
  "width": 1920,
  "height": 1080,
  "quality": "medium",
  "draft": false,
  "resolution": "custom",
  "fps": 25,
  "settings": {},
  "cache": true,
  "variables": {},
  "scenes": [
    {
      "id": "string (optional)",
      "comment": "string (optional)",
      "elements": [
        { "id": "string", "type": "text", "text": "Hello world", "duration": 5 },
        { "id": "string", "type": "image", "src": "https://...", "width": 1620, "height": 1080, "x": 0, "y": 0 },
        { "id": "string", "type": "voice" },
        { "id": "string", "type": "html" },
        { "id": "string", "type": "video" },
        { "id": "string", "type": "audiogram" },
        { "id": "string", "type": "component", "component": "basic/000", "settings": { /* ... */ } },
        { "id": "string", "type": "subtitles" }
      ]
    }
  ],
  "elements": [],
  "apiKey": "string (optional)"
}
```

**Example Input:**
```json
{
  "id": "q663vmm2",
  "comment": "Default movie",
  "width": 1920,
  "height": 1080,
  "quality": "medium",
  "draft": false,
  "scenes": [
    {
      "id": "qfynlmrz",
      "comment": "Scene 1",
      "elements": [
        { "id": "qppjjvl6", "type": "text", "text": "Hello world", "duration": 5 },
        { "id": "q9xyi2cs", "type": "image", "src": "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg", "width": 1620, "height": 1080, "x": 0, "y": 0 },
        { "id": "qvc2v927", "type": "voice" },
        { "id": "q7olcpnw", "type": "html" },
        { "id": "qmknt9fw", "type": "video" },
        { "id": "qyy10mux", "type": "audiogram" },
        { "id": "q0nj2s7l", "type": "component", "component": "basic/000", "settings": { "headline": { "text": "Lorem ipsum dolor sit amet", "color": "white", "font-family": "Baskervville", "font-weight": "400", "font-size": "6vw" }, "body": { "text": "Consectetur adipiscing elit", "color": "#CCCCCC", "font-family": "Lato", "font-weight": "300", "font-size": "3vw" }, "card": { "vertical-align": "center", "text-align": "center", "width": "80%", "horizontal-align": "center" } } },
        { "id": "qeyqfq5l", "type": "subtitles" }
      ]
    }
  ],
  "elements": [],
  "resolution": "custom",
  "fps": 25,
  "settings": {},
  "cache": true,
  "variables": {},
  "apiKey": "your_api_key_here"
}
```

**Output:**
- Returns a project ID to be used with `get_video_status`.

#### 2. Get Video Status (`get_video_status`)

Check the status or retrieve the result of a video generation job.

**Description:**
Retrieves the status or result of a previously started video generation job. Note: Video rendering is asynchronous and may take some time. If the status is not "done", please try again later using the same project ID.

**Input Schema:**
```json
{
  "project": "string (required)",
  "apiKey": "string (optional)"
}
```

**Example Input:**
```json
{
  "project": "q663vmm2"
}
```

**Example Output:**
```json
{
  "success": true,
  "movie": {
    "success": true,
    "status": "done",
    "message": "",
    "project": "q663vmm2",
    "url": "https://assets.json2video.com/clients/yourclient/renders/yourvideo.mp4",
    "created_at": "2025-04-27T10:44:18.880Z",
    "ended_at": "2025-04-27T10:44:28.589Z",
    "duration": 11,
    "size": 359630,
    "width": 640,
    "height": 360,
    "rendering_time": 10
  }
}
```