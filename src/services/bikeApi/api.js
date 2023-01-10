const axios = require('axios');

class Api {
    async fetch() {
        try {
            const response = await axios.get('https://pb-bikes-api.herokuapp.com/bike/list');

            return response;
        } catch (err) {
            throw new Error(err);
        }
    }
}
module.exports.Api = Api;
