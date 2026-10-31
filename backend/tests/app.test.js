import { test, describe } from 'node:test';
import assert from 'node:assert';
import app from '../app.js';

describe('Express API Core Routes', () => {

    test('GET /api/health responds with 200 and ok status', (t, done) => {
        const req = { method: 'GET', url: '/api/health', headers: {} };
        const res = {
            statusCode: 200,
            headers: {},
            setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
            getHeader(k) { return this.headers[k.toLowerCase()]; },
            removeHeader(k) { delete this.headers[k.toLowerCase()]; },
            status(code) { this.statusCode = code; return this; },
            json(body) {
                assert.strictEqual(this.statusCode, 200);
                assert.strictEqual(body.status, 'ok');
                assert.ok(body.timestamp);
                done();
            },
        };
        app.handle(req, res);
    });

    test('GET / responds with welcome banner string', (t, done) => {
        const req = { method: 'GET', url: '/', headers: {} };
        const res = {
            statusCode: 200,
            headers: {},
            setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
            getHeader(k) { return this.headers[k.toLowerCase()]; },
            removeHeader(k) { delete this.headers[k.toLowerCase()]; },
            status(code) { this.statusCode = code; return this; },
            send(text) {
                assert.strictEqual(this.statusCode, 200);
                assert.ok(text.includes('GreenCart API is running') || text.includes('API'));
                done();
            },
        };
        app.handle(req, res);
    });

});
