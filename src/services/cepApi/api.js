const axios = require('axios');

class Api {
    constructor() {
        this.api = axios.create({
            baseURL: 'https://viacep.com.br/'
        });
    }

    async fetch(cep) {
        try {
            const response = await this.api.get(`/ws/${ cep }/json`);
            return response;
        } catch (err) {
            throw new Error(err);
        }
    }
}
module.exports.Api = Api;
