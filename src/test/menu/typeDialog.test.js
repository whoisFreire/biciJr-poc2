/* eslint-disable no-undef */
const { ComponentDialog } = require('botbuilder-dialogs');
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { describe, beforeEach } = require('mocha');
const { TypeDialog } = require('../../dialogs/typeDialog');
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

describe('TypeDialog', () => {
    let client;

    beforeEach(() => {
        const sut = new MockComponent(
            new TypeDialog(),
            'BikeCardDialog'
        );

        client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);
    });

    it('deve mostrar a opcao de filtro de tipo', async () => {
        const reply = await client.sendActivity('oi');
        assert.strictEqual(reply.text, 'Boa escolha! Vem comigo para selecionar a sua magrela. 🚲');
    });

    it('deve mostrar mensagem de opcao invalida ao digitar uma opcao invalida', async () => {
        let reply = await client.sendActivity('oi');
        await client.sendActivity('banana');
        reply = await client.getNextReply();

        assert.strictEqual(reply.text, 'opção inválida, tente novamente.');
    });

    describe('opcao Infantil', async () => {
        it('Deve avançar para o dialog de card', async () => {
            let reply = await client.sendActivity('oi');
            await client.sendActivity('Infantil');
            reply = await client.getNextReply();
            assert.strictEqual(reply.text, 'BEGIN_BikeCardDialog');
        });
    });
});
