/* eslint-disable no-undef */
const { describe, beforeEach, afterEach } = require('mocha');
const Sinon = require('sinon');
const { BikeApi } = require('../../services/bikeApi');
const bikes = require('../data/bikeData');
const assert = require('assert');
const { getBikes } = require('../../utils/filterBikes');

describe('filterBikes', () => {
    let stubAxios;
    const bike500 = {
        id: 8,
        name: 'Max Force',
        brand: 'Status',
        price: 427.71,
        size: 15,
        rim: 16,
        gear: '1v',
        description: 'Gênero: Masculino Idade recomendada: De 4 a 6 anos Peso suportado: Até 60kg Quadro: Aço carbono Garfo: Rígido Marchas: Sem marchas Suporte de guidão: Aço 21.1mm Aros: Aluminio Simples Cubos: Aço- Freio: V-Brake Nylon Movimento central: 45mm Direcao: 21.1mm Guidão: Aço down hill Pedal: Nylon Pedivela: Monobloco 115mm Selim: MTB Pneus: 16 MTB INFORMAÇÕES IMPORTANTES: A bicicleta vai montada mas, por motivo de acomodação em embalagem para transporte, são retirados pedais, guidão, selim e roda dianteira.',
        type: 'Infantil',
        suspension: 'Sem suspensão',
        gender: 'Masculino',
        color: 'Verde',
        image: 'https://a-static.mlcdn.com.br/800x560/bicicleta-infantil-aro-16-status-max-force-status-bike/x-bikes/096816/62e821313a172da48d91b6ccdaf8368c.jpg'
    };

    beforeEach(() => {
        stubAxios = Sinon.stub(BikeApi, 'fetch');
    });

    afterEach(() => {
        Sinon.restore();
    });

    it('deve retornar a bike filtrada de acordo com o filtro passado', async () => {
        stubAxios.resolves({ data: bikes });
        const expec = await getBikes('price', 'Até R$ 500,00');
        assert.deepStrictEqual(expec[0], bike500);
    });
});
