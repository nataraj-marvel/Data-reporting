const request = require('supertest');

const BASE_URL = 'http://localhost:3000'; // Replace with your live environment URL

describe('Live Endpoint Tests', () => {
    it('should create a new prompt', async () => {
        const response = await request(BASE_URL)
            .post('/api/prompts')
            .send({
                user_id: 'test-user',
                prompt: 'Test prompt',
                timestamp: new Date().toISOString(),
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('prompt_id');
    });

    it('should create a new request', async () => {
        const response = await request(BASE_URL)
            .post('/api/requests')
            .send({
                user_id: 'test-user',
                request: 'Test request',
                status: 'pending',
                timestamp: new Date().toISOString(),
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('request_id');
    });

    it('should create a new issue', async () => {
        const response = await request(BASE_URL)
            .post('/api/issues')
            .send({
                issue_description: 'Test issue',
                severity: 'medium',
                status: 'open',
                timestamp: new Date().toISOString(),
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('issue_id');
    });

    it('should create a new task', async () => {
        const response = await request(BASE_URL)
            .post('/api/tasks')
            .send({
                task_name: 'Test task',
                completed_by: 'test-user',
                timestamp: new Date().toISOString(),
                files_affected: JSON.stringify(['file1.js', 'file2.js']),
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('task_id');
    });

    it('should create a new file record', async () => {
        const response = await request(BASE_URL)
            .post('/api/files')
            .send({
                file_name: 'example.js',
                change_type: 'modified',
                timestamp: new Date().toISOString(),
                version: '1.0.1',
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('file_id');
    });
});