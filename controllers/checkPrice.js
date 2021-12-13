const bot = require('../bot');
const priceCheckFn = require('../execution/checkPrice');
const getNormalTime = require('../util/datetime');

let plsStop = false;
let messageId = null;
let fallFloor = 1000;

const check = async (ctx) => {
    try {
        if (plsStop) {
            return;
        }

        let price = await priceCheckFn();
        let message = `Retrieval Time: ${getNormalTime()}\n\n`;

        if (price > 0) {
            message += `Percentage: <b>${price}</b>`;
            if (messageId == null && !plsStop) {
                await bot.telegram
                    .sendMessage(ctx.chat.id, message, {
                        parse_mode: 'HTML',
                    })
                    .then((messageDetails) => {
                        messageId = messageDetails.message_id;
                    })
                    .catch((err) => console.error(err));
            } else {
                await bot.telegram
                    .editMessageText(
                        ctx.chat.id,
                        messageId,
                        undefined,
                        message,
                        {
                            parse_mode: 'HTML',
                        }
                    )
                    .catch((err) => console.error(err));
            }
            if (price <= fallFloor) {
                let alertMessage = `<b>ALERT</b> @Vforvitagen\nPercentage: ${price}`;

                await bot.telegram
                    .sendMessage(ctx.chat.id, alertMessage, {
                        parse_mode: 'HTML',
                    })
                    .catch((err) => console.error(err));
            }
        } else {
            console.log('Error in price');
        }

        setImmediate(() => check(ctx));
    } catch (error) {
        console.error(error);
    }
};

bot.command('/check', async (ctx) => {
    console.log('Starting check');
    plsStop = false;
    check(ctx);
});

bot.command('/alert', async (ctx) => {
    console.log('Setting floor');
    const args = ctx.update.message.text.split(' ');
    if (args.length != 2) {
        bot.telegram.sendMessage(
            ctx.chat.id,
            'Please input the correct format!\nE.g: /alert 1000',
            {}
        );
    } else {
        fallFloor = parseFloat(args[1]);
        bot.telegram.sendMessage(
            ctx.chat.id,
            `Set the alert floor to ${fallFloor}`,
            {}
        );
    }
});

bot.command('/stopcheck', async (ctx) => {
    console.log('Stopping check');
    plsStop = true;
    messageId = null;
    await bot.telegram.sendMessage(ctx.chat.id, 'I will stop now', {});
});
