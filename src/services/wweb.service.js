const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { QR } = require('../models');

/**
 * Get QR
 */
// const client = new Client({
//   authStrategy: new LocalAuth(),
// });
// const getQR = async () => {
//   return 'qr code from db';
// };

// client.initialize();
// client.on('qr', (qr) => {
//   console.log('save qr', qr);
//   qrcode.generate(qr, { small: true });
//   return QR.create({ qr });
// });
// client.on('ready', () => {
//   console.log('Client is ready!');
//   // Number where you want to send the message.
//   // const number = '+6285156157191';
//   const numbers = ['+6285156157191', '+628117777547'];

//   // Your message.
//   const text = 'Hey wik!';

//   // Getting chatId from the number.
//   // we have to delete "+" from the beginning and add "@c.us" at the end of the number.
//   numbers.forEach((number) => {
//     const chatId = `${number.substring(1)}@c.us`;
//     client.sendMessage(chatId, text);
//     console.log('chatID', chatId);
//     console.log('text', text);
//   });

//   // Sending message.
//   // for (let index = 0; index < 5; index += 1) {
//   // }
// });

module.exports = {
  // getQR,
};
