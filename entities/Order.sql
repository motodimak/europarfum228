{
  "name": "Order",
  "type": "object",
  "properties": {
    "full_name": {
      "type": "string",
      "description": "\u0424\u0418\u041e \u043a\u043b\u0438\u0435\u043d\u0442\u0430"
    },
    "address": {
      "type": "string",
      "description": "\u0410\u0434\u0440\u0435\u0441 \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0438"
    },
    "delivery_date": {
      "type": "string",
      "format": "date",
      "description": "\u0414\u0430\u0442\u0430 \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0438"
    },
    "payment_method": {
      "type": "string",
      "enum": [
        "card",
        "cash"
      ],
      "description": "\u0421\u043f\u043e\u0441\u043e\u0431 \u043e\u043f\u043b\u0430\u0442\u044b"
    },
    "total_amount": {
      "type": "number",
      "description": "\u0418\u0442\u043e\u0433\u043e\u0432\u0430\u044f \u0441\u0443\u043c\u043c\u0430"
    },
    "items_snapshot": {
      "type": "string",
      "description": "JSON-\u0441\u043d\u0438\u043c\u043e\u043a \u0442\u043e\u0432\u0430\u0440\u043e\u0432"
    },
    "status": {
      "type": "string",
      "enum": [
        "new",
        "confirmed",
        "delivered"
      ],
      "default": "new"
    }
  },
  "required": [
    "full_name",
    "address",
    "delivery_date",
    "payment_method"
  ]
}