import { jest } from '@jest/globals';

const mockQuery = jest.fn(async (sql: string, params?: any[]) => {
    if (sql.includes('INSERT INTO Prompts')) {
        return [{ insertId: 1 }];
    }
    if (sql.includes('INSERT INTO Requests')) {
        return [{ insertId: 2 }];
    }
    if (sql.includes('INSERT INTO Issues')) {
        return [{ insertId: 3 }];
    }
    if (sql.includes('INSERT INTO Tasks')) {
        return [{ insertId: 4 }];
    }
    if (sql.includes('INSERT INTO Files')) {
        return [{ insertId: 5 }];
    }
    return [];
});

jest.mock('../../lib/db', () => {
    const originalModule = jest.requireActual<typeof import('../../lib/db')>('../../lib/db');
    return {
        ...originalModule,
        query: mockQuery,
    };
});

export default mockQuery;