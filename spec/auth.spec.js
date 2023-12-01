require('es6-promise').polyfill();
require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`;

describe('Validate Auth functionality', () => {

    let cookie;

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

    it('register new user', done => {
        const regUser = { username: 'newuser1', password: 'pass1234', email: 'newuser1@example.com', dob: '2000-01-01', phone: '1234567890', zipcode: '12345' };
        fetch(url('/register'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(regUser)
        }).then(res => res.json()).then(res => {
            expect(res.username).toEqual('newuser1');
            expect(res.result).toEqual('success');
            done();
        });
    });

    it('login user', done => {
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

    it('logout user', done => {

        fetch(url('/logout'), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookie
            }
        }).then(res => {
            expect(res.status).toBe(200);
            done();
        });
    });

});
