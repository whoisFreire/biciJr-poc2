const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const { WATERFALL_BUY_INFO_DIALOG, CONFIRM_PURCHASE_TEXT_PROMPT } = require('../constants/PromptsDialogsId');

class BuyInfosDialog extends ComponentDialog {
    constructor(userState) {
        super('BuyInfosDialog');

        this.userProfile = userState.createProperty('userProfile');

        this.addDialog(new WaterfallDialog(WATERFALL_BUY_INFO_DIALOG, [
            this.showCart.bind(this),
            this.confirmPurchase.bind(this),
            this.handleDialog.bind(this)
        ]))
            .addDialog(new TextPrompt(CONFIRM_PURCHASE_TEXT_PROMPT, this.confirmValidator.bind(this)));
    }

    async showCart(stepContext) {
        const INITIAL_VALUE = 0;
        const DATE_POSITION = 0;

        const acessor = await this.userProfile.get(stepContext.context);

        const cart = acessor.cart.map(item => item.name);
        const bikeNames = cart.join('\n\n');
        const bikeValues = acessor.cart.map(item => item.price);
        const totalBikeValue = bikeValues.reduce((previous, next) => previous + next, INITIAL_VALUE);

        const date = new Date().toLocaleString('pt-BR');
        const formatedDate = date.split(' ')[DATE_POSITION];

        stepContext.context.sendActivity(`Este é o seu carrinho de compras. Os valores são válidos para **${ formatedDate }**.

${ bikeNames }
        
**Valor total: ${ totalBikeValue }**
        `);
        return stepContext.next();
    }

    async confirmPurchase(stepContext) {
        return stepContext.prompt(CONFIRM_PURCHASE_TEXT_PROMPT, 'Posso **confirmar e prosseguir** com a sua compra?');
    }

    async confirmValidator(stepContext) {
        const { entity } = stepContext.context.luis;

        return entity.type === 'yes';
    }

    async handleDialog(stepContext) {
        const { entity } = stepContext.context.luis;
        if (entity.type === 'yes') {
            return stepContext.replaceDialog('ConfirmedPurchaseDialog');
        }
    }
}
module.exports.BuyInfosDialog = BuyInfosDialog;
