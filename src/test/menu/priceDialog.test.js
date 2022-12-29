/* eslint-disable no-undef */
const { ComponentDialog } = require('botbuilder-dialogs');
const { DialogTestClient } = require('botbuilder-testing');
const { describe, beforeEach } = require('mocha');
const assert = require('assert');
const { PriceDialog } = require('../../dialogs/priceDialog');
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

describe('PriceDialog', () => {
    let client;

    beforeEach(() => {
        const sut = new MockComponent(
            new PriceDialog(),
            'BikeCardDialog',
            'MenuDialog'
        );

        client = new DialogTestClient('test', sut);
    });

    it('deve mostrar a opcao de filtro de Genero', async () => {
        const reply = await client.sendActivity('oi');
        assert.strictEqual(reply.text, 'Quanto você pretende investir na sua bicicleta? 🚲 **Escolha** entre as **faixas de preço** abaixo:');
    });

    it('deve mostrar mensagem de opcao invalida ao digitar uma opcao invalida', async () => {
        let reply = await client.sendActivity('oi');
        await client.sendActivity('banana');
        reply = await client.getNextReply();

        assert.strictEqual(reply.text, 'opção inválida, tente novamente.');
    });

    it('deve mostrar o menu inicial ao escolher a opcao "explorar outro filtro de pesquisa', async () => {
        let reply = await client.sendActivity('oi');
        await client.sendActivity('Explorar outro filtro de pesquisa');
        reply = await client.getNextReply();
        assert.strictEqual(reply.text, 'BEGIN_MenuDialog');
    });

    describe('opcao "Até R$ 500,00"', async () => {
        it('Deve avançar para o dialog de card', async () => {
            let reply = await client.sendActivity('oi');
            await client.sendActivity('Até R$ 500,00');
            reply = await client.getNextReply();
            assert.strictEqual(reply.text, 'BEGIN_BikeCardDialog');
        });
    });
});
