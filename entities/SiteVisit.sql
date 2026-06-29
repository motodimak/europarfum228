{
  "name": "SiteVisit",
  "type": "object",
  "properties": {
    "page": {
      "type": "string",
      "description": "Path visited by user"
    },
    "device": {
      "type": "string",
      "enum": ["desktop", "mobile"],
      "description": "Device type"
    },
    "user_agent": {
      "type": "string",
      "description": "Browser user agent"
    }
  },
  "required": ["page", "device"]
}
