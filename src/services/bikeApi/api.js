const axios = require('axios');

class Api {
    constructor() {
        this.api = axios.create({
            baseURL: 'https://pb-bikes-api.herokuapp.com'
        });
    }

    async fetch() {
        try {
            const response = await this.api.get('/bike/list');
            return response;
        } catch (err) {
            throw new Error(err);
        }
    }
}
module.exports.Api = Api;
