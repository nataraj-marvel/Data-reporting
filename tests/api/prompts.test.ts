import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/prompts/index';

describe('POST /api/prompts', () => {
    it('should create a new prompt successfully', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                user_id: '123',
                prompt: 'Test prompt',
                timestamp: new Date().toISOString(),
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