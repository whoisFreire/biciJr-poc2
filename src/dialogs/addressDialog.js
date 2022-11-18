const { ComponentDialog, WaterfallDialog, TextPrompt } = require('botbuilder-dialogs');
const { WATERFALL_CEP_DIALOG, CEP_TEXT_PROMPT, RESIDENCE_NUMBER_TEXT_PROMPT, RESIDENCE_COMPLEMENT_TEXT_PROMPT } = require('../constants/PromptsDialogsId');

const { cepApi } = require('../services/cepApi');

class AddressDialog extends ComponentDialog {
    constructor(userState) {
        super('AddressDialog');

        this.userProfile = userState.createProperty('userProfile');
        this.addDialog(new WaterfallDialog(WATERFALL_CEP_DIALOG, [
            this.askCep.bind(this),
            this.requestAddress.bind(this),
            this.verifyAddress.bind(this),
            this.residenceNumber.bind(this),
            this.residenceComplement.bind(this),
            this.handleDialog.bind(this)
        ]))
            .addDialog(new TextPrompt(CEP_TEXT_PROMPT, this.cepValidator.bind(this)))
            .addDialog(new TextPrompt(RESIDENCE_NUMBER_TEXT_PROMPT))
            .addDialog(new TextPrompt(RESIDENCE_COMPLEMENT_TEXT_PROMPT));
    }

    async askCep(stepContext) {
        return stepContext.prompt(CEP_TEXT_PROMPT, 'Vamos agora ao endereço de entrega. Por favor, digite o seu CEP!');
    }

    async cepValidator(stepContext) {
        const { entity } = stepContext.context.luis;
        return entity.type === 'cep';
    }

    async requestAddress(stepContext) {
        const cep = stepContext.context.luis.entity.text;
        const { data } = await cepApi.fetch(cep);
        if (data.erro) {
            return stepContext.next();
        }
        const userProfile = await this.userProfile.get(stepContext.context);
        userProfile.cep = data.cep;
        userProfile.district = data.bairro;
        userProfile.city = data.localidade;
        userProfile.state = data.uf;
        userProfile.street = data.logradouro;
        await this.userProfile.set(stepContext.context, userProfile);
        return stepContext.next();
    }

    async verifyAddress(stepContext) {
        const userProfile = await this.userProfile.get(stepContext.context);
        if (!userProfile.cep) {
            return stepContext.beginDialog('');
        }
        return stepContext.next();
    }

    async residenceNumber(stepContext) {
        return stepContext.prompt(RESIDENCE_NUMBER_TEXT_PROMPT, 'Anotado aqui! Qual é o número da sua residência?');
    }

    async residenceComplement(stepContext) {
        const userProfile = await this.userProfile.get(stepContext.context);
        userProfile.residenceNumber = stepContext.context.activity.text;
        await this.userProfile.set(stepContext.context, userProfile);
        return stepContext.prompt(RESIDENCE_COMPLEMENT_TEXT_PROMPT, 'Se for o caso, informe também o complemento.');
    }

    async handleDialog(stepContext) {
        const userProfile = await this.userProfile.get(stepContext.context);
        userProfile.residenceComplement = stepContext.context.activity.text;
        await this.userProfile.set(stepContext.context, userProfile);
        return stepContext.replaceDialog('PersonalInfosDialog');
    }
}
module.exports.AddressDialog = AddressDialog;
