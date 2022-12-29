const { CardFactory, MessageFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, ChoicePrompt } = require('botbuilder-dialogs');
const { WATERFALL_TYPE_DIALOG, MENU_TYPE_CHOICE } = require('../constants/PromptsDialogsId');

class TypeDialog extends ComponentDialog {
    constructor() {
        super('TypeDialog');

        this.addDialog(new ChoicePrompt(MENU_TYPE_CHOICE, this.menuValidator.bind(this)));
        this.addDialog(new WaterfallDialog(WATERFALL_TYPE_DIALOG, [
            this.typeMenuStep.bind(this),
            this.handleDialog.bind(this)
        ]));

        this.initialDialogId = WATERFALL_TYPE_DIALOG;
    }

    async typeMenuStep(stepContext) {
        const options = ['Infantil', 'Casual', 'Estrada', 'Mountain Bike', 'Elétrica', 'Explorar outro filtro de pesquisa'];
        const card = CardFactory.heroCard(undefined, undefined, options, { text: 'Qual opção está procurando?' });
        const prompt = MessageFactory.attachment(card);

        stepContext.context.sendActivity('Boa escolha! Vem comigo para selecionar a sua magrela. 🚲');
        return stepContext.prompt(MENU_TYPE_CHOICE, { prompt });
    }

    async menuValidator(stepContext) {
        const options = ['Infantil', 'Casual', 'Estrada', 'Mountain Bike', 'Elétrica', 'Explorar outro filtro de pesquisa'];
        const choiced = stepContext.context.activity.text;

        if (!options.includes(choiced)) {
            stepContext.context.sendActivity('opção inválida, tente novamente.');
            return options.includes(choiced);
        }
        return options.includes(choiced);
    }

    async handleDialog(stepContext) {
        const choiced = stepContext.context.activity.text;
        if (new RegExp(/(Explorar outro filtro de Pesquisa)/, 'i').test(choiced)) {
            return stepContext.replaceDialog('MenuDialog');
        }
        return stepContext.replaceDialog('BikeCardDialog', { filter: 'type', subfilter: choiced });
    }
}
module.exports.TypeDialog = TypeDialog;
