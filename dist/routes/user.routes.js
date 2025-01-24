"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../utils/database"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userRoutes = async (fastify) => {
    fastify.post('/register', async (request, reply) => {
        const { name, email, password_hash, role } = request.body;
        const hashedPassword = await bcrypt_1.default.hash(password_hash, 10);
        if (!['User', 'Makler', 'Admin'].includes(role)) {
            return reply.status(400).send({ error: 'Invalid role provided.' });
        }
        try {
            const user = await database_1.default.user.create({
                data: {
                    name,
                    email,
                    password_hash: hashedPassword,
                    role
                }
            });
            reply.send(user);
        }
        catch (error) {
            reply.status(500).send({ error: 'Internal server error' });
        }
    });
};
exports.default = userRoutes;
