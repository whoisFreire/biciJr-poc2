/* eslint-disable no-undef */
const { describe } = require('mocha');
const luis = require('../../utils/isReturnLuis');
const assert = require('assert');

describe('isReturnLuis Util', () => {
    it('deve retornar o valor de entrada do luis', () => {
        const result = luis.isReturnLuis({
            entity: {
                type: 'teste'
            }
        });

        assert.deepStrictEqual(result, {
            entity: {
                type: 'teste'
            }
        });
    });
});
