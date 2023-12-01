require('es6-promise').polyfill();
require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`;

describe('Validate Profile functionality', () => {

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

    it('get user headline', done => {
        // Replace 'existingUser' with the username of the user you want to test
        fetch(url('/headline/newuser'), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            }
        }).then(res => res.json()).then(res => {
            expect(res.username).toEqual('newuser');
            expect(res.headline).toBeDefined(); // Check if the headline property exists
            done();
        });
    });

    it('update user headline', done => {
        const newHeadline = { headline: 'New headline' };
        fetch(url('/headline'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            },
            body: JSON.stringify(newHeadline)
        }).then(res => res.json()).then(res => {
            expect(res.username).toEqual('newuser');
            expect(res.headline).toEqual('New headline');
            done();
        });
    });

    // Add more tests as needed for other endpoints

    afterAll(done => {
        // Logout or clean up as needed
        done();
    });

});
