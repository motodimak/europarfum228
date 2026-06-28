{
  "name": "Client",
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "description": "Client first name"
    },
    "lastName": {
      "type": "string",
      "description": "Client last name"
    },
    "contactType": {
      "type": "string",
      "enum": ["phone", "telegram", "whatsapp", "other"],
      "description": "Chosen contact channel"
    },
    "contactValue": {
      "type": "string",
      "description": "Contact identifier value"
    }
  },
  "required": ["firstName", "contactType", "contactValue"]
}
