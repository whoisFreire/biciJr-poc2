const { CardFactory, MessageFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, ChoicePrompt } = require('botbuilder-dialogs');
const { WATERFALL_MENU_DIALOG, MENU_CHOICE } = require('../constants/PromptsDialogsId');
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
        const { entity } = stepContext.context.luis;
        if (!entity) {
            stepContext.context.sendActivity('opção inválida, tente novamente.');
            return !!entity;
        }
        return !!entity;
    }

    async handleMenuStep(stepContext) {
        const { entity } = stepContext.context.luis;
        const entityType = entity.type;
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
