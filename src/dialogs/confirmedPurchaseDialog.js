const { CardFactory, MessageFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, ChoicePrompt } = require('botbuilder-dialogs');
const { WATERFALL_CONFIRMED_PURCHASE_DIALOG, PURCHASE_METHOD_CHOICE } = require('../constants/PromptsDialogsId');

class ConfirmedPurchaseDialog extends ComponentDialog {
    constructor(userState) {
        super('ConfirmedPurchaseDialog');

        this.userProfile = userState.createProperty('userProfile');

        this.addDialog(new WaterfallDialog(WATERFALL_CONFIRMED_PURCHASE_DIALOG, [
            this.purchaseMethod.bind(this),
            this.cepStep.bind(this)
        ]))
            .addDialog(new ChoicePrompt(PURCHASE_METHOD_CHOICE, this.paymentValidator.bind(this)));
    }

    async purchaseMethod(stepContext) {
        const options = ['Boleto', 'Cartão de Crédito', 'PIX'];
        const card = CardFactory.heroCard(undefined, undefined, options, undefined);
        const prompt = MessageFactory.attachment(card);
        stepContext.context.sendActivity('Boa escolha! Falta pouco para você finalizar a compra da sua bicicleta.');
        stepContext.context.sendActivity('Escolha o método de pagamento:');
        return stepContext.prompt(PURCHASE_METHOD_CHOICE, { prompt });
    }

    async paymentValidator(stepContext) {
        const { entity } = stepContext.context.luis;
        return entity.type === 'payment';
    }

    async cepStep(stepContext) {
        const userProfile = await this.userProfile.get(stepContext.context);
        userProfile.paymentMethod = stepContext.context.luis.text;
        await this.userProfile.set(stepContext.context, userProfile);
        return stepContext.replaceDialog('AddressDialog');
    }
}
module.exports.ConfirmedPurchaseDialog = ConfirmedPurchaseDialog;
