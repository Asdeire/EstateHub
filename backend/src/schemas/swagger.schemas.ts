import { sub } from "date-fns";

export const swaggerSchemas = {
  User: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      email: { type: "string", format: "email" },
      telegram_chat_id: { type: "string", nullable: true },
      telegram_username: { type: "string", nullable: true },
      password_hash: { type: "string" },
      role: { type: "string", enum: ["User", "Makler", "Admin"] },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
      fop_code: { type: "string", nullable: true },
    },
  },

  UserUpdate: {
    type: "object",
    properties: {
      name: { type: "string", nullable: true },
      email: { type: "string", format: "email", nullable: true },
      telegram_chat_id: { type: "string", nullable: true },
      telegram_username: { type: "string", nullable: true },
      password_hash: { type: "string", nullable: true },
      role: {
        type: "string",
        enum: ["User", "Makler", "Admin"],
        nullable: true,
      },
    },
  },

  Listing: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      user_id: { type: "string", format: "uuid" },
      is_agent_listing: { type: "boolean" },
      is_verified: { type: "boolean" },
      description: { type: "string" },
      photos: { type: "array", items: { type: "string" } },
      category_id: { type: "string", format: "uuid" },
      title: { type: "string" },
      location: { type: "string" },
      price: { type: "number" },
      area: { type: "number" },
      type: { type: "string" },
      status: { type: "string", enum: ["Active", "Archived"] },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
      category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
        },
      },
      tags: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
          },
        },
      },
    },
    required: ["id", "user_id", "title", "price", "status"],
  },

  ListingUpdate: {
    type: "object",
    properties: {
      is_agent_listing: { type: "boolean", nullable: true },
      type: { type: "string", nullable: true },
      location: { type: "string", nullable: true },
      price: { type: "number", nullable: true },
      area: { type: "number", nullable: true },
      title: { type: "string", nullable: true },
      description: { type: "string", nullable: true },
      photos: { type: "array", items: { type: "string" }, nullable: true },
      status: { type: "string", enum: ["Active", "Archived"], nullable: true },
      category_id: { type: "string", format: "uuid", nullable: true },
    },
  },

  ListingCreate: {
    type: "object",
    required: ["user_id", "type", "location", "price", "area", "title"],
    properties: {
      user_id: { type: "string", format: "uuid" },
      is_agent_listing: { type: "boolean" },
      type: { type: "string" },
      location: { type: "string" },
      price: { type: "number" },
      area: { type: "number" },
      title: { type: "string" },
      description: { type: "string", nullable: true },
      photos: { type: "array", items: { type: "string" }, nullable: true },
      status: { type: "string", enum: ["Active", "Archived"], nullable: true },
      category_id: { type: "string", format: "uuid", nullable: true },
    },
  },

  Category: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      description: { type: "string", nullable: true },
      listings_count: { type: "integer" },
      created_at: { type: "string", format: "date-time" },
    },
  },

  CategoryCreate: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
      description: { type: "string", nullable: true },
    },
  },

  CategoryUpdate: {
    type: "object",
    properties: {
      name: { type: "string", nullable: true },
      description: { type: "string", nullable: true },
    },
  },

  Tag: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string" },
      listings_count: { type: "integer" },
      created_at: { type: "string", format: "date-time" },
    },
  },

  TagCreate: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string" },
    },
  },

  TagUpdate: {
    type: "object",
    properties: {
      name: { type: "string", nullable: true },
    },
  },

  Subscription: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      buyer_id: { type: "string", format: "uuid" },
      filters: {
        type: "object",
        properties: {
          category: { type: "string", format: "uuid", nullable: true },
          type: { type: "string", nullable: true },
          minPrice: { type: "number", nullable: true },
          maxPrice: { type: "number", nullable: true },
          minArea: { type: "number", nullable: true },
          maxArea: { type: "number", nullable: true },
          tags: {
            type: "array",
            items: { type: "string", format: "uuid" },
            nullable: true,
          },
        },
      },
      transport: { type: "string", enum: ["EMAIL", "TELEGRAM"] },
      created_at: { type: "string", format: "date-time" },
      updated_at: { type: "string", format: "date-time" },
    },
  },

  SubscriptionCreate: {
    type: "object",
    required: ["filters", "transport"],
    properties: {
      buyer_id: { type: "string", format: "uuid" },
      filters: { type: "object" },
      transport: { type: "string", enum: ["EMAIL", "TELEGRAM"] },
    },
  },

  SubscriptionUpdate: {
    type: "object",
    properties: {
      filters: { type: "object", nullable: true },
      transport: {
        type: "string",
        enum: ["EMAIL", "TELEGRAM"],
        nullable: true,
      },
    },
  },

  Notification: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      user_id: { type: "string", format: "uuid" },
      subscription_id: { type: "string", format: "uuid" },
      message: { type: "string" },
      status: { type: "string", enum: ["SENT", "DELIVERED", "FAILED"] },
      created_at: { type: "string", format: "date-time" },
      sent_at: { type: "string", format: "date-time", nullable: true },
      subscription: {
        type: "object",
      },
    },
  },

  NotificationCreate: {
    type: "object",
    required: ["user_id", "subscription_id", "message", "status"],
    properties: {
      user_id: { type: "string", format: "uuid" },
      subscription_id: { type: "string", format: "uuid" },
      message: { type: "string" },
      status: { type: "string", enum: ["SENT", "DELIVERED", "FAILED"] },
    },
  },

  NotificationStatusUpdate: {
    type: "object",
    required: ["status"],
    properties: {
      status: { type: "string", enum: ["SENT", "DELIVERED", "FAILED"] },
    },
  },

  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
  },

  LoginResponse: {
    type: "object",
    properties: {
      token: { type: "string" },
      user: { $ref: "User#" },
    },
  },

  RefreshResponse: {
    type: "object",
    properties: {
      token: { type: "string" },
      user: { $ref: "User#" },
    },
  },

  RegisterRequest: {
    type: "object",
    required: ["name", "email", "password"],
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string" },
      telegram_chat_id: { type: "string", nullable: true },
      telegram_username: { type: "string", nullable: true },
      fop_code: { type: "string", nullable: true },
    },
  },

  RegisterResponse: {
    type: "object",
    properties: {
      user: { $ref: "User#" },
    },
  },

  VerifyRequest: {
    type: "object",
    required: ["email", "code"],
    properties: {
      email: { type: "string", format: "email" },
      code: { type: "string" },
    },
  },

  PasswordResetRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email" },
    },
  },

  PasswordResetConfirmRequest: {
    type: "object",
    required: ["email", "code", "newPassword"],
    properties: {
      email: { type: "string", format: "email" },
      code: { type: "string" },
      newPassword: { type: "string" },
    },
  },

  Favorite: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      user_id: { type: "string", format: "uuid" },
      listing_id: { type: "string", format: "uuid" },
      created_at: { type: "string", format: "date-time" },
    },
  },
};
