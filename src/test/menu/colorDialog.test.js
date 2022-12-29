/* eslint-disable no-undef */
const { ComponentDialog } = require('botbuilder-dialogs');
const { DialogTestClient } = require('botbuilder-testing');
const { describe, beforeEach } = require('mocha');
const { ColorDialog } = require('../../dialogs/colorDialog');
const assert = require('assert');
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

describe('ColorDialog', () => {
    let client;

    beforeEach(() => {
        const sut = new MockComponent(
            new ColorDialog(),
            'BikeCardDialog',
            'MenuDialog'
        );

        client = new DialogTestClient('test', sut);
    });

    it('deve mostrar a opcao de filtro de cor', async () => {
        const reply = await client.sendActivity('oi');
        assert.strictEqual(reply.text, 'Qual a cor que você quer para a sua bicicleta? 🚲');
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

    describe('opcao Branca', async () => {
        it('Deve avançar para o dialog de card', async () => {
            let reply = await client.sendActivity('oi');
            await client.sendActivity('Branco');
            reply = await client.getNextReply();
            assert.strictEqual(reply.text, 'BEGIN_BikeCardDialog');
        });
    });
});
