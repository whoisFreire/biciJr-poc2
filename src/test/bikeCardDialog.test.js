/* eslint-disable no-undef */
const { ComponentDialog } = require('botbuilder-dialogs');
const { DialogTestClient } = require('botbuilder-testing');
const { describe, beforeEach, afterEach } = require('mocha');
const Sinon = require('sinon');
const { BikeCardDialog } = require('../dialogs/bikeCardDialog');
const bikes = require('../utils/filterBikes');
const assert = require('assert');
const { UserState, MemoryStorage } = require('botbuilder');
const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);

class MockComponent extends ComponentDialog {
    constructor(testDialog, ...mockDialogsId) {
        super('component');
        this.addDialog(testDialog);
        this.initialDialogId = testDialog.id;
        for (const dialog of mockDialogsId) {
            this.addDialog(new FakeDialog(dialog));
        }
    }
}

class FakeDialog extends ComponentDialog {
    async onBeginDialog(innerDC) {
        await innerDC.context.sendActivity('BEGIN_' + this.id);
        return innerDC.endDialog();
    }
}

describe('BikeCardDialog', () => {
    let client, stubBikes;

    beforeEach(() => {
        const sut = new MockComponent(
            new BikeCardDialog(userState),
            'BikeCardDialog',
            'MenuDialog'
        );

        stubBikes = Sinon.stub(bikes, 'getBikes');
        stubUserProfile = Sinon.stub(userState, 'get');
        client = new DialogTestClient('test', sut, { filter: 'price', subfilter: 'Até R$ 500,00' });
    });

    afterEach(() => {
        Sinon.restore();
    });

    it('deve mostrar o card de bicicleta', async () => {
        stubBikes.returns(['teste']);
        const reply = await client.sendActivity('oi');
        assert.strictEqual(reply.text, 'Tenho certeza que você vai gostar das bikes que eu encontrei!');
    });

    it('deve mostrar mensagem de fallback caso nao exista bikes para a opcao desejada', async () => {
        stubBikes.returns([]);
        const reply = await client.sendActivity('oi');
        assert.strictEqual(reply.text, 'infelizmente nao temos bikes com esse tipo de filtro');
    });
});
