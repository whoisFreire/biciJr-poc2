const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const { WATERFALL_PURCHASED_DIALOG } = require('../constants/PromptsDialogsId');

class PurchasedDialog extends ComponentDialog {
    constructor(userState) {
        super('PurchasedDialog');

        this.userProfile = userState.createProperty('userProfile');

        this.addDialog(new WaterfallDialog(WATERFALL_PURCHASED_DIALOG, [
            this.showIdProtocol.bind(this)
        ]));
    }

    async showIdProtocol(stepContext) {
        const idProtocol = Math.floor(Math.random() * 10000000);
        stepContext.context.sendActivity(`Parabéns! Você acabou de finalizar a sua compra. Este é o número do seu pedido: ${ idProtocol }`);
        return stepContext.replaceDialog('FinalDialog');
    }
}
module.exports.PurchasedDialog = PurchasedDialog;
