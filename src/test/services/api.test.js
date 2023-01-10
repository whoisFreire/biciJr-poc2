/* eslint-disable no-undef */
const assert = require('chai').assert;
const axios = require('axios');
const { beforeEach, describe, afterEach } = require('mocha');
const Sinon = require('sinon');
const bikes = require('../data/bikeData');
const { Api } = require('../../services/bikeApi/api');

describe('BikeApi/api', () => {
    let apiStub;
    beforeEach(() => {
        apiStub = Sinon.stub(axios, 'get');
    });

    afterEach(() => {
        Sinon.restore();
    });

    it('deve retornar o result da requisicao', async () => {
        const expected = { data: bikes, statusText: 'OK' };
        apiStub.resolves(expected);
        const result = await Api.prototype.fetch();
        assert.equal(result, expected);
    });

    it('deve retornar um erro caso ocorra um erro na requisicao', async () => {
        apiStub.throws();
        assert.throws();
    });
});
