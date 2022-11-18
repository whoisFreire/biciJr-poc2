const { CardFactory, MessageFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, ChoicePrompt } = require('botbuilder-dialogs');
const { WATERFALL_GENDER_DIALOG, MENU_GENDER_CHOICE } = require('../constants/PromptsDialogsId');

class GenderDialog extends ComponentDialog {
    constructor() {
        super('GenderDialog');

        this.addDialog(new ChoicePrompt(MENU_GENDER_CHOICE, this.menuValidator.bind(this)));
        this.addDialog(new WaterfallDialog(WATERFALL_GENDER_DIALOG, [
            this.genderMenuStep.bind(this),
            this.handleDialog.bind(this)
        ]));

        this.initialDialogId = WATERFALL_GENDER_DIALOG;
    }

    async genderMenuStep(stepContext) {
        const options = ['Unissex', 'Masculino', 'Feminino', 'Explorar outro filtro de pesquisa'];
        const card = CardFactory.heroCard(undefined, undefined, options);
        const prompt = MessageFactory.attachment(card);
        stepContext.context.sendActivity('Legal! Então me diz **para quem** é a magrela que você está procurando? 🚲');
        return stepContext.prompt(MENU_GENDER_CHOICE, { prompt });
    }

    async menuValidator(stepContext) {
        const options = ['Unissex', 'Masculino', 'Feminino', 'Explorar outro filtro de pesquisa'];
        const choiced = stepContext.context.activity.text;

        return options.includes(choiced);
    }

    async handleDialog(stepContext) {
        const choiced = stepContext.context.activity.text;
        if (new RegExp(/(Explorar outro filtro de Pesquisa)/, 'i').test(choiced)) {
            return stepContext.replaceDialog('MenuDialog');
        }
        return stepContext.replaceDialog('BikeCardDialog', { filter: 'gender', subfilter: choiced });
    }
}
module.exports.GenderDialog = GenderDialog;
