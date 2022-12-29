/* eslint-disable no-undef */
const { ComponentDialog } = require('botbuilder-dialogs');
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { MenuDialog } = require('../../dialogs/menuDialog');
const assert = require('assert');
const sinon = require('sinon');
const luis = require('../../utils/isReturnLuis');

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

describe('MenuDialog', () => {
    describe('opcao Tipo', () => {
        let stubLuis, client;

        beforeEach(() => {
            const sut = new MockComponent(
                new MenuDialog(),
                'TypeDialog'
            );

            stubLuis = sinon.stub(luis, 'isReturnLuis');
            client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);
        });

        afterEach(() => {
            sinon.restore();
        });

        it('Deve retornar o menu de filtro', async () => {
            const reply = await client.sendActivity('oi');

            assert.strictEqual(reply.attachments[0].content.text, 'Escolha um dos filtros para pesquisar pela bicicleta:');
        });

        it('Deve retornar o menu de Tipo ao escolher opcao "tipo"', async () => {
            stubLuis.returns({
                entity: {
                    type: 'type'
                }
            });

            let reply = await client.sendActivity('oi');
            reply = await client.sendActivity('tipo');
            assert.strictEqual(reply.text, 'BEGIN_TypeDialog');
        });

        it('Deve retornar mensagem de erro ao digitar uma opcao invalida', async () => {
            stubLuis.returns({
                entity: {
                    type: undefined
                }
            });

            let reply = await client.sendActivity('oi');
            reply = await client.sendActivity('batata');
            assert.strictEqual(reply.text, 'opção inválida, tente novamente.');
        });
    });

    describe('opcao cor', () => {
        beforeEach(() => {
            const sut = new MockComponent(
                new MenuDialog(),
                'ColorDialog'
            );

            stubLuis = sinon.stub(luis, 'isReturnLuis');
            client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);
        });

        afterEach(() => {
            sinon.restore();
        });

        it('Deve retornar o menu de Cor ao escolher opcao "cor"', async () => {
            let reply = await client.sendActivity('oi');
            stubLuis.returns({
                entity: {
                    type: 'color'
                }
            });
            reply = await client.sendActivity('cor');
            assert.strictEqual(reply.text, 'BEGIN_ColorDialog');
        });
    });

    describe('opcao gênero', async () => {
        beforeEach(() => {
            const sut = new MockComponent(
                new MenuDialog(),
                'GenderDialog'
            );

            stubLuis = sinon.stub(luis, 'isReturnLuis');
            client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);
        });

        afterEach(() => {
            sinon.restore();
        });

        it('Deve retornar o menu de Gênero ao escolher opcao "genero"', async () => {
            let reply = await client.sendActivity('oi');
            stubLuis.returns({
                entity: {
                    type: 'gender'
                }
            });
            reply = await client.sendActivity('genero');
            assert.strictEqual(reply.text, 'BEGIN_GenderDialog');
        });
    });

    describe('opcao preço', () => {
        beforeEach(() => {
            const sut = new MockComponent(
                new MenuDialog(),
                'PriceDialog'
            );

            stubLuis = sinon.stub(luis, 'isReturnLuis');
            client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);
        });

        afterEach(() => {
            sinon.restore();
        });

        it('Deve retornar o menu de Preço ao escolher opcao "preco"', async () => {
            let reply = await client.sendActivity('oi');
            stubLuis.returns({
                entity: {
                    type: 'price'
                }
            });
            reply = await client.sendActivity('preco');
            assert.strictEqual(reply.text, 'BEGIN_PriceDialog');
        });
    });
});
