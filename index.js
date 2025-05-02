#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

const API_BASE = 'https://api.json2video.com/v2';

class Json2VideoServer {
  constructor() {
    console.error('[Setup] Initializing json2video MCP server...');

    this.server = new Server(
      {
        name: 'json2video-mcp',
        version: '1.2.3',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    this.server.onerror = (error) => console.error('[Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'generate_video',
          description: 'Creates a video project using the json2video API. Each project can contain multiple scenes, and each scene can contain various elements such as text, images, video, audio, components, HTML, voice, audiogram, and subtitles. See https://json2video.com/docs/api/ for full schema.',
          inputSchema: {
            type: 'object',
            description: 'Input for creating a video project. The main content is in the "scenes" array. See https://json2video.com/docs/api/ for full schema and examples.',
            properties: {
              id: {
                type: "string",
                description: "Unique identifier for the movie project. If not provided, a random string will be generated."
              },
              comment: {
                type: "string",
                description: "A comment or description for the movie project."
              },
              cache: {
                type: "boolean",
                description: "Use the cached version of the movie if available. Default: true."
              },
              client_data: {
                type: "object",
                description: "Key-value pairs included in the response and webhooks. Used to pass information to later workflow steps."
              },
              draft: {
                type: "boolean",
                description: "If true, adds a watermark to the movie. Free plans must set draft to true."
              },
              quality: {
                type: "string",
                description: "Quality of the final rendered movie. Use for speed/quality tradeoff.",
                enum: ["low", "medium", "high"],
                default: "high"
              },
              resolution: {
                type: "string",
                description: "Preset resolution. Use \"custom\" to set width/height manually.",
                enum: [
                  "sd",
                  "hd",
                  "full-hd",
                  "squared",
                  "instagram-story",
                  "instagram-feed",
                  "twitter-landscape",
                  "twitter-portrait",
                  "custom"
                ],
                default: "custom"
              },
              width: {
                type: "integer",
                description: "Width of the movie (pixels). Only if resolution is \"custom\". Min: 50, Max: 3840."
              },
              height: {
                type: "integer",
                description: "Height of the movie (pixels). Only if resolution is \"custom\". Min: 50, Max: 3840."
              },
              variables: {
                type: "object",
                description: "Global variables for use in templates/components. Variable names: letters, numbers, underscores."
              },
              elements: {
                type: "array",
                description: "Global elements not tied to a specific scene. Each element can be of type video, image, text, html, component, audio, voice, audiogram, subtitles.",
                items: {
                  type: "object",
                  description: "Element object. See element schemas below."
                }
              },
              scenes: {
                type: "array",
                description: "List of scenes in the video. Each scene contains an array of elements.",
                items: {
                  type: "object",
                  description: "Scene object.",
                  properties: {
                    id: {
                      type: "string",
                      description: "Unique identifier for the scene."
                    },
                    comment: {
                      type: "string",
                      description: "Description or comment for the scene."
                    },
                    background_color: {
                      type: "string",
                      description: "Hex color or \"transparent\". Default: #000000."
                    },
                    cache: {
                      type: "boolean",
                      description: "Use cached version of the scene if available."
                    },
                    condition: {
                      type: "string",
                      description: "Condition for rendering the scene. If false/empty, scene is skipped."
                    },
                    duration: {
                      type: "number",
                      description: "Scene duration in seconds. -1 means auto."
                    },
                    variables: {
                      type: "object",
                      description: "Local variables for the scene."
                    },
                    elements: {
                      type: "array",
                      description: "List of elements in the scene. Each element can be of type video, image, text, html, component, audio, voice, audiogram, subtitles.",
                      items: {
                        type: "object",
                        description: "Element object. See element schemas below."
                      }
                    }
                  },
                  required: ["elements"]
                }
              },
              apiKey: {
                type: "string",
                description: "json2video API key (optional, can also be set as environment variable JSON2VIDEO_API_KEY)"
              }
            },
            required: ['scenes'],
            examples: [
              {
                "id": "qkpl87ib",
                "resolution": "full-hd",
                "quality": "high",
                "draft": true,
                "scenes": [
                  {
                    "id": "q5a983ps",
                    "elements": [
                      {
                        "id": "qhdvetdr",
                        "type": "video",
                        "src": "https://assets.json2video.com/assets/videos/beach-01.mp4"
                      },
                      {
                        "id": "q1crwyqh",
                        "type": "text",
                        "style": "002",
                        "text": "\"Lorem ipsum\" has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book",
                        "settings": {
                          "color": "#FFFFFF",
                          "font-size": "60px",
                          "font-family": "Roboto Condensed",
                          "shadow": 2,
                          "text-align": "left",
                          "vertical-align": "top"
                        },
                        "width": 960,
                        "x": 900,
                        "y": 50
                      }
                    ]
                  }
                ],
                "elements": []
              },
              {
                "id": "qa3drs0f",
                "resolution": "full-hd",
                "quality": "high",
                "draft": false,
                "scenes": [
                  {
                    "id": "q01xzym6",
                    "elements": [
                      {
                        "id": "qirtrtst",
                        "type": "video",
                        "src": "https://assets.json2video.com/assets/videos/new-york-01.mp4"
                      },
                      {
                        "id": "q5brvuj5",
                        "type": "component",
                        "component": "basic/050",
                        "settings": {
                          "card": {
                            "vertical-align": "bottom"
                          },
                          "headline": {
                            "text": "Broadway will allow theatergoers to go mask optional in July",
                            "font-size": "auto"
                          },
                          "lead": {
                            "text": "Proof of vaccination is no longer required for patrons of the city's indoor dining, fitness and entertainment venues.",
                            "font-size": "auto"
                          }
                        },
                        "start": 3
                      }
                    ]
                  }
                ],
                "elements": []
              },
              {
                "id": "qbtz6n8u",
                "comment": "Variables promo",
                "width": 1080,
                "height": 1080,
                "quality": "high",
                "draft": false,
                "variables": {
                  "slide1Text": "VARIABLES<br>ARE<br>FINALLY<br>HERE",
                  "slide1Voice": "Variables are finally here!",
                  "slide2Text": "Now you can use variables in your video templates",
                  "slide3Text": "Meaning you can reuse the templates easily",
                  "slide4Text": "Define a variable in your JSON and use it like a macro",
                  "slide5Text": "Integrate with no-code tools much faster"
                },
                "scenes": [
                  {
                    "id": "qvxfu314",
                    "comment": "Scene 1",
                    "elements": [
                      {
                        "id": "qq97y59z",
                        "type": "component",
                        "component": "shape/rectangle",
                        "settings": {
                          "rectangle1": {
                            "left": "0%",
                            "top": "0%",
                            "width": "100%",
                            "height": "100%",
                            "animate": {},
                            "background": "linear-gradient(120deg, #FF2B2B 0%, #0039CB 100%)"
                          }
                        },
                        "comment": "Background",
                        "duration": 3,
                        "fade-out": 0.5
                      },
                      {
                        "id": "q46k3sdw",
                        "type": "component",
                        "component": "advanced/001",
                        "settings": {
                          "animation": {
                            "font-family": "Anton",
                            "font-size": "9vw",
                            "text": "{{slide1Text}}"
                          }
                        },
                        "fade-out": 0.5,
                        "duration": 3,
                        "comment": "Variables are here"
                      },
                      {
                        "id": "q6mp3c8f",
                        "type": "component",
                        "component": "shape/rectangle",
                        "settings": {
                          "rectangle1": {
                            "left": "90%",
                            "top": "100%",
                            "width": "30vw",
                            "height": "30vw",
                            "animate": {
                              "duration": "1500",
                              "easing": "easeOutCubic",
                              "left": "37%",
                              "rotate": "0deg",
                              "top": "25%"
                            },
                            "background-size": "200px",
                            "background-image": "url('https://json2video.com/tools/visual-editor/images/logo.svg')",
                            "background-position": "center",
                            "border-width": "1vw 1vw 4vw 1vw",
                            "border-color": "white",
                            "border-radius": "0.5vw",
                            "rotate": "30deg",
                            "background-repeat": "no-repeat"
                          }
                        },
                        "comment": "Logo",
                        "start": 3
                      },
                      {
                        "id": "qmzx9eov",
                        "type": "component",
                        "component": "advanced/001",
                        "settings": {
                          "animation": {
                            "text": "JSON2Video.com",
                            "font-family": "Lato",
                            "font-size": "9vw",
                            "font-weight": "300"
                          }
                        },
                        "comment": "JSON2Video",
                        "start": 4,
                        "position": "custom",
                        "y": 70
                      },
                      {
                        "id": "q9uxmozl",
                        "type": "voice",
                        "voice": "en-US-TonyNeural",
                        "comment": "Voice",
                        "start": 1,
                        "text": "{{slide1Voice}}"
                      }
                    ]
                  },
                  {
                    "id": "qqq0oqp3",
                    "comment": "Scene 2",
                    "elements": [
                      {
                        "id": "qx323woj",
                        "type": "text",
                        "style": "003",
                        "settings": {
                          "font-size": "9vw",
                          "font-family": "Lato",
                          "font-weight": "300"
                        },
                        "position": "center-center",
                        "width": 850,
                        "text": "{{slide2Text}}"
                      },
                      {
                        "id": "qu3oiy7k",
                        "type": "voice",
                        "voice": "en-US-TonyNeural",
                        "text": "{{slide2Text}}"
                      },
                      {
                        "id": "q2190mbk",
                        "type": "audiogram",
                        "x": 0,
                        "y": 780,
                        "width": 1079,
                        "height": 154,
                        "position": "custom",
                        "color": "#2ea4ff",
                        "amplitude": 10
                      }
                    ]
                  },
                  {
                    "id": "q9kwg64c",
                    "comment": "Scene 3",
                    "elements": [
                      {
                        "id": "qjl6jk9t",
                        "type": "text",
                        "style": "003",
                        "settings": {
                          "font-size": "9vw",
                          "font-family": "Lato",
                          "font-weight": "300"
                        },
                        "position": "center-center",
                        "width": 850,
                        "text": "{{slide3Text}}"
                      },
                      {
                        "id": "q9gdsggk",
                        "type": "voice",
                        "voice": "en-US-TonyNeural",
                        "text": "{{slide3Text}}"
                      },
                      {
                        "id": "qjvv6gen",
                        "type": "audiogram",
                        "x": 0,
                        "y": 780,
                        "width": 1079,
                        "height": 154,
                        "position": "custom",
                        "color": "#2ea4ff",
                        "amplitude": 10
                      }
                    ]
                  },
                  {
                    "id": "q74bbs5t",
                    "comment": "Scene 4",
                    "elements": [
                      {
                        "id": "qwqkm1g5",
                        "type": "text",
                        "style": "003",
                        "settings": {
                          "font-size": "9vw",
                          "font-family": "Lato",
                          "font-weight": "300"
                        },
                        "position": "center-center",
                        "width": 850,
                        "text": "{{slide4Text}}"
                      },
                      {
                        "id": "qk98h02r",
                        "type": "voice",
                        "voice": "en-US-TonyNeural",
                        "text": "{{slide4Text}}"
                      },
                      {
                        "id": "q8ep4wxt",
                        "type": "audiogram",
                        "x": 0,
                        "y": 780,
                        "width": 1079,
                        "height": 154,
                        "position": "custom",
                        "color": "#2ea4ff",
                        "amplitude": 10
                      }
                    ]
                  },
                  {
                    "id": "qoubzoyr",
                    "comment": "Scene 5",
                    "elements": [
                      {
                        "id": "qrfqqv9n",
                        "type": "text",
                        "style": "003",
                        "settings": {
                          "font-size": "9vw",
                          "font-family": "Lato",
                          "font-weight": "300"
                        },
                        "position": "center-center",
                        "width": 850,
                        "text": "{{slide5Text}}"
                      },
                      {
                        "id": "q2awknue",
                        "type": "voice",
                        "voice": "en-US-TonyNeural",
                        "text": "{{slide5Text}}"
                      },
                      {
                        "id": "qq4j9hnc",
                        "type": "audiogram",
                        "x": 0,
                        "y": 780,
                        "width": 1079,
                        "height": 154,
                        "position": "custom",
                        "color": "#2ea4ff",
                        "amplitude": 10
                      }
                    ]
                  },
                  {
                    "id": "qhftsqq9",
                    "comment": "New scene",
                    "elements": [
                      {
                        "id": "qjbqqjh2",
                        "type": "component",
                        "component": "advanced/001",
                        "settings": {
                          "animation": {
                            "text": "TEST IT NOW",
                            "font-family": "Anton",
                            "font-size": "18vw"
                          }
                        },
                        "comment": "Test it now",
                        "x": 0,
                        "y": 0,
                        "width": 1079,
                        "height": 862
                      },
                      {
                        "id": "qiufzggo",
                        "type": "voice",
                        "text": "Test it NOW!",
                        "voice": "en-US-TonyNeural"
                      },
                      {
                        "id": "quufd72a",
                        "type": "component",
                        "component": "advanced/050",
                        "settings": {
                          "button": {
                            "background": "#2ea4ff",
                            "padding": "0 15vw",
                            "box-shadow": "2vw 2vw 0 white",
                            "text": "SIGN UP!",
                            "font-size": "10vw",
                            "font-family": "Anton"
                          }
                        },
                        "comment": "Button",
                        "x": 0,
                        "y": 346,
                        "width": 1079,
                        "height": 733,
                        "extra-time": 3,
                        "start": 1.5
                      }
                    ],
                    "duration": 5
                  }
                ],
                "elements": [
                  {
                    "id": "qccnxlyf",
                    "type": "audio",
                    "src": "https://json2video-test.s3.amazonaws.com/assets/audios/advertime.mp3",
                    "fade-out": 1,
                    "duration": -2,
                    "volume": 0.2
                  }
                ],
                "resolution": "squared"
              },
              {
                "id": "qqzav2ec",
                "comment": "Default movie",
                "width": 1080,
                "height": 1920,
                "quality": "medium",
                "draft": false,
                "scenes": [
                  {
                    "id": "q6adc7ac",
                    "comment": "Scene 1",
                    "elements": [
                      {
                        "id": "qs6yd9by",
                        "type": "image",
                        "src": "https://assets.json2video.com/assets/images/licoln.jpg",
                        "scale": {
                          "width": 2942,
                          "height": 1920
                        },
                        "x": 0,
                        "y": 0,
                        "position": "center-center",
                        "zoom": 5
                      },
                      {
                        "id": "q6kbimx5",
                        "type": "component",
                        "component": "basic/000",
                        "settings": {
                          "headline": {
                            "text": [
                              "You cannot escape the responsibility of tomorrow by evading it today"
                            ],
                            "color": "white",
                            "font-family": "EB Garamond",
                            "text-align": "center",
                            "font-size": "8vw",
                            "padding": "3vw 0"
                          },
                          "body": {
                            "color": "white",
                            "text": [
                              "Abraham Lincoln"
                            ],
                            "text-align": "center",
                            "font-family": "EB Garamond",
                            "font-size": "5vw"
                          },
                          "card": {
                            "vertical-align": "bottom",
                            "margin": "5vw",
                            "background-color": "rgba(0,0,0,0.5)",
                            "border-radius": "2vw"
                          }
                        },
                        "width": 1080,
                        "height": 1800,
                        "x": 0,
                        "y": 0,
                        "duration": 10,
                        "comment": "Simple card",
                        "position": "custom"
                      }
                    ]
                  }
                ],
                "elements": [],
                "resolution": "instagram-story",
                "fps": 25,
                "settings": {},
                "cache": true
              },
              {
                "id": "q83gk40w",
                "comment": "Black Friday",
                "width": 1080,
                "height": 1080,
                "quality": "medium",
                "draft": false,
                "scenes": [
                  {
                    "id": "qrjouu9h",
                    "comment": "Scene 1",
                    "elements": [
                      {
                        "id": "qwlgqqqx",
                        "type": "video",
                        "src": "https://player.vimeo.com/external/479469875.hd.mp4?s=ade6ed9349f626b39a364316db661a0cbfcc5f7a&profile_id=174&oauth2_token_id=57447761",
                        "scale": {
                          "width": 1920,
                          "height": 1080
                        },
                        "x": 0,
                        "y": 0
                      },
                      {
                        "id": "qdlq2snu",
                        "type": "component",
                        "component": "advanced/001",
                        "settings": {
                          "animation": {
                            "text": [
                              "BLACK FRIDAY"
                            ],
                            "font-family": "Anton",
                            "font-size": "15vw",
                            "text-shadow": "10px 10px 5px rgba(0,0,0,0.5)"
                          }
                        },
                        "duration": 7,
                        "comment": "Text"
                      },
                      {
                        "id": "qac55822",
                        "type": "component",
                        "comment": "Animated button",
                        "component": "advanced/050",
                        "settings": {
                          "button": {
                            "text": [
                              "30% OFF"
                            ],
                            "background": "red",
                            "font-size": "10vw",
                            "padding": "0.5vw 5vw",
                            "border-radius": "3vw",
                            "border": "1vw solid",
                            "border-color": "rgba(200,0,0,0.5)",
                            "font-family": "Montserrat"
                          }
                        },
                        "position": "custom",
                        "y": 300,
                        "start": 2.5
                      }
                    ],
                    "duration": 5
                  }
                ],
                "elements": [],
                "resolution": "squared",
                "fps": 25,
                "settings": {},
                "cache": true
              },{
                "id": "qd56dylt",
                "comment": "Default movie",
                "width": 1080,
                "height": 1920,
                "quality": "medium",
                "draft": false,
                "scenes": [
                  {
                    "id": "q952qhwi",
                    "comment": "Scene 1",
                    "elements": [
                      {
                        "id": "q2nwos8c",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-01.jpeg",
                        "scale": {
                          "width": 1920,
                          "height": 1080
                        },
                        "x": -520,
                        "y": 130
                      },
                      {
                        "id": "qmxazrdn",
                        "type": "text",
                        "text": "STAY AT YOUR<br>DREAM HOUSE",
                        "duration": 5,
                        "x": 0,
                        "y": 1154,
                        "width": 1079,
                        "height": 765,
                        "style": "009",
                        "settings": {
                          "font-family": "Anton",
                          "font-size": "16vw",
                          "line-height": "12vw"
                        }
                      }
                    ],
                    "background-color": "#0296C8"
                  },
                  {
                    "id": "qv0m3977",
                    "comment": "Scene 2",
                    "elements": [
                      {
                        "id": "q8hpdfv4",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-06.jpeg",
                        "scale": {
                          "width": 1920,
                          "height": 1080
                        },
                        "x": -3,
                        "y": -1,
                        "pan": "right"
                      },
                      {
                        "id": "q27tp8ba",
                        "type": "component",
                        "component": "basic/000",
                        "settings": {
                          "headline": {
                            "text": [
                              "Treat yourself<br>this summer"
                            ],
                            "color": "black",
                            "font-size": "16vw",
                            "font-family": "Anton",
                            "font-weight": "400",
                            "text-align": "center",
                            "line-height": "16vw"
                          },
                          "body": {
                            "text": [
                              "&nbsp;",
                              "Port Angeles, WA"
                            ],
                            "color": "#333",
                            "text-align": "center",
                            "font-size": "6vw"
                          }
                        },
                        "width": 878,
                        "height": 644,
                        "x": 113,
                        "y": 1224,
                        "duration": 10,
                        "comment": "Simple card"
                      }
                    ],
                    "background-color": "#F2F2F2",
                    "duration": 8,
                    "transition": {
                      "style": "circleopen",
                      "duration": 1
                    }
                  },
                  {
                    "id": "qo8cbtss",
                    "comment": "New scene",
                    "elements": [
                      {
                        "id": "qi9ij5ud",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-02.jpeg",
                        "scale": {
                          "width": 2880,
                          "height": 1920
                        },
                        "x": 0,
                        "y": 0,
                        "pan": "right"
                      },
                      {
                        "id": "q8xm6o3k",
                        "type": "component",
                        "component": "basic/052",
                        "settings": {
                          "headline": {
                            "text": [
                              "Over the lake"
                            ],
                            "font-size": "80px"
                          },
                          "section": {
                            "text": [
                              ""
                            ]
                          }
                        },
                        "cache": false,
                        "comment": "Over the lake"
                      }
                    ],
                    "duration": 6,
                    "transition": {
                      "style": "circleopen",
                      "duration": 1
                    }
                  },
                  {
                    "id": "qgxvwwgg",
                    "comment": "New scene",
                    "elements": [
                      {
                        "id": "qxu1yohy",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-03.jpeg",
                        "scale": {
                          "width": 2880,
                          "height": 1920
                        },
                        "x": -725,
                        "y": -4,
                        "pan": "right"
                      },
                      {
                        "id": "qoy0q7se",
                        "type": "component",
                        "component": "basic/052",
                        "settings": {
                          "headline": {
                            "text": [
                              "Living room with views"
                            ],
                            "font-size": "80px"
                          },
                          "section": {
                            "text": [
                              ""
                            ]
                          }
                        },
                        "cache": false,
                        "comment": "Living room with views"
                      }
                    ],
                    "duration": 6,
                    "transition": {
                      "style": "circleopen",
                      "duration": 1
                    }
                  },
                  {
                    "id": "qieg0it2",
                    "comment": "New scene",
                    "elements": [
                      {
                        "id": "q2aj241d",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-04.jpeg",
                        "scale": {
                          "width": 2880,
                          "height": 1920
                        },
                        "x": -725,
                        "y": -4,
                        "pan": "right"
                      },
                      {
                        "id": "qj744bnw",
                        "type": "component",
                        "component": "basic/052",
                        "settings": {
                          "headline": {
                            "text": [
                              "Kitchen"
                            ],
                            "font-size": "80px"
                          },
                          "section": {
                            "text": [
                              ""
                            ]
                          }
                        },
                        "cache": false,
                        "comment": "Kitchen"
                      }
                    ],
                    "duration": 6,
                    "transition": {
                      "style": "circleopen",
                      "duration": 1
                    }
                  },
                  {
                    "id": "qxp6uo5m",
                    "comment": "Scene 1",
                    "elements": [
                      {
                        "id": "qxbh5ozp",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-01.jpeg",
                        "scale": {
                          "width": 1920,
                          "height": 1080
                        },
                        "x": -520,
                        "y": 130
                      },
                      {
                        "id": "q1zoqlik",
                        "type": "component",
                        "component": "advanced/060",
                        "settings": {
                          "counter": {
                            "text": [
                              "$__num__"
                            ],
                            "from": "400",
                            "to": "230",
                            "duration": 3000,
                            "color": "white",
                            "text-shadow": ".2vw .2vw .2vw rgba(50,50,50,0.5)",
                            "font-size": "20vw",
                            "font-family": "Anton",
                            "font-weight": "400"
                          }
                        },
                        "duration": 10,
                        "comment": "Counter",
                        "x": 0,
                        "y": 1211,
                        "width": 1079,
                        "height": 708
                      },
                      {
                        "id": "q9dt92je",
                        "type": "text",
                        "text": "just",
                        "style": "001",
                        "x": -3,
                        "y": 1199,
                        "width": 1079,
                        "height": 345,
                        "settings": {
                          "font-family": "Anton",
                          "font-size": "8vw",
                          "font-weight": "400"
                        }
                      },
                      {
                        "id": "qwsw8ovh",
                        "type": "text",
                        "text": "per night",
                        "style": "001",
                        "x": 0,
                        "y": 1573,
                        "width": 1079,
                        "height": 345,
                        "settings": {
                          "font-family": "Anton",
                          "font-size": "8vw",
                          "font-weight": "400"
                        }
                      }
                    ],
                    "background-color": "#0296C8",
                    "transition": {
                      "style": "circlecrop",
                      "duration": 1
                    }
                  },
                  {
                    "id": "qnsudhic",
                    "comment": "Scene 1",
                    "elements": [
                      {
                        "id": "q5tmxpqi",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-01.jpeg",
                        "scale": {
                          "width": 1920,
                          "height": 1080
                        },
                        "x": -520,
                        "y": 130
                      },
                      {
                        "id": "qyg1o6or",
                        "type": "text",
                        "text": "best-rentals.com",
                        "style": "001",
                        "x": -3,
                        "y": 1199,
                        "width": 1079,
                        "height": 345,
                        "settings": {
                          "font-family": "Anton",
                          "font-size": "8vw",
                          "font-weight": "400"
                        }
                      },
                      {
                        "id": "qw3bp3u3",
                        "type": "component",
                        "component": "advanced/051",
                        "settings": {
                          "button": {
                            "background": "red",
                            "border": "2px solid #b30000",
                            "border-radius": "0",
                            "padding": "0 15vw",
                            "text": [
                              "BOOK NOW !"
                            ],
                            "color": "white",
                            "text-shadow": "2px 2px 0px rgba(50,50,50,0.5)",
                            "font-size": "10vw",
                            "font-family": "Anton"
                          },
                          "cursor": {
                            "width": "10vw",
                            "height": "10vw"
                          }
                        },
                        "duration": 10,
                        "comment": "Button with mouse click",
                        "x": 0,
                        "y": 1419,
                        "width": 1079,
                        "height": 499
                      }
                    ],
                    "background-color": "#0296C8",
                    "transition": {
                      "style": "fade",
                      "duration": 0.5
                    }
                  }
                ],
                "elements": [
                  {
                    "id": "qd7i7v46",
                    "type": "audio",
                    "src": "https://json2video-test.s3.amazonaws.com/assets/audios/and-just-like-that.mp3",
                    "duration": -2,
                    "fade-out": 2
                  }
                ],
                "resolution": "instagram-story",
                "fps": 25,
                "settings": {},
                "cache": true
              },
              {
                "id": "qd56dylt",
                "comment": "Default movie",
                "width": 1080,
                "height": 1920,
                "quality": "medium",
                "draft": false,
                "scenes": [
                  {
                    "id": "q952qhwi",
                    "comment": "Scene 1",
                    "elements": [
                      {
                        "id": "q2nwos8c",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-01.jpeg",
                        "scale": {
                          "width": 1920,
                          "height": 1080
                        },
                        "x": -520,
                        "y": 130
                      },
                      {
                        "id": "qmxazrdn",
                        "type": "text",
                        "text": "STAY AT YOUR<br>DREAM HOUSE",
                        "duration": 5,
                        "x": 0,
                        "y": 1154,
                        "width": 1079,
                        "height": 765,
                        "style": "009",
                        "settings": {
                          "font-family": "Anton",
                          "font-size": "16vw",
                          "line-height": "12vw"
                        }
                      }
                    ],
                    "background-color": "#0296C8"
                  },
                  {
                    "id": "qv0m3977",
                    "comment": "Scene 2",
                    "elements": [
                      {
                        "id": "q8hpdfv4",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-06.jpeg",
                        "scale": {
                          "width": 1920,
                          "height": 1080
                        },
                        "x": -3,
                        "y": -1,
                        "pan": "right"
                      },
                      {
                        "id": "q27tp8ba",
                        "type": "component",
                        "component": "basic/000",
                        "settings": {
                          "headline": {
                            "text": [
                              "Treat yourself<br>this summer"
                            ],
                            "color": "black",
                            "font-size": "16vw",
                            "font-family": "Anton",
                            "font-weight": "400",
                            "text-align": "center",
                            "line-height": "16vw"
                          },
                          "body": {
                            "text": [
                              "&nbsp;",
                              "Port Angeles, WA"
                            ],
                            "color": "#333",
                            "text-align": "center",
                            "font-size": "6vw"
                          }
                        },
                        "width": 878,
                        "height": 644,
                        "x": 113,
                        "y": 1224,
                        "duration": 10,
                        "comment": "Simple card"
                      }
                    ],
                    "background-color": "#F2F2F2",
                    "duration": 8,
                    "transition": {
                      "style": "circleopen",
                      "duration": 1
                    }
                  },
                  {
                    "id": "qo8cbtss",
                    "comment": "New scene",
                    "elements": [
                      {
                        "id": "qi9ij5ud",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-02.jpeg",
                        "scale": {
                          "width": 2880,
                          "height": 1920
                        },
                        "x": 0,
                        "y": 0,
                        "pan": "right"
                      },
                      {
                        "id": "q8xm6o3k",
                        "type": "component",
                        "component": "basic/052",
                        "settings": {
                          "headline": {
                            "text": [
                              "Over the lake"
                            ],
                            "font-size": "80px"
                          },
                          "section": {
                            "text": [
                              ""
                            ]
                          }
                        },
                        "cache": false,
                        "comment": "Over the lake"
                      }
                    ],
                    "duration": 6,
                    "transition": {
                      "style": "circleopen",
                      "duration": 1
                    }
                  },
                  {
                    "id": "qgxvwwgg",
                    "comment": "New scene",
                    "elements": [
                      {
                        "id": "qxu1yohy",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-03.jpeg",
                        "scale": {
                          "width": 2880,
                          "height": 1920
                        },
                        "x": -725,
                        "y": -4,
                        "pan": "right"
                      },
                      {
                        "id": "qoy0q7se",
                        "type": "component",
                        "component": "basic/052",
                        "settings": {
                          "headline": {
                            "text": [
                              "Living room with views"
                            ],
                            "font-size": "80px"
                          },
                          "section": {
                            "text": [
                              ""
                            ]
                          }
                        },
                        "cache": false,
                        "comment": "Living room with views"
                      }
                    ],
                    "duration": 6,
                    "transition": {
                      "style": "circleopen",
                      "duration": 1
                    }
                  },
                  {
                    "id": "qieg0it2",
                    "comment": "New scene",
                    "elements": [
                      {
                        "id": "q2aj241d",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-04.jpeg",
                        "scale": {
                          "width": 2880,
                          "height": 1920
                        },
                        "x": -725,
                        "y": -4,
                        "pan": "right"
                      },
                      {
                        "id": "qj744bnw",
                        "type": "component",
                        "component": "basic/052",
                        "settings": {
                          "headline": {
                            "text": [
                              "Kitchen"
                            ],
                            "font-size": "80px"
                          },
                          "section": {
                            "text": [
                              ""
                            ]
                          }
                        },
                        "cache": false,
                        "comment": "Kitchen"
                      }
                    ],
                    "duration": 6,
                    "transition": {
                      "style": "circleopen",
                      "duration": 1
                    }
                  },
                  {
                    "id": "qxp6uo5m",
                    "comment": "Scene 1",
                    "elements": [
                      {
                        "id": "qxbh5ozp",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-01.jpeg",
                        "scale": {
                          "width": 1920,
                          "height": 1080
                        },
                        "x": -520,
                        "y": 130
                      },
                      {
                        "id": "q1zoqlik",
                        "type": "component",
                        "component": "advanced/060",
                        "settings": {
                          "counter": {
                            "text": [
                              "$__num__"
                            ],
                            "from": "400",
                            "to": "230",
                            "duration": 3000,
                            "color": "white",
                            "text-shadow": ".2vw .2vw .2vw rgba(50,50,50,0.5)",
                            "font-size": "20vw",
                            "font-family": "Anton",
                            "font-weight": "400"
                          }
                        },
                        "duration": 10,
                        "comment": "Counter",
                        "x": 0,
                        "y": 1211,
                        "width": 1079,
                        "height": 708
                      },
                      {
                        "id": "q9dt92je",
                        "type": "text",
                        "text": "just",
                        "style": "001",
                        "x": -3,
                        "y": 1199,
                        "width": 1079,
                        "height": 345,
                        "settings": {
                          "font-family": "Anton",
                          "font-size": "8vw",
                          "font-weight": "400"
                        }
                      },
                      {
                        "id": "qwsw8ovh",
                        "type": "text",
                        "text": "per night",
                        "style": "001",
                        "x": 0,
                        "y": 1573,
                        "width": 1079,
                        "height": 345,
                        "settings": {
                          "font-family": "Anton",
                          "font-size": "8vw",
                          "font-weight": "400"
                        }
                      }
                    ],
                    "background-color": "#0296C8",
                    "transition": {
                      "style": "circlecrop",
                      "duration": 1
                    }
                  },
                  {
                    "id": "qnsudhic",
                    "comment": "Scene 1",
                    "elements": [
                      {
                        "id": "q5tmxpqi",
                        "type": "image",
                        "src": "https://json2video-test.s3.amazonaws.com/assets/images/real-estate/house-seattle/house-seattle-01.jpeg",
                        "scale": {
                          "width": 1920,
                          "height": 1080
                        },
                        "x": -520,
                        "y": 130
                      },
                      {
                        "id": "qyg1o6or",
                        "type": "text",
                        "text": "best-rentals.com",
                        "style": "001",
                        "x": -3,
                        "y": 1199,
                        "width": 1079,
                        "height": 345,
                        "settings": {
                          "font-family": "Anton",
                          "font-size": "8vw",
                          "font-weight": "400"
                        }
                      },
                      {
                        "id": "qw3bp3u3",
                        "type": "component",
                        "component": "advanced/051",
                        "settings": {
                          "button": {
                            "background": "red",
                            "border": "2px solid #b30000",
                            "border-radius": "0",
                            "padding": "0 15vw",
                            "text": [
                              "BOOK NOW !"
                            ],
                            "color": "white",
                            "text-shadow": "2px 2px 0px rgba(50,50,50,0.5)",
                            "font-size": "10vw",
                            "font-family": "Anton"
                          },
                          "cursor": {
                            "width": "10vw",
                            "height": "10vw"
                          }
                        },
                        "duration": 10,
                        "comment": "Button with mouse click",
                        "x": 0,
                        "y": 1419,
                        "width": 1079,
                        "height": 499
                      }
                    ],
                    "background-color": "#0296C8",
                    "transition": {
                      "style": "fade",
                      "duration": 0.5
                    }
                  }
                ],
                "elements": [
                  {
                    "id": "qd7i7v46",
                    "type": "audio",
                    "src": "https://json2video-test.s3.amazonaws.com/assets/audios/and-just-like-that.mp3",
                    "duration": -2,
                    "fade-out": 2
                  }
                ],
                "resolution": "instagram-story",
                "fps": 25,
                "settings": {},
                "cache": true
              }
            ],
            // For LLMs: See https://json2video.com/docs/api/ for full details on each element type (video, image, text, html, component, audio, voice, audiogram, subtitles). Each element type has its own properties. For example, a text element requires "type: text" and "text" fields, a video element requires "type: video" and "src" fields, etc.
          }
        },
        {
          name: 'get_video_status',
          description: 'Get the status or result of a generated video',
          inputSchema: {
            type: 'object',
            properties: {
              apiKey: { type: 'string', description: 'json2video API key (optional, can also be set as environment variable JSON2VIDEO_API_KEY)' },
              project: { type: 'string', description: 'Project ID from video generation' }
            },
            required: ['project']
          }
        },
        {
          name: 'create_template',
          description: 'Create a new template in json2video',
          inputSchema: {
            type: 'object',
            properties: {
              apiKey: { type: 'string', description: 'json2video API key (optional, can also be set as environment variable JSON2VIDEO_API_KEY)' },
              name: { type: 'string', description: 'Name of the template' },
              description: { type: 'string', description: 'Description of the template' }
            },
            required: ['name']
          }
        },
        {
          name: 'get_template',
          description: 'Get template details from json2video',
          inputSchema: {
            type: 'object',
            properties: {
              apiKey: { type: 'string', description: 'json2video API key (optional, can also be set as environment variable JSON2VIDEO_API_KEY)' },
              name: { type: 'string', description: 'Name of the template to search for' }
            },
            required: ['name']
          }
        },
        {
          name: 'list_templates',
          description: 'List all available templates from json2video',
          inputSchema: {
            type: 'object',
            properties: {
              apiKey: { type: 'string', description: 'json2video API key (optional, can also be set as environment variable JSON2VIDEO_API_KEY)' }
            }
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        if (!['generate_video', 'get_video_status', 'create_template', 'get_template', 'list_templates'].includes(request.params.name)) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
        }

        const args = request.params.arguments || {};
        const apiKey = args.apiKey || process.env.JSON2VIDEO_API_KEY;
        if (!apiKey) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'API key is required (either in arguments or as environment variable JSON2VIDEO_API_KEY)'
          );
        }

        switch (request.params.name) {
          case 'get_template':
            return await getTemplate(args, apiKey);
          case 'list_templates':
            return await listTemplates(apiKey);
          case 'create_template':
            return await createTemplate(args, apiKey);
          case 'generate_video':
            return await generateVideo(args, apiKey);
          case 'get_video_status':
            return await getVideoStatus(args, apiKey);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
        
      } catch (error) {
        if (error instanceof McpError) {
          console.error('[MCP Error]', error);
          throw error;
        }
        console.error('[Error] Tool call failed:', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Failed to process tool call: ${error.message}`
        );
      }

      // Ortak hata yönetimi fonksiyonu
      function handleApiError(result, customMessage) {
        if (!result.success) {
          throw new McpError(
            ErrorCode.InternalError,
            customMessage || `json2video API error: ${JSON.stringify(result)}`
          );
        }
      }

      async function getVideoStatus(args, apiKey) {
        console.error(`[API] Getting video status for project: ${args.project}`);
        const url = `${API_BASE}/movies?project=${args.project}`;
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'x-api-key': apiKey }
        });
        const result = await response.json();

        handleApiError(result);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      }

      async function generateVideo(args, apiKey) {
        console.error(`[API] Generating video with args: ${JSON.stringify(args)}`);
        const response = await fetch(`${API_BASE}/movies`, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(args)
        });
        const result = await response.json();

        handleApiError(result);
        if (!result.project) {
          throw new McpError(
            ErrorCode.InternalError,
            `json2video API error: ${JSON.stringify(result)}`
          );
        }

        return {
          content: [
            {
              type: 'text',
              text: `Video generation started. Project ID: ${result.project}`
            }
          ]
        };
      }

      async function createTemplate(args, apiKey) {
        console.error(`[API] Creating template with args: ${JSON.stringify(args)}`);
        const response = await fetch(`${API_BASE}/templates`, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: args.name,
            description: args.description || `Template created at ${new Date().toISOString()}`
          })
        });
        const result = await response.json();

        handleApiError(result);

        return {
          content: [
            {
              type: 'text',
              text: `Template created successfully. Template ID: ${result.template}`
            }
          ]
        };
      }

      async function listTemplates(apiKey) {
        console.error('[API] Listing all templates');
        const response = await fetch(`${API_BASE}/templates`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const result = await response.json();

        handleApiError(result);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.templates, null, 2)
            }
          ]
        };
      }

      async function getTemplate(args, apiKey) {
        console.error(`[API] Getting template with name: ${args.name}`);
        const response = await fetch(`${API_BASE}/templates`, {
          method: 'GET',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
          }
        });
        const result = await response.json();

        handleApiError(result);

        // Find template by name
        const template = result.templates.find(t => t.name === args.name);

        if (!template) {
          throw new McpError(
            ErrorCode.NotFound,
            `Template with name "${args.name}" not found`
          );
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(template, null, 2)
            }
          ]
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('json2video MCP server running on stdio');
  }
}

const server = new Json2VideoServer();
server.run().catch(console.error);