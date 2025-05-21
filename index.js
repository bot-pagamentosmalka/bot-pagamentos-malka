
const TelegramBot = require('node-telegram-bot-api');
const mercadopago = require('mercadopago');

const TELEGRAM_TOKEN = '7790206317:AAF-SwusrNADzIHVZL-8Qgk6uwW81yEr16g';
const MERCADO_PAGO_TOKEN = 'APP_USR-6494672302263549-052111-448e4ecc2f61ad1def0c6f9b96cae015-26100818';

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

mercadopago.configure({
  access_token: MERCADO_PAGO_TOKEN
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '👋 Olá! Escolha um dos planos abaixo para realizar o pagamento:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '💳 Plano Mensal (R$139,30)', callback_data: 'mensal' }],
        [{ text: '💳 Plano Trimestral (R$328,30)', callback_data: 'trimestral' }]
      ]
    }
  });
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const plano = query.data;

  const preferences = {
    mensal: {
      title: 'Sala VIP Malka - Plano Mensal com 30% OFF',
      unit_price: 139.30
    },
    trimestral: {
      title: 'Sala VIP Malka - Plano Trimestral com 30% OFF',
      unit_price: 328.30
    }
  };

  const preference = {
    items: [{
      title: preferences[plano].title,
      quantity: 1,
      currency_id: 'BRL',
      unit_price: preferences[plano].unit_price
    }],
    back_urls: {
      success: 'https://t.me/malkainvestimentos',
      failure: 'https://t.me/malkainvestimentos',
      pending: 'https://t.me/malkainvestimentos'
    },
    auto_return: 'approved'
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    bot.sendMessage(chatId, `✅ Clique no link abaixo para pagar o plano *${plano}* com 30% de desconto:

${response.body.init_point}`, { parse_mode: "Markdown" });
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, '❌ Ocorreu um erro ao gerar o link de pagamento.');
  }
});
