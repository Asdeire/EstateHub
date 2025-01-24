"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const listing_routes_1 = __importDefault(require("./routes/listing.routes"));
dotenv_1.default.config();
const app = (0, fastify_1.default)();
app.register(user_routes_1.default);
app.register(listing_routes_1.default);
const start = async () => {
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server running at http://localhost:3000');
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
