/* eslint-disable no-undef */
const { DialogTestClient } = require('botbuilder-testing');
const { describe } = require('mocha');
const { GreetingDialog } = require('../dialogs/greetingDialog');
const assert = require('assert');
const { ComponentDialog } = require('botbuilder-dialogs');

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

describe('GreetingDialog', () => {
    it('deve retornar mensagem de boas vindas', async () => {
        const sut = new MockComponent(
            new GreetingDialog(),
            'MenuDialog'
        );

        // const sut = new GreetingDialog();
        const client = new DialogTestClient('test', sut);
        let reply = await client.sendActivity('oi');

        assert.strictEqual(reply.text, 'Oi! Eu sou o **Bici JR**, sou craque em pedaladas e vou funcionar como um guidão para te guiar na sua busca! 🚴');
        reply = client.getNextReply();
        assert.strictEqual(reply.text, 'Para isso, vou dar algumas opções para você encontrar sua bike e, se assim desejar, poderá comprar ao final.');
        reply = client.getNextReply();
        assert.strictEqual(reply.text, 'BEGIN_MenuDialog');
    });
});
