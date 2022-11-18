const { ComponentDialog, WaterfallDialog } = require('botbuilder-dialogs');
const { WATERFALL_GREETING_DIALOG } = require('../constants/PromptsDialogsId');

class GreetingDialog extends ComponentDialog {
    constructor() {
        super('GreetingDialog');

        this.addDialog(new WaterfallDialog(WATERFALL_GREETING_DIALOG, [
            this.greetingStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_GREETING_DIALOG;
    }

    async greetingStep(stepContext) {
        await stepContext.context.sendActivities([
            { type: 'message', text: 'Oi! Eu sou o **Bici JR**, sou craque em pedaladas e vou funcionar como um guidão para te guiar na sua busca! 🚴' },
            { type: 'delay', value: 1000 },
            { type: 'message', text: 'Para isso, vou dar algumas opções para você encontrar sua bike e, se assim desejar, poderá comprar ao final.' }
        ]);

        return stepContext.replaceDialog('MenuDialog');
    }
}
module.exports.GreetingDialog = GreetingDialog;
