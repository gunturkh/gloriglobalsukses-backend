const moment = require('moment');
const rupiah = require('./currencyFormatter');

const messageFormatter = (trackingData) => {
  const {
    // address,
    // createdAt,
    customerOrderDate,
    // delay,
    estimatedDate,
    newEstimatedDate,
    item,
    name,
    // phone,
    productionDays,
    remainingDownPaymentAmount,
    resi,
    salesOrder,
    status,
    daysToSendReminder,
    setDaysReminderManually,
    containerNumber
    // setStatusManually,
  } = trackingData;
  switch (status) {
    case 'STATUS ORDERAN SUDAH DITERIMA':
      return {
        message: `Customer *${name}* yth, Terima kasih sudah berbelanja, orderan anda dengan *${salesOrder}* barang *${item}* sudah kami terima dan akan segera diproses, mohon tunggu informasi selanjutnya. Terima kasih.`,
        daysToSendReminder: setDaysReminderManually ? daysToSendReminder : 1,
      };

    case 'SUDAH DIPESAN DAN BARANG READY':
      return {
        message: `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah dipesan & sedang dalam proses pengemasan pada tanggal ${moment(
          customerOrderDate
        ).format('DD MMMM YYYY')}. Ditunggu informasi selanjutnya. Terima kasih.`,
        daysToSendReminder: setDaysReminderManually ? daysToSendReminder : 1,
      };

    case 'SUDAH DIPESAN DAN BARANG PRODUKSI':
      return {
        message: `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah dipesan pada tanggal ${moment(
          customerOrderDate
        ).format(
          'DD MMMM YYYY'
        )} dan dalam proses *produksi ${productionDays} hari*. Kemungkinan akan mengalami keterlambatan pengiriman dikarenakan adanya proses produksi tersebut. Mohon ditunggu informasi selanjutnya. Terima kasih.`,
        daysToSendReminder: setDaysReminderManually ? daysToSendReminder : 7,
      };

    case 'SUDAH DIKIRIM VENDOR KE GUDANG CHINA':
      return {
        message: `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah dikirim dengan nomor *resi china lokal ${resi}* dan akan tiba di Gudang China dalam waktu 4-5 hari. Mohon ditunggu informasi selanjutnya. Terima kasih.`,
        daysToSendReminder: setDaysReminderManually ? daysToSendReminder : 4,
      };

    case 'SUDAH TIBA DIGUDANG CHINA':
      return {
        message: `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah tiba di Gudang China dengan resi china lokal *${resi}*. Mohon ditunggu informasi selanjutnya. Terima kasih.`,
        daysToSendReminder: setDaysReminderManually ? daysToSendReminder : 3,
      };

    case 'BARANG LOADING CHINA - JAKARTA':
      return {
        message: `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* dengan resi *${resi}* sudah di loading dengan nomor Container *${containerNumber}* dan akan tiba di gudang Jakarta dengan estimasi *${moment(
          estimatedDate
        ).format('DD MMMM YYYY')}*. Mohon ditunggu informasi selanjutnya. Terima kasih.`,
        daysToSendReminder: setDaysReminderManually ? daysToSendReminder : 7,
      };

    case 'BARANG KOMPLIT ITEM & BELUM CLEAR DP':
      return {
        message: `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* atas *${resi}* tiba di Gudang Jakarta pada tanggal  *${moment(
          estimatedDate
        ).format(
          'DD MMMM YYYY'
        )}* dan akan segera diproses pengiriman ke alamat anda. Mohon untuk segera melakukan pelunasan *sisa DP 30%* sebesar *IDR ${rupiah(
          remainingDownPaymentAmount
        )}*. Mohon ditunggu informasi selanjutnya. Terima kasih.`,
        daysToSendReminder: setDaysReminderManually ? daysToSendReminder : 1,
      };

    case 'BARANG KOMPLIT ITEM & SUDAH CLEAR DP':
      return {
        message: `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* tiba di Gudang Jakarta pada tanggal  *${moment(
          estimatedDate
        ).format(
          'DD MMMM YYYY'
        )}* dan sudah dikirimkan dengan nomor resi SENTRAL CARGO *${resi}* .Jangan lupa Untuk membuat video unboxing jika barang telah sampai untuk menghindari kesalahan dalam pengiriman. Ditunggu orderan selanjutnya, Terima kasih.`,
        daysToSendReminder: setDaysReminderManually ? daysToSendReminder : 1000,
      };

    case 'DELAY - RANDOM CHECK CHINA':
      return {
        message: `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* akan mengalami kemunduran estimasi tiba di Indonesia dikarenakan adanya *Random Check* di Custom China maka dari itu untuk estimasi selanjutnya akan kami informasikan kembali. Kami segenap perusahaan memohon maaf sebesar besarnya atas kemunduran estimasi tersebut. Mohon ditunggu. Terima kasih.`,
        daysToSendReminder: setDaysReminderManually ? daysToSendReminder : 1,
      };

    case 'DELAY - STATUS BARANG OVERLOAD':
      return {
        message: `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* Estimasi awal *${moment(
          estimatedDate
        ).format(
          'DD MMMM YYYY'
        )}* mengalami kemunduran Estimasi dikarenakan adanya *Overload Container* dipelabuhan Transit Indonesia. Maka estimasi selanjutnya *${moment(
          newEstimatedDate
        ).format(
          'DD MMMM YYYY'
        )}*, Kami segenap perusahaan memohon maaf sebesar besarnya atas kemunduran estimasi tersebut. Mohon ditunggu informasi selanjutnyya. Terima kasih.`,
        daysToSendReminder: setDaysReminderManually ? daysToSendReminder : 1,
      };

    default:
      return {
        message: status,
        daysToSendReminder: setDaysReminderManually ? daysToSendReminder : 1,
      };
  }
};

module.exports = messageFormatter;
