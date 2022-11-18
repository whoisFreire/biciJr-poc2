const { ActivityHandler } = require('botbuilder');

class DialogBot extends ActivityHandler {
    constructor(
        conversationState,
        userState,
        dialog,
        recognizer,
        luis
    ) {
        super();

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialog = dialog;
        this.dialogState = this.conversationState.createProperty('DialogState');

        this.onMessage(async (context, next) => {
            context.luis = await recognizer.start(luis, context);
            await this.dialog.run(context, this.dialogState);

            await next();
        });

        this.onDialog(async (context, next) => {
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);

            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await dialog.run(context, conversationState.createProperty('DialogState'));
                }
            }
            await next();
        });
    }
}

module.exports.DialogBot = DialogBot;
