const { CardFactory, MessageFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, ChoicePrompt } = require('botbuilder-dialogs');
const { WATERFALL_COLOR_DIALOG, MENU_COLOR_CHOICE } = require('../constants/PromptsDialogsId');

class ColorDialog extends ComponentDialog {
    constructor() {
        super('ColorDialog');

        this.addDialog(new ChoicePrompt(MENU_COLOR_CHOICE, this.menuValidator.bind(this)));
        this.addDialog(new WaterfallDialog(WATERFALL_COLOR_DIALOG, [
            this.colorMenuStep.bind(this),
            this.handleDialog.bind(this)
        ]));

        this.initialDialogId = WATERFALL_COLOR_DIALOG;
    }

    async colorMenuStep(stepContext) {
        const options = ['Branco', 'Preto', 'Azul', 'Rosa', 'Verde', 'Vermelha', 'Outras cores', 'Explorar outro filtro de pesquisa'];
        const card = CardFactory.heroCard(undefined, undefined, options, { text: 'Escolha entre as cores abaixo:' });
        const prompt = MessageFactory.attachment(card);
        stepContext.context.sendActivity('Qual a cor que você quer para a sua bicicleta? 🚲');
        return stepContext.prompt(MENU_COLOR_CHOICE, { prompt });
    }

    async menuValidator(stepContext) {
        const options = ['Branco', 'Preto', 'Azul', 'Rosa', 'Verde', 'Vermelha', 'Outras cores', 'Explorar outro filtro de pesquisa'];
        const choiced = stepContext.context.activity.text;
        return options.includes(choiced);
    }

    async handleDialog(stepContext) {
        const choiced = stepContext.context.activity.text;
        if (new RegExp(/(Explorar outro filtro de Pesquisa)/, 'i').test(choiced)) {
            return stepContext.replaceDialog('MenuDialog');
        }
        return stepContext.replaceDialog('BikeCardDialog', { filter: 'color', subfilter: choiced });
    }
}
module.exports.ColorDialog = ColorDialog;
