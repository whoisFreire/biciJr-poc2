const { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs');
const { WATERFALL_MAIN_DIALOG } = require('../constants/PromptsDialogsId');
const { AddressDialog } = require('./addressDialog');
const { BikeCardDialog } = require('./bikeCardDialog');
const { BuyInfosDialog } = require('./buyInfosDialog');
const { ColorDialog } = require('./colorDialog');
const { ConfirmedPurchaseDialog } = require('./confirmedPurchaseDialog');
const { FinalDialog } = require('./finalDialog');
const { GenderDialog } = require('./genderDialog');
const { GreetingDialog } = require('./greetingDialog');
const { MenuDialog } = require('./menuDialog');
const { PersonalInfosDialog } = require('./personalInfosDialog');
const { PriceDialog } = require('./priceDialog');
const { PurchasedDialog } = require('./purchasedDialog');
const { TypeDialog } = require('./typeDialog');

class MainDialog extends ComponentDialog {
    constructor(userState) {
        super('MainDialog');

        this.addDialog(new GreetingDialog())
            .addDialog(new MenuDialog())
            .addDialog(new TypeDialog())
            .addDialog(new ColorDialog())
            .addDialog(new GenderDialog())
            .addDialog(new PriceDialog())
            .addDialog(new FinalDialog())
            .addDialog(new BikeCardDialog(userState))
            .addDialog(new BuyInfosDialog(userState))
            .addDialog(new ConfirmedPurchaseDialog(userState))
            .addDialog(new AddressDialog(userState))
            .addDialog(new PersonalInfosDialog(userState))
            .addDialog(new PurchasedDialog(userState))
            .addDialog(new WaterfallDialog(WATERFALL_MAIN_DIALOG, [
                this.introStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_MAIN_DIALOG;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async introStep(stepContext) {
        return stepContext.replaceDialog('GreetingDialog');
    }
}
module.exports.MainDialog = MainDialog;
