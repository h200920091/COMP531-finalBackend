require('es6-promise').polyfill();
require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`;

describe('Validate Article functionality', () => {

    let cookie; // Store the cookie for authenticated requests

    // Assuming a user is already registered and can be used for testing
    beforeAll(done => {
        // Login to get the cookie for authenticated requests
        const loginUser = { username: 'newuser', password: 'pass1234' };
        fetch(url('/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginUser)
        }).then(res => {
            cookie = res.headers.get('set-cookie');
            return res.json();
        }).then(res => {
            expect(res.username).toEqual('newuser');
            expect(res.result).toEqual('success');
            done();
        });
    });

    it('create new article', done => {
        const newArticle = { text: 'New article content', image: 'http://example.com/image.jpg' };
        fetch(url('/article'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify(newArticle)
        }).then(res => res.json()).then(res => {
            expect(res.articles).toBeDefined();
            expect(res.articles[0].content).toEqual('New article content');
            done();
        });
    });

    it('get articles by user', done => {
        fetch(url('/articles/newuser'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            }
        }).then(res => res.json()).then(res => {
            expect(res.articles).toBeDefined();
            done();
        });
    });

    // Add more tests as needed for other endpoints

    afterAll(done => {
        // Logout or clean up as needed
        done();
    });

});
