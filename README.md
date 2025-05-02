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
Creates a video project using the json2video API. Each project can contain multiple scenes, and each scene can contain various elements such as text, images, video, audio, components, HTML, voice, audiogram, and subtitles. Video generation is asynchronous; use the returned project ID to check status. See https://json2video.com/docs/api/ for full schema and more examples.

**Input Schema:**
```json
{
  "id": "string (optional, unique identifier for the movie)",
  "comment": "string (optional, project description)",
  "cache": true,
  "client_data": {},
  "draft": true,
  "quality": "high", // one of: low, medium, high
  "resolution": "custom", // one of: sd, hd, full-hd, squared, instagram-story, instagram-feed, twitter-landscape, twitter-portrait, custom
  "width": 1920, // required if resolution is custom
  "height": 1080, // required if resolution is custom
  "variables": {},
  "elements": [ /* global elements, see below for examples */ ],
  "scenes": [
    {
      "id": "string (optional, unique scene id)",
      "comment": "string (optional)",
      "background_color": "#000000",
      "cache": true,
      "condition": "string (optional)",
      "duration": -1,
      "variables": {},
      "elements": [ /* see element examples below */ ]
    }
  ],
  "apiKey": "string (optional)"
}
```

**Element Types & Examples:**

- **Text Element:**
```json
{
  "type": "text",
  "text": "Hello world",
  "duration": 5,
  "settings": { "font-size": "60px", "color": "#FF0000" }
}
```
- **Image Element:**
```json
{
  "type": "image",
  "src": "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg",
  "width": 1620,
  "height": 1080,
  "x": 0,
  "y": 0
}
```
- **Video Element:**
```json
{
  "type": "video",
  "src": "https://example.com/path/to/my/video.mp4",
  "duration": 7.3
}
```
- **Component Element:**
```json
{
  "type": "component",
  "component": "basic/001",
  "settings": {
    "headline": { "text": "Lorem ipsum", "color": "white" },
    "body": { "text": "Dolor sit amet" }
  }
}
```
- **HTML Element:**
```json
{
  "type": "html",
  "html": "<h1>Hello world</h1>",
  "width": 800,
  "height": 600
}
```
- **Audio Element:**
```json
{
  "type": "audio",
  "src": "https://example.com/audio.mp3",
  "duration": 5
}
```
- **Voice Element:**
```json
{
  "type": "voice",
  "text": "This is a voiceover.",
  "voice": "en-US-Wavenet-D"
}
```
- **Audiogram Element:**
```json
{
  "type": "audiogram",
  "color": "#00FF00",
  "amplitude": 5
}
```
- **Subtitles Element:**
```json
{
  "type": "subtitles",
  "captions": "1\n00:00:00,000 --> 00:00:02,000\nHello world!"
}
```

**Example Input:**
```json
{
  "comment": "MyProject",
  "resolution": "full-hd",
  "scenes": [
    {
      "elements": [
        { "type": "video", "src": "https://example.com/path/to/my/video.mp4" },
        { "type": "text", "text": "Hello world", "duration": 5 },
        { "type": "image", "src": "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg", "width": 1620, "height": 1080, "x": 0, "y": 0 },
        { "type": "component", "component": "basic/001", "settings": { "headline": { "text": "Lorem ipsum" } } },
        { "type": "html", "html": "<h1>Hello world</h1>", "width": 800, "height": 600 },
        { "type": "audio", "src": "https://example.com/audio.mp3", "duration": 5 },
        { "type": "voice", "text": "This is a voiceover.", "voice": "en-US-Wavenet-D" },
        { "type": "audiogram", "color": "#00FF00", "amplitude": 5 },
        { "type": "subtitles", "captions": "1\n00:00:00,000 --> 00:00:02,000\nHello world!" }
      ]
    }
  ]
}
```

**Notes for Users:**
- Each element type has its own required and optional properties. See https://json2video.com/docs/api/ for full details.
- You can mix and match element types in scenes and globally.
- For custom resolutions, set both `width` and `height`.
- Use the returned project ID to check video status with `get_video_status`.

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

#### 3. Create Template (`create_template`)

Create a new template in json2video.

**Description:**
Creates a new template with a given name and optional description.

**Input Schema:**
```json
{
  "name": "string (required, name of the template)",
  "description": "string (optional, description of the template)",
  "apiKey": "string (optional)"
}
```

**Example Input:**
```json
{
  "name": "MyTemplate",
  "description": "A reusable video template."
}
```

**Output:**
- Returns the template ID if successful.

#### 4. Get Template (`get_template`)

Get template details from json2video.

**Description:**
Retrieves details of a template by its name.

**Input Schema:**
```json
{
  "name": "string (required, name of the template)",
  "apiKey": "string (optional)"
}
```

**Example Input:**
```json
{
  "name": "MyTemplate"
}
```

**Output:**
```json
{
    "updated_at": "YYYY-MM-DDTHH:MM:SSZ",
    "created_at": "YYYY-MM-DDTHH:MM:SSZ",
    "movie": "{\"id\":\"template1\",\"comment\":\"Example template\",\"resolution\":\"full-hd\",\"quality\":\"high\",\"scenes\":[{\"id\":\"scene1\",\"comment\":\"Scene 1\",\"elements\":[]}],\"elements\":[],\"width\":1920,\"height\":1080}",
    "name": "MyTemplate",
    "id": "MyTemplate_ID"
  }
```

#### 5. List Templates (`list_templates`)

List all available templates from json2video.

**Description:**
Lists all templates available to the user.

**Input Schema:**
```json
{
  "apiKey": "string (optional)"
}
```

**Example Input:**
```json
{
}
```

**Output:**
```json
[
  {
    "updated_at": "YYYY-MM-DDTHH:MM:SSZ",
    "created_at": "YYYY-MM-DDTHH:MM:SSZ",
    "movie": "{\"id\":\"template1\",\"comment\":\"Example template\",\"resolution\":\"full-hd\",\"quality\":\"high\",\"scenes\":[{\"id\":\"scene1\",\"comment\":\"Scene 1\",\"elements\":[]}],\"elements\":[],\"width\":1920,\"height\":1080}",
    "name": "MyTemplate1",
    "id": "TEMPLATE_ID_1"
  },
  {
    "updated_at": "YYYY-MM-DDTHH:MM:SSZ",
    "created_at": "YYYY-MM-DDTHH:MM:SSZ",
    "movie": "{\"id\":\"template2\",\"resolution\":\"instagram-story\",\"quality\":\"medium\",\"scenes\":[{\"id\":\"scene2\",\"comment\":\"Scene 2\",\"elements\":[]}],\"elements\":[],\"comment\":\"Another template\"}",
    "name": "MyTemplate2",
    "id": "TEMPLATE_ID_2"
  }
]
```