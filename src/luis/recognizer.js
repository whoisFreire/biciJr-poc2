const entitiesNames = require('../constants/entitiesNames');
const intentsNames = require('../constants/intentsNames');

class Recognizer {
    async start(luis, context) {
        const result = await luis.configured.recognize(context);
        const topIntent = luis.class.topIntent(result);

        return {
            intent: this.intent(topIntent),
            entity: this.entity(result)
        };
    }

    entity(result) {
        const { entities } = result;

        let entity;

        entitiesNames.forEach(element => {
            // eslint-disable-next-line no-prototype-builtins
            if (entities.hasOwnProperty(element)) {
                entity = {
                    text: entities[element][0],
                    type: element
                };
            };
        });

        return entity;
    };

    intent(topIntent) {
        let intent;

        intentsNames.forEach(element => {
            // eslint-disable-next-line no-prototype-builtins
            if (topIntent === element) {
                intent = topIntent;
            };
        });

        return intent;
    };
}

module.exports.Recognizer = Recognizer;
