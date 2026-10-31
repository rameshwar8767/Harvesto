import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
    rateLimiter,
    securityHeaders,
    sanitizeInput,
} from '../middlewares/security.middleware.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

describe('Security & Utility Middleware Suite', () => {

    test('securityHeaders attaches strict HTTP headers and removes X-Powered-By', () => {
        const headers = {};
        const req = {};
        const res = {
            setHeader(key, val) { headers[key.toLowerCase()] = val; },
            removeHeader(key) { delete headers[key.toLowerCase()]; },
        };
        headers['x-powered-by'] = 'Express';

        securityHeaders(req, res, () => {});

        assert.strictEqual(headers['x-content-type-options'], 'nosniff');
        assert.strictEqual(headers['x-frame-options'], 'DENY');
        assert.strictEqual(headers['x-xss-protection'], '1; mode=block');
        assert.strictEqual(headers['referrer-policy'], 'strict-origin-when-cross-origin');
        assert.strictEqual(headers['x-powered-by'], undefined);
    });

    test('sanitizeInput recursively strips MongoDB operator keys ($)', () => {
        const req = {
            body: {
                username: 'alice',
                password: { $gt: '' },
                nested: { $where: 'sleep(1000)', valid: 'ok' },
            },
            query: {
                role: { $ne: 'user' },
                category: 'vegetables',
            },
            params: {
                id: '12345',
            },
        };

        sanitizeInput(req, {}, () => {});

        assert.strictEqual(req.body.username, 'alice');
        assert.strictEqual(req.body.password.$gt, undefined);
        assert.strictEqual(req.body.nested.$where, undefined);
        assert.strictEqual(req.body.nested.valid, 'ok');
        assert.strictEqual(req.query.role.$ne, undefined);
        assert.strictEqual(req.query.category, 'vegetables');
    });

    test('rateLimiter permits allowed requests and throttles excess with 429', () => {
        const limiter = rateLimiter({ windowMs: 60000, max: 2 });
        const headers = {};
        let responseCode = null;
        let responseBody = null;

        const makeReq = () => {
            const req = { ip: '192.168.1.100', headers: {} };
            const res = {
                setHeader(k, v) { headers[k] = v; },
                status(code) { responseCode = code; return this; },
                json(data) { responseBody = data; return this; },
            };
            let nextCalled = false;
            limiter(req, res, () => { nextCalled = true; });
            return nextCalled;
        };

        assert.strictEqual(makeReq(), true, 'Request 1 should pass');
        assert.strictEqual(makeReq(), true, 'Request 2 should pass');
        assert.strictEqual(makeReq(), false, 'Request 3 should be blocked');
        assert.strictEqual(responseCode, 429);
        assert.strictEqual(responseBody.success, false);
    });

    test('ApiError properly sets HTTP status code and error messages', () => {
        const err = new ApiError(404, 'Item not found', ['Invalid ID']);
        assert.strictEqual(err.statusCode, 404);
        assert.strictEqual(err.message, 'Item not found');
        assert.strictEqual(err.success, false);
        assert.deepStrictEqual(err.errors, ['Invalid ID']);
    });

    test('ApiResponse standardizes response envelopes', () => {
        const payload = { token: 'xyz123' };
        const res = new ApiResponse(200, payload, 'Operation successful');
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.success, true);
        assert.strictEqual(res.message, 'Operation successful');
        assert.deepStrictEqual(res.data, payload);
    });

});
