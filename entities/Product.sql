{
  "name": "Product",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043f\u0430\u0440\u0444\u044e\u043c\u0430"
    },
    "brand": {
      "type": "string",
      "description": "\u0411\u0440\u0435\u043d\u0434"
    },
    "price": {
      "type": "number",
      "description": "\u0426\u0435\u043d\u0430 \u0432 \u0440\u0443\u0431\u043b\u044f\u0445"
    },
    "sale_price": {
      "type": "number",
      "description": "\u0426\u0435\u043d\u0430 \u0441\u043e \u0441\u043a\u0438\u0434\u043a\u043e\u0439"
    },
    "volume_ml": {
      "type": "number",
      "description": "\u041e\u0431\u044a\u0451\u043c \u0432 \u043c\u043b"
    },
    "description": {
      "type": "string",
      "description": "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435 \u0430\u0440\u043e\u043c\u0430\u0442\u0430"
    },
    "category": {
      "type": "string",
      "enum": [
        "aquatic",
        "aldehydic",
        "amber",
        "balsamic",
        "floral",
        "woody",
        "oriental",
        "citrus",
        "gourmand",
        "other",
        "leather",
        "musky",
        "spicy",
        "sweet",
        "tobacco",
        "fruity",
        "fougere"
      ],
      "description": "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f \u0430\u0440\u043e\u043c\u0430\u0442\u0430"
    },
    "top_notes": {
      "type": "string",
      "description": "\u0412\u0435\u0440\u0445\u043d\u0438\u0435 \u043d\u043e\u0442\u044b"
    },
    "heart_notes": {
      "type": "string",
      "description": "\u041d\u043e\u0442\u044b \u0441\u0435\u0440\u0434\u0446\u0430"
    },
    "base_notes": {
      "type": "string",
      "description": "\u0411\u0430\u0437\u043e\u0432\u044b\u0435 \u043d\u043e\u0442\u044b"
    },
    "image_url": {
      "type": "string",
      "description": "URL \u0438\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u044f"
    },
    "intensity": {
      "type": "string",
      "enum": [
        "light",
        "moderate",
        "intense"
      ],
      "description": "\u0418\u043d\u0442\u0435\u043d\u0441\u0438\u0432\u043d\u043e\u0441\u0442\u044c \u0430\u0440\u043e\u043c\u0430\u0442\u0430"
    },
    "gender": {
      "type": "string",
      "enum": [
        "unisex",
        "feminine",
        "masculine"
      ],
      "description": "\u0414\u043b\u044f \u043a\u043e\u0433\u043e"
    },
    "featured": {
      "type": "boolean",
      "default": false,
      "description": "\u041f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u0442\u044c \u043d\u0430 \u0433\u043b\u0430\u0432\u043d\u043e\u0439"
    },
    "bestseller": {
      "type": "boolean",
      "default": false,
      "description": "\u041f\u043e\u043c\u0435\u0447\u0430\u0442\u044c \u043a\u0430\u043a \u0445\u0438\u0442 \u043f\u0440\u043e\u0434\u0430\u0436"
    },
    "popular": {
      "type": "boolean",
      "default": false,
      "description": "\u041e\u0442\u043e\u0431\u0440\u0430\u0436\u0430\u0442\u044c \u0432 \u0431\u043b\u043e\u043a\u0435 \u043f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0445"
    }
  },
  "required": [
    "name",
    "brand",
    "price"
  ]
}