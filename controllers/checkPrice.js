const bot = require('../bot');
const priceCheckFn = require('../execution/checkPrice');
const getNormalTime = require('../util/datetime');

let plsStop = false;
let messageId = null;
let percentageFallFloor = 500;
let priceFloor = 1.5;

const check = async (ctx) => {
    try {
        if (plsStop) {
            return;
        }

        let [percentage, price] = await priceCheckFn();
        let message = `Retrieval Time: ${getNormalTime()}\n\n`;

        if (percentage > 0) {
            message += `Percentage: ${percentage}\nPrice: ${price}`;
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

            if (percentage <= percentageFallFloor) {
                let alertMessage = `<b>PERCENTAGE ALERT</b> @Vforvitagen\nPercentage: ${percentage}`;

                await bot.telegram
                    .sendMessage(ctx.chat.id, alertMessage, {
                        parse_mode: 'HTML',
                    })
                    .catch((err) => console.error(err));
            }

            if (price <= priceFloor) {
                let alertMessage = `<b>PRICE ALERT</b> @Vforvitagen\nPrice: ${price}`;

                await bot.telegram
                    .sendMessage(ctx.chat.id, alertMessage, {
                        parse_mode: 'HTML',
                    })
                    .catch((err) => console.error(err));
            }
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

bot.command('/percentagealert', async (ctx) => {
    console.log('Setting percentage floor');
    const args = ctx.update.message.text.split(' ');
    if (args.length != 2) {
        bot.telegram.sendMessage(
            ctx.chat.id,
            'Please input the correct format!\nE.g: /percentagealert 500',
            {}
        );
    } else {
        percentageFallFloor = parseFloat(args[1]);
        bot.telegram.sendMessage(
            ctx.chat.id,
            `Set the percentage alert floor to ${percentageFallFloor}`,
            {}
        );
    }
});

bot.command('/pricealert', async (ctx) => {
    console.log('Setting price floor');
    const args = ctx.update.message.text.split(' ');
    if (args.length != 2) {
        bot.telegram.sendMessage(
            ctx.chat.id,
            'Please input the correct format!\nE.g: /pricealert 2.1',
            {}
        );
    } else {
        priceFloor = parseFloat(args[1]);
        bot.telegram.sendMessage(
            ctx.chat.id,
            `Set the price alert floor to ${priceFloor}`,
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
