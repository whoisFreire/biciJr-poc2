const { CardFactory, MessageFactory } = require('botbuilder');
const { ComponentDialog, ChoicePrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { WATERFALL_PRICE_DIALOG, MENU_PRICE_CHOICE } = require('../constants/PromptsDialogsId');

class PriceDialog extends ComponentDialog {
    constructor() {
        super('PriceDialog');

        this.addDialog(new ChoicePrompt(MENU_PRICE_CHOICE, this.menuValidator.bind(this)))
            .addDialog(new WaterfallDialog(WATERFALL_PRICE_DIALOG, [
                this.menuPriceStep.bind(this),
                this.handleDialog.bind(this)
            ]));

        this.initialDialogId = WATERFALL_PRICE_DIALOG;
    }

    async menuPriceStep(stepContext) {
        const options = ['Até R$ 500,00', 'De R$ 500,00 até R$ 1500,00', 'De R$ 1500,00 até R$ 3000,00', 'Mais de R$ 3000,00', 'Explorar outro filtro de pesquisa'];
        const card = CardFactory.heroCard(undefined, undefined, options);
        const prompt = MessageFactory.attachment(card);
        stepContext.context.sendActivity('Quanto você pretende investir na sua bicicleta? 🚲 **Escolha** entre as **faixas de preço** abaixo:');

        return stepContext.prompt(MENU_PRICE_CHOICE, { prompt });
    }

    async menuValidator(stepContext) {
        const options = ['Até R$ 500,00', 'De R$ 500,00 até R$ 1500,00', 'De R$ 1500,00 até R$ 3000,00', 'Mais de R$ 3000,00', 'Explorar outro filtro de pesquisa'];
        const choiced = stepContext.context.activity.text;

        return options.includes(choiced);
    }

    async handleDialog(stepContext) {
        const choiced = stepContext.context.activity.text;
        if (new RegExp(/(Explorar outro filtro de Pesquisa)/, 'i').test(choiced)) {
            return stepContext.replaceDialog('MenuDialog');
        }
        return stepContext.replaceDialog('BikeCardDialog', { filter: 'price', subfilter: choiced });
    }
}
module.exports.PriceDialog = PriceDialog;
