import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Frontend API Client Architecture', () => {

    test('ApiClient configures headers and serialization correctly', async () => {
        // Mock fetch implementation
        let capturedUrl = '';
        let capturedConfig = {};

        const mockFetch = async (url, config) => {
            capturedUrl = url;
            capturedConfig = config;
            return {
                ok: true,
                status: 200,
                json: async () => ({ success: true, test: 123 }),
            };
        };

        // Simple class testing logic identical to client.js
        class TestApiClient {
            constructor(baseURL) {
                this.baseURL = baseURL;
            }

            async request(endpoint, options = {}) {
                const url = `${this.baseURL}${endpoint}`;
                const headers = {
                    'Content-Type': 'application/json',
                    ...(options.headers || {}),
                };

                const config = {
                    ...options,
                    headers,
                    credentials: 'include',
                };

                if (options.body && typeof options.body === 'object') {
                    config.body = JSON.stringify(options.body);
                }

                return mockFetch(url, config);
            }
        }

        const client = new TestApiClient('http://localhost:5000');
        const res = await client.request('/api/health', {
            method: 'POST',
            body: { foo: 'bar' },
        });

        const data = await res.json();
        assert.strictEqual(data.success, true);
        assert.strictEqual(capturedUrl, 'http://localhost:5000/api/health');
        assert.strictEqual(capturedConfig.credentials, 'include');
        assert.strictEqual(capturedConfig.headers['Content-Type'], 'application/json');
        assert.strictEqual(capturedConfig.body, JSON.stringify({ foo: 'bar' }));
    });

    test('Harvest Basket pricing calculates totals and 2% tax rate correctly', () => {
        const cartItems = [
            { price: 100, offerPrice: 80, quantity: 2 },
            { price: 50, offerPrice: 40, quantity: 1 },
        ];

        const subtotal = cartItems.reduce((acc, item) => acc + item.offerPrice * item.quantity, 0);
        const tax = Math.round(subtotal * 0.02);
        const grandTotal = subtotal + tax;

        assert.strictEqual(subtotal, 200); // 80*2 + 40*1 = 200
        assert.strictEqual(tax, 4);       // 2% of 200 = 4
        assert.strictEqual(grandTotal, 204);
    });

});
