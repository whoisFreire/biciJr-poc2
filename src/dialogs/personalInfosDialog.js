const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const { WATERFALL_PERSONAL_INFOS_DIALOG, FULLNAME_TEXT_PROMPT, CPF_TEXT_PROMPT, PHONE_TEXT_PROMPT, CONFIRM_INFOS_TEXT_PROMPT } = require('../constants/PromptsDialogsId');

class PersonalInfosDialog extends ComponentDialog {
    constructor(userState) {
        super('PersonalInfosDialog');

        this.userProfile = userState.createProperty('userProfile');

        this.addDialog(new WaterfallDialog(WATERFALL_PERSONAL_INFOS_DIALOG, [
            this.fullname.bind(this),
            this.cpf.bind(this),
            this.phone.bind(this),
            this.confirmInfos.bind(this)
        ]))
            .addDialog(new TextPrompt(FULLNAME_TEXT_PROMPT))
            .addDialog(new TextPrompt(CPF_TEXT_PROMPT, this.cpfValidator.bind(this)))
            .addDialog(new TextPrompt(PHONE_TEXT_PROMPT, this.phoneValidator.bind(this)))
            .addDialog(new TextPrompt(CONFIRM_INFOS_TEXT_PROMPT, this.confirmValidator.bind(this)));
    }

    async fullname(stepContext) {
        return stepContext.prompt(FULLNAME_TEXT_PROMPT, 'Agora faltam poucas pedaladas para chegarmos ao final. Por favor, digite o seu nome completo.');
    }

    async cpf(stepContext) {
        const userProfile = await this.userProfile.get(stepContext.context);
        userProfile.name = stepContext.context.activity.text;
        await this.userProfile.set(stepContext.context, userProfile);
        return stepContext.prompt(CPF_TEXT_PROMPT, 'Qual o seu CPF?');
    }

    async cpfValidator(stepContext) {
        const { entity } = stepContext.context.luis;
        return entity.type === 'cpf';
    }

    async phone(stepContext) {
        const userProfile = await this.userProfile.get(stepContext.context);
        userProfile.cpf = stepContext.context.luis.entity.text;
        await this.userProfile.set(stepContext.context, userProfile);
        return stepContext.prompt(PHONE_TEXT_PROMPT, 'E o seu telefone? exemplo: (12)12341234');
    }

    async phoneValidator(stepContext) {
        const { entity } = stepContext.context.luis;
        return entity.type === 'phone';
    }

    async confirmInfos(stepContext) {
        const userProfile = await this.userProfile.get(stepContext.context);
        userProfile.phone = stepContext.context.luis.entity.text;
        await this.userProfile.set(stepContext.context, userProfile);
        stepContext.context.sendActivity('Para finalizarmos a compra, confirme os seus dados!');
        stepContext.context.sendActivity('Dados informados:');
        stepContext.context.sendActivity(`
1.CEP: ${ userProfile.cep }\n
2.Cidade: ${ userProfile.city }\n
3.Bairro: ${ userProfile.district }\n
4.Endereço: ${ userProfile.street }\n
5.Número: ${ userProfile.residenceNumber }\n
6.Complemento: ${ userProfile.residenceComplement }\n
7.Nome: ${ userProfile.name }\n
8.CPF: ${ userProfile.cpf }\n
9.Telefone ${ userProfile.phone }\n        
        `);

        return stepContext.prompt(CONFIRM_INFOS_TEXT_PROMPT, 'Todos os dados estão **corretos**?');
    }

    async confirmValidator(stepContext) {
        const { entity } = stepContext.context.luis;
        return entity.type === 'yes';
    }
}
module.exports.PersonalInfosDialog = PersonalInfosDialog;
