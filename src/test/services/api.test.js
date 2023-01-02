/* eslint-disable no-undef */
const { default: axios } = require('axios');
const { beforeEach, describe, afterEach } = require('mocha');
const Sinon = require('sinon');
const assert = require('assert');
const bikes = require('../data/bikeData');

describe('BikeApi/api', () => {
    let apiStub;
    beforeEach(() => {
        apiStub = Sinon.stub(axios, 'get');
    });

    afterEach(() => {
        Sinon.restore();
    });

    it('deve retornar o result da requisicao', async () => {
        const result = apiStub.resolves({ data: bikes });
        assert.deepStrictEqual(result, { data: bikes });
    });
});
