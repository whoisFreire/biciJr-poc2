const { CardFactory, MessageFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, ChoicePrompt } = require('botbuilder-dialogs');
const { WATERFALL_MENU_DIALOG, MENU_CHOICE } = require('../constants/PromptsDialogsId');
const luis = require('../utils/isReturnLuis');

class MenuDialog extends ComponentDialog {
    constructor() {
        super('MenuDialog');

        this.addDialog(new ChoicePrompt(MENU_CHOICE, this.menuValidator.bind(this)));
        this.addDialog(new WaterfallDialog(WATERFALL_MENU_DIALOG, [
            this.menuStep.bind(this),
            this.handleMenuStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_MENU_DIALOG;
    }

    async menuStep(stepContext) {
        const options = [
            'Tipo',
            'Cor',
            'Gênero',
            'Preço'
        ];

        const card = CardFactory.heroCard(undefined, undefined, options, { text: 'Escolha um dos filtros para pesquisar pela bicicleta:' });
        const prompt = MessageFactory.attachment(card);
        return await stepContext.prompt(MENU_CHOICE, { prompt });
    }

    async menuValidator(stepContext) {
        const luisReturn = luis.isReturnLuis(stepContext.context.luis);

        const entityType = luisReturn.entity.type;

        if (!entityType) {
            stepContext.context.sendActivity('opção inválida, tente novamente.');
            return !!entityType;
        }
        return !!entityType;
    }

    async handleMenuStep(stepContext) {
        const luisReturn = luis.isReturnLuis(stepContext.context.luis);

        const entityType = luisReturn.entity.type;
        if (entityType === 'type') {
            return stepContext.replaceDialog('TypeDialog');
        }
        if (entityType === 'gender') {
            return stepContext.replaceDialog('GenderDialog');
        }
        if (entityType === 'color') {
            return stepContext.replaceDialog('ColorDialog');
        }
        if (entityType === 'price') {
            return stepContext.replaceDialog('PriceDialog');
        }
    }
}
module.exports.MenuDialog = MenuDialog;
