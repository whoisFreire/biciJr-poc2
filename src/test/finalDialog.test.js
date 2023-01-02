/* eslint-disable no-undef */
const { ComponentDialog } = require('botbuilder-dialogs');
const { DialogTestClient } = require('botbuilder-testing');
const { describe, beforeEach } = require('mocha');
const { FinalDialog } = require('../dialogs/finalDialog');
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

describe('FinalDialog', () => {
    let client;

    beforeEach(() => {
        const sut = new MockComponent(
            new FinalDialog(),
            'MainDialog'
        );

        client = new DialogTestClient('test', sut);
    });

    it('deve apresentar dialog de pesquisa de encerramento', async () => {
        const reply = await client.sendActivity('oi');
        assert.strictEqual(reply.text, 'Antes de encerrar, eu gostaria de saber se foi tudo bem na nossa conversa ou se em algum momento o meu pneu furou...');
    });

    it('deve mostrar o card com as opcoes de avaliacao', async () => {
        await client.sendActivity('oi');
        const reply = await client.getNextReply();
        assert.strictEqual(reply.text, 'Como você **avalia** o meu atendimento?');
    });

    it('deve mostrar mensagem de opcao invalida', async () => {
        await client.sendActivity('oi');
        await client.getNextReply();
        await client.getNextReply();
        const reply = await client.sendActivity('banana');
        assert.strictEqual(reply.text, 'opção inválida, tente novamente.');
    });

    it('deve mostrar texto de lamentacao ao escolher note entre 1 e 3', async () => {
        await client.sendActivity('oi');
        await client.getNextReply();
        await client.getNextReply();
        const reply = await client.sendActivity('3 - Nem amei, nem odiei 😐');
        assert.strictEqual(reply.text, 'Que pena! 😞 Lamento não ter atingido suas expectativas! Como meu atendimento **poderia ser melhor?**');
    });

    it('deve mostrar texto de agradecimento ao explicar a nota entre 1 e 3', async () => {
        await client.sendActivity('oi');
        await client.getNextReply();
        await client.getNextReply();
        await client.sendActivity('3 - Nem amei, nem odiei 😐');
        const reply = await client.sendActivity('teste');
        assert.strictEqual(reply.text, 'Obrigado pelo feedback, isso vai ajudar a me tornar um assistente virtual melhor. Até a próxima!');
    });

    it('deve mostrar mensagem de agradecimento caso note seja maior que 3', async () => {
        await client.sendActivity('oi');
        await client.getNextReply();
        await client.getNextReply();
        const reply = await client.sendActivity('5 - Amei muito ❤️');
        assert.strictEqual(reply.text, 'Muito obrigado pela avaliação! 👍 Adorei falar com você!');
    });
});
