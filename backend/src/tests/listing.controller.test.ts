import { FastifyInstance } from 'fastify';
import { listingController } from '../controllers/listing.controller';
import { listingService } from '../services/listing.service'; 

jest.mock('../services/listing.service');
const mockCreateListing = listingService.createListing as jest.Mock;
const mockGetAllListings = listingService.getAllListings as jest.Mock;
const mockGetListingById = listingService.getListingById as jest.Mock;
const mockUpdateListing = listingService.updateListing as jest.Mock;
const mockDeleteListing = listingService.deleteListing as jest.Mock;

describe('ListingController', () => {
    let fastify: FastifyInstance;

    beforeAll(() => {
        fastify = require('fastify')(); 
        fastify.post('/listings', listingController.create);
        fastify.get('/listings', listingController.getAll);
        fastify.get('/listings/:id', listingController.getById);
        fastify.put('/listings/:id', listingController.update);
        fastify.delete('/listings/:id', listingController.delete);
    });

    afterEach(() => {
        jest.clearAllMocks(); 
    });

    it('should create a listing successfully', async () => {
        const mockListing = { id: '123', location: 'City', price: 100000, status: 'Active', tags: ['tag1'] };
        mockCreateListing.mockResolvedValue(mockListing);

        const req = {
            body: {
                user_id: 'user123',
                is_agent_listing: true,
                type: 'apartment',
                location: 'City',
                price: 100000,
                area: 50,
                photos: ['photo1.jpg'],
                status: 'Active',
                tags: ['tag1', 'tag2']
            }
        };

        const res = await fastify.inject({
            method: 'POST',
            url: '/listings',
            payload: req.body,
        });

        expect(res.statusCode).toBe(201);
        expect(res.json()).toEqual(mockListing);
        expect(mockCreateListing).toHaveBeenCalledWith(req.body);
    });

    it('should get all listings', async () => {
        const mockListings = [
            { id: '1', location: 'City', price: 100000, status: 'Active', tags: ['tag1'] },
            { id: '2', location: 'Suburb', price: 150000, status: 'Archived', tags: ['tag2'] }
        ];
        mockGetAllListings.mockResolvedValue(mockListings);

        const res = await fastify.inject({
            method: 'GET',
            url: '/listings',
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual(mockListings);
        expect(mockGetAllListings).toHaveBeenCalled();
    });

    it('should get a listing by id', async () => {
        const mockListing = { id: '123', location: 'City', price: 100000, status: 'Active', tags: ['tag1'] };
        mockGetListingById.mockResolvedValue(mockListing);

        const res = await fastify.inject({
            method: 'GET',
            url: '/listings/123',
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual(mockListing);
        expect(mockGetListingById).toHaveBeenCalledWith('123');
    });

    it('should return 404 if listing not found for update', async () => {
        mockUpdateListing.mockResolvedValue(null);

        const res = await fastify.inject({
            method: 'PUT',
            url: '/listings/123',
            payload: { location: 'New City', price: 120000 },
        });

        expect(res.statusCode).toBe(404);
        expect(res.json()).toEqual({ message: 'Listing not found for update' });
    });

    it('should update a listing successfully', async () => {
        const updatedListing = { id: '123', location: 'New City', price: 120000 };
        mockUpdateListing.mockResolvedValue(updatedListing);

        const res = await fastify.inject({
            method: 'PUT',
            url: '/listings/123',
            payload: { location: 'New City', price: 120000 },
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual(updatedListing);
        expect(mockUpdateListing).toHaveBeenCalledWith('123', expect.any(Object));
    });

    it('should delete a listing successfully', async () => {
        const deletedListing = { id: '123', location: 'City', price: 100000, status: 'Active' };
        mockDeleteListing.mockResolvedValue(deletedListing);

        const res = await fastify.inject({
            method: 'DELETE',
            url: '/listings/123',
        });

        expect(res.statusCode).toBe(200);
        expect(res.json()).toEqual(deletedListing);
        expect(mockDeleteListing).toHaveBeenCalledWith('123');
    });

    it('should return 404 if listing not found for deletion', async () => {
        mockDeleteListing.mockResolvedValue(null);

        const res = await fastify.inject({
            method: 'DELETE',
            url: '/listings/123',
        });

        expect(res.statusCode).toBe(404);
        expect(res.json()).toEqual({ message: 'Listing not found for deletion' });
    });
});
