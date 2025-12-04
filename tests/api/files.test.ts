import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/files/index';

describe('POST /api/files', () => {
    it('should create a new file record successfully', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                file_name: 'example.js',
                change_type: 'modified',
                timestamp: new Date().toISOString(),
                version: '1.0.1',
            },
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(201);
        expect(JSON.parse(res._getData())).toHaveProperty('status', 'success');
    });

    it('should return 400 for missing fields', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {},
        });

        await handler(req, res);

        expect(res._getStatusCode()).toBe(400);
        expect(JSON.parse(res._getData())).toHaveProperty('error');
    });
});