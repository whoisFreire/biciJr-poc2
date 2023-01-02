const { CardFactory, MessageFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, ChoicePrompt, TextPrompt } = require('botbuilder-dialogs');
const { WATERFALL_FINAL_DIALOG, MENU_FINAL_CHOICE, BAD_RESPONSE_FINAL_CHOICE } = require('../constants/PromptsDialogsId');

class FinalDialog extends ComponentDialog {
    constructor() {
        super('FinalDialog');

        this.addDialog(new TextPrompt(BAD_RESPONSE_FINAL_CHOICE));
        this.addDialog(new ChoicePrompt(MENU_FINAL_CHOICE, this.choiceValidator.bind(this)));
        this.addDialog(new WaterfallDialog(WATERFALL_FINAL_DIALOG, [
            this.congratulationsMessage.bind(this),
            this.ratingFlow.bind(this),
            this.handleChoice.bind(this),
            this.exitDialog.bind(this)
        ]));

        this.initialDialogId = WATERFALL_FINAL_DIALOG;
    }

    async congratulationsMessage(stepContext) {
        stepContext.context.sendActivity('Antes de encerrar, eu gostaria de saber se foi tudo bem na nossa conversa ou se em algum momento o meu pneu furou...');
        return stepContext.next();
    }

    async ratingFlow(stepContext) {
        stepContext.context.sendActivity('Como você **avalia** o meu atendimento?');

        const options = ['5 - Amei muito ❤️', '4 - Gostei 😃', '3 - Nem amei, nem odiei 😐', '2 - Poderia melhorar ☹️', '1 - Não gostei 😡'];
        const card = CardFactory.heroCard(undefined, undefined, options, undefined);
        const prompt = MessageFactory.attachment(card);
        return stepContext.prompt(MENU_FINAL_CHOICE, { prompt });
    }

    async choiceValidator(stepContext) {
        const options = ['5 - Amei muito ❤️', '4 - Gostei 😃', '3 - Nem amei, nem odiei 😐', '2 - Poderia melhorar ☹️', '1 - Não gostei 😡'];
        const choiced = stepContext.context.activity.text;

        if (!options.includes(choiced)) {
            stepContext.context.sendActivity('opção inválida, tente novamente.');
            return options.includes(choiced);
        }

        return options.includes(choiced);
    }

    async handleChoice(stepContext) {
        const DIVIDER = '-';
        const VALUE_POSITION = 0;
        const result = stepContext.context.activity.text;
        const ratingValue = result.split(DIVIDER)[VALUE_POSITION];

        if (ratingValue >= 1 && ratingValue <= 3) {
            return stepContext.prompt(BAD_RESPONSE_FINAL_CHOICE, 'Que pena! 😞 Lamento não ter atingido suas expectativas! Como meu atendimento **poderia ser melhor?**');
        }

        stepContext.context.sendActivity('Muito obrigado pela avaliação! 👍 Adorei falar com você!');
        stepContext.context.sendActivity('Qualquer dúvida para comprar sua bike, estou sempre por aqui!');
        return stepContext.endDialog();
    }

    async exitDialog(stepContext) {
        stepContext.context.sendActivity('Obrigado pelo feedback, isso vai ajudar a me tornar um assistente virtual melhor. Até a próxima!');
        return stepContext.endDialog();
    }
}
module.exports.FinalDialog = FinalDialog;
