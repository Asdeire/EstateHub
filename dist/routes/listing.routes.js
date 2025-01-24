"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../utils/database"));
const listingRoutes = async (fastify) => {
    fastify.post('/listings', async (request, reply) => {
        const { user_id, is_agent_listing, type, location, price, area, description, photos, status, category_id, } = request.body;
        if (!['Active', 'Archived'].includes(status)) {
            return reply.status(400).send({ error: 'Invalid status provided.' });
        }
        try {
            const listing = await database_1.default.listing.create({
                data: {
                    user_id,
                    is_agent_listing,
                    type,
                    location,
                    price,
                    area,
                    description,
                    photos,
                    status,
                    category_id,
                },
            });
            reply.send(listing);
        }
        catch (error) {
            console.error(error);
            reply.status(500).send({ error: 'Internal server error' });
        }
    });
};
exports.default = listingRoutes;
