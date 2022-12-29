const { CardFactory, MessageFactory } = require('botbuilder');
const { ComponentDialog, WaterfallDialog, ChoicePrompt, TextPrompt } = require('botbuilder-dialogs');
const { WATERFALL_CARD_BIKE_DIALOG, MENU_BIKE_CARD_CHOICE, BUY_TEXT_PROMPT, SOMETHING_MORE_CHOICE } = require('../constants/PromptsDialogsId');

const getBikes = require('../utils/filterBikes');

class BikeCardDialog extends ComponentDialog {
    constructor(userState) {
        super('BikeCardDialog');

        this.userProfile = userState.createProperty('userProfile');
        this.addDialog(new WaterfallDialog(WATERFALL_CARD_BIKE_DIALOG, [
            this.showBikeCard.bind(this),
            this.handleChoice.bind(this),
            this.bikeDescription.bind(this),
            this.handleBuy.bind(this),
            this.HandleSomethingMore.bind(this)
        ]))
            .addDialog(new ChoicePrompt(MENU_BIKE_CARD_CHOICE, this.menuValidator.bind(this)))
            .addDialog(new TextPrompt(BUY_TEXT_PROMPT, this.buyValidator.bind(this)))
            .addDialog(new ChoicePrompt(SOMETHING_MORE_CHOICE, this.handleValidator.bind(this)));
    }

    async showBikeCard(stepContext) {
        let userProfile = await this.userProfile.get(stepContext.context, {});
        if (!userProfile.count) {
            await this.userProfile.set(stepContext.context, { ...userProfile, count: 0 });
        }
        if (userProfile.count >= 0) {
            await this.userProfile.set(stepContext.context, { ...userProfile, count: userProfile.count++ });
        }

        userProfile = await this.userProfile.get(stepContext.context);

        const { count } = userProfile;
        const { filter, subfilter } = stepContext.options;
        const bikes = await getBikes.getBikes(filter, subfilter);
        const hasBikes = bikes.length;
        if (!hasBikes) {
            stepContext.context.sendActivity('infelizmente nao temos bikes com esse tipo de filtro');
            stepContext.context.sendActivity('O que voce gostaria de fazer?');
            const options = ['Explorar outro filtro de pesquisa', 'Encerrar'];
            const card = CardFactory.heroCard(undefined, undefined, options, undefined);
            const prompt = MessageFactory.attachment(card);
            return stepContext.prompt(MENU_BIKE_CARD_CHOICE, { prompt });
        }

        if (count < bikes.length) {
            stepContext.context.sendActivity('Tenho certeza que você vai gostar das bikes que eu encontrei!');
            const card = CardFactory.heroCard(undefined, [bikes[count].image]);
            const cardImage = MessageFactory.attachment(card);
            stepContext.context.sendActivity(cardImage);
            stepContext.context.sendActivity(`
**${ bikes[count].name }**\n
${ bikes[count].brand }\n
**R$ ${ bikes[count].price }**`);

            const options = ['Mais informações sobre a bicicleta',
                'Ver próxima opção de bicicleta',
                'Explorar outro filtro de pesquisa'
            ];

            const optionsCard = CardFactory.heroCard(undefined, undefined, options, undefined);
            const prompt = MessageFactory.attachment(optionsCard);
            stepContext.values.bike = bikes[count];
            return stepContext.prompt(MENU_BIKE_CARD_CHOICE, { prompt });
        }

        stepContext.context.sendActivity('Infelizmente temos apenas esses modelos de bicicleta para o tipo escolhido');

        const card = CardFactory.heroCard(undefined, [bikes[count - 1].image]);
        const cardImage = MessageFactory.attachment(card);
        stepContext.context.sendActivity(cardImage);
        stepContext.context.sendActivity(`${ bikes[count - 1].name } \n ${ bikes[count - 1].brand } \n R$ ${ bikes[count - 1].price }`);

        const options = [
            'Mais informações sobre a bicicleta',
            'Voltar para o modelo anterior',
            'Explorar outro filtro de pesquisa'
        ];

        const optionsCard = CardFactory.heroCard(undefined, undefined, options, undefined);
        const prompt = MessageFactory.attachment(optionsCard);
        stepContext.values.bike = bikes[count - 1];
        return stepContext.prompt(MENU_BIKE_CARD_CHOICE, { prompt });
    }

    async menuValidator(stepContext) {
        const options = ['Mais informações sobre a bicicleta',
            'Ver próxima opção de bicicleta',
            'Voltar para o modelo anterior',
            'Explorar outro filtro de pesquisa',
            'Encerrar'
        ];
        const choiced = stepContext.context.activity.text;

        if (!options.includes(choiced)) {
            stepContext.context.sendActivity('opção inválida, tente novamente.');
            return options.includes(choiced);
        }

        return options.includes(choiced);
    }

    async handleChoice(stepContext) {
        const choiced = stepContext.context.activity.text;
        if (new RegExp(/(Mais informa[ç|c][õ|o]es sobre a bicicleta)/, 'i').test(choiced)) {
            return stepContext.next();
        } if (new RegExp(/(Ver pr[ó|o]xima op[ç|c][ã|a]o de bicicleta)/, 'i').test(choiced)) {
            const userProfile = await this.userProfile.get(stepContext.context);
            userProfile.count++;
            return stepContext.replaceDialog(this.id, { filter: stepContext.options.filter, subfilter: stepContext.options.subfilter });
        } if (new RegExp(/(Explorar outro filtro de pesquisa)/, 'i').test(choiced)) {
            const userProfile = await this.userProfile.get(stepContext.context);
            userProfile.count = 0;
            return stepContext.replaceDialog('MenuDialog');
        } if (new RegExp(/(Voltar para o modelo anterior)/, 'i').test(choiced)) {
            const userProfile = await this.userProfile.get(stepContext.context);
            const BACK_MODEL = 2;
            userProfile.count -= BACK_MODEL;
            return stepContext.replaceDialog(this.id, { filter: stepContext.options.filter, subfilter: stepContext.options.subfilter });
        }
        if (new RegExp(/(Encerrar)/, 'i').test(choiced)) {
            return stepContext.replaceDialog('FinalDialog');
        }
    }

    async bikeDescription(stepContext) {
        const bike = stepContext.values.bike;
        stepContext.context.sendActivity(`${ bike.description }`);
        return stepContext.prompt(BUY_TEXT_PROMPT, 'Quer **comprar** esta bicicleta agora?');
    }

    async buyValidator(stepContext) {
        const { intent } = stepContext.context.luis;
        if (intent === 'buy_bike' || intent === 'not_buy_bike') {
            return true;
        }
        return false;
    }

    async handleBuy(stepContext) {
        const { intent } = stepContext.context.luis;
        const bike = stepContext.values.bike;
        if (intent !== 'not_buy_bike') {
            let userProfile = await this.userProfile.get(stepContext.context);
            if (!userProfile.cart) {
                await this.userProfile.set(stepContext.context, { ...userProfile, cart: [bike] });
            }
            if (userProfile.cart) {
                const oldCart = userProfile.cart;
                oldCart.push(bike);
                await this.userProfile.set(stepContext.context, { ...userProfile, cart: oldCart });
            }
            userProfile = await this.userProfile.get(stepContext.context);
            const bikePositon = userProfile.cart.length - 1;
            stepContext.context.sendActivity(`${ userProfile.cart[bikePositon].name } foi adicionada ao **carrinho de compras**`);
            stepContext.context.sendActivity('O que você deseja fazer agora?');

            const options = ['Finalizar pedido', 'Continuar comprando'];
            const card = CardFactory.heroCard(undefined, undefined, options, undefined);
            const prompt = MessageFactory.attachment(card);
            return stepContext.prompt(SOMETHING_MORE_CHOICE, { prompt });
        }
        stepContext.context.sendActivity('O que você deseja fazer então?');
        const options = [
            'Ver próxima opção de bicicleta',
            'Explorar outro filtro de pesquisa',
            'Encerrar'
        ];
        const card = CardFactory.heroCard(undefined, undefined, options, undefined);
        const prompt = MessageFactory.attachment(card);
        return stepContext.prompt(SOMETHING_MORE_CHOICE, { prompt });
    }

    async handleValidator(stepContext) {
        const options = ['Finalizar pedido', 'Continuar comprando', 'Ver próxima opção de bicicleta', 'Explorar outro filtro de pesquisa', 'Encerrar'];
        const choiced = stepContext.context.activity.text;

        return options.includes(choiced);
    }

    async HandleSomethingMore(stepContext) {
        const choiced = stepContext.context.activity.text;
        if (new RegExp(/(Continuar comprando)/, 'i').test(choiced)) {
            return stepContext.replaceDialog('MenuDialog');
        }
        if (new RegExp(/(Finalizar pedido)/, 'i').test(choiced)) {
            return stepContext.replaceDialog('BuyInfosDialog');
        }
        if (new RegExp(/(Ver pr[o|ó]xima) op[c|ç][a|ã]o de bicicleta/, 'i').test(choiced)) {
            const userProfile = await this.userProfile.get(stepContext.context);
            userProfile.count++;
            return stepContext.replaceDialog(this.id, { filter: stepContext.options.filter, subfilter: stepContext.options.subfilter });
        }
        if (new RegExp(/(Explorar outro filtro de pesquisa)/, 'i').test(choiced)) {
            const userProfile = await this.userProfile.get(stepContext.context);
            userProfile.count = 0;
            return stepContext.replaceDialog('MenuDialog');
        }
        if (new RegExp(/Encerrar/, 'i').test(choiced)) {
            return stepContext.replaceDialog('FinalDialog');
        }
    }
}
module.exports.BikeCardDialog = BikeCardDialog;
