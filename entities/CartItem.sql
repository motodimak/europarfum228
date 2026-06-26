{
  "name": "CartItem",
  "type": "object",
  "properties": {
    "product_id": {
      "type": "string",
      "description": "ID \u0442\u043e\u0432\u0430\u0440\u0430"
    },
    "quantity": {
      "type": "number",
      "default": 1,
      "description": "\u041a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u043e"
    },
    "product_name": {
      "type": "string",
      "description": "\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0442\u043e\u0432\u0430\u0440\u0430 (\u0434\u043b\u044f \u0431\u044b\u0441\u0442\u0440\u043e\u0433\u043e \u0434\u043e\u0441\u0442\u0443\u043f\u0430)"
    },
    "product_price": {
      "type": "number",
      "description": "\u0426\u0435\u043d\u0430 \u0442\u043e\u0432\u0430\u0440\u0430"
    },
    "product_image": {
      "type": "string",
      "description": "\u0418\u0437\u043e\u0431\u0440\u0430\u0436\u0435\u043d\u0438\u0435 \u0442\u043e\u0432\u0430\u0440\u0430"
    },
    "product_volume": {
      "type": "number",
      "description": "\u041e\u0431\u044a\u0451\u043c"
    }
  },
  "required": [
    "product_id",
    "quantity"
  ]
}