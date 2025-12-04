import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/tasks/index';

describe('POST /api/tasks', () => {
    it('should create a new task successfully', async () => {
        const { req, res } = createMocks({
            method: 'POST',
            body: {
                task_name: 'Test task',
                completed_by: 'User123',
                timestamp: new Date().toISOString(),
                files_affected: JSON.stringify(['file1.js', 'file2.js']),
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