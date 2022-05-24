const httpStatus = require('http-status');
const PDFDocument = require('pdfkit');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { trackingDataService } = require('../services');
const messageFormatter = require('../utils/messageFormatter');
const { MessageMedia } = require('whatsapp-web.js');

const createTrackingData = catchAsync(async (req, res) => {
  let body = req.body.setSendMessageNow ? { ...req.body, sendMessageStatus: true } : req.body;
  const trackingData = await trackingDataService.createTrackingData(body);
  const { phone, setSendMessageNow, images } = trackingData;
  console.log('trackingData created', trackingData);
  if (setSendMessageNow) {
    const { message } = messageFormatter(trackingData);
    console.log({ message, phone });
    if (phone === undefined || message === undefined) {
      res.send({ status: 'error', message: 'please enter valid phone and message', data: null });
    } else {
      // eslint-disable-next-line no-undef
      client
        .sendMessage(`${phone}@c.us`, message)
        .then(async (response) => {
          if (images && images.length > 0) {
            images.forEach(async (image) => {
              const media = await MessageMedia.fromUrl(image);
              // eslint-disable-next-line no-undef
              client.sendMessage(`${phone}@c.us`, media).then(() => console.log('image sent'));
            });
          }
          if (response.id.fromMe) {
            res
              .status(httpStatus.CREATED)
              .send({ status: 'success', message: 'Success create tracking data', data: trackingData });
          }
        })
        .catch((err) => {
          console.log('error when update tracking data', err);
          res.status(httpStatus[500]).send({ status: 'error', message: `Failed create tracking data`, data: null });
        });
    }
  } else
    res.status(httpStatus.CREATED).send({ status: 'success', message: 'Success create tracking data', data: trackingData });
});

const getTrackingDatas = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'read',
    'name',
    'phone',
    'address',
    'item',
    'resi',
    'status',
    'delay',
    'salesOrder',
    'label',
    'sendMessageStatus',
    'customerOrderDate',
    'customerOrderDate_gte',
    'customerOrderDate_lte',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);
  const result = await trackingDataService.queryTrackingDatas(filter, options);
  const { page, limit, totalResults } = result;
  res.set('Access-Control-Expose-Headers', 'Content-Range');
  res.set('Content-Range', `trackings ${page}-${limit}/${totalResults}`);
  res.send(result);
});

const getTrackingData = catchAsync(async (req, res) => {
  const trackingData = await trackingDataService.getTrackingDataById(req.params.trackingDataId);
  if (!trackingData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tracking not found');
  }
  res.send(trackingData);
});

const printTrackingDatatoPDF = catchAsync(async (req, res) => {
  const pageCount = req.params.pageCount;
  const trackingData = await trackingDataService.getTrackingDataById(req.params.trackingDataId);
  if (!trackingData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tracking not found');
  }
  // console.log('trackingData', trackingData);
  const { name, item, resi, address, phone, status, salesOrder } = trackingData;
  const myDoc = new PDFDocument({ bufferPages: true });

  const defaultMargin = 72;
  const primaryColor = '#FFE200';
  const secondaryColor = '#201E21';
  const companyLogo = 'assets/gloglo.jpeg';
  const buffers = [];
  myDoc.on('data', buffers.push.bind(buffers));
  myDoc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res
      .writeHead(200, {
        'Content-Length': Buffer.byteLength(pdfData),
        'Content-Type': 'application/pdf',
        'Content-disposition': `attachment;filename=${salesOrder}.pdf`,
      })
      .end(pdfData);
  });

  for (let index = 1; index <= pageCount; index++) {
    if (index !== 1) myDoc.addPage();

    // -------------- Banner -------------
    myDoc.rect(defaultMargin, 30, myDoc.page.width - 2 * defaultMargin + 1, 300).stroke(secondaryColor);
    myDoc.rect(defaultMargin, 30, myDoc.page.width - 2 * defaultMargin + 1, 50).stroke(secondaryColor);
    myDoc.image(companyLogo, defaultMargin + 5, 35, { width: 40, height: 40 });
    myDoc
      .fontSize(9)
      .font('Helvetica')
      .text('Pengirim', defaultMargin + 50, 40, {
        align: 'left',
        link: null,
      });
    myDoc
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('Kunjungi Website Kami :', defaultMargin + 200, 40, {
        align: 'left',
        link: null,
      });
    myDoc.fontSize(9).text('www.gloriglobalsukses.com/public/', defaultMargin + 200, 52, {
      align: 'left',
      link: null,
    });
    myDoc.fontSize(9).text('Instagram: gloglo.co.id', defaultMargin + 200, 64, {
      align: 'left',
      link: null,
    });
    myDoc.fontSize(10).text('GLORI 0822-6894-7572', defaultMargin + 50, 55, {
      align: 'left',
      link: null,
    });
    myDoc
      .rect(defaultMargin, 80, myDoc.page.width - 2 * defaultMargin + 1, 20)
      .fill(secondaryColor)
      .stroke(secondaryColor);

    // -------------- End of Banner Banner -------------

    // -------------- Customer Details ----------------
    myDoc.fontSize(12).text('No SO : ', 350, 103, {
      align: 'left',
      link: null,
    });
    myDoc.rect(400, 95, 141, 20).stroke(secondaryColor);
    myDoc.font('Helvetica-Bold').fillColor('#000').fontSize(12).text(salesOrder, 405, 103);
    myDoc
      .fontSize(10)
      .font('Helvetica')
      .text('Kepada : ', defaultMargin + 5, 103, {
        align: 'left',
        link: null,
      });
    myDoc.fontSize(10).text('Nama : ', defaultMargin + 5, 120, {
      align: 'left',
      link: null,
    });
    myDoc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(name, defaultMargin + 80, 120, {
        align: 'left',
        link: null,
      });
    myDoc
      .fontSize(10)
      .font('Helvetica')
      .text('Alamat : ', defaultMargin + 5, 140, {
        align: 'left',
        link: null,
      });
    myDoc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(address, defaultMargin + 80, 140, {
        align: 'left',
        link: null,
      });
    myDoc
      .fontSize(10)
      .font('Helvetica')
      .text('Nama Barang : ', defaultMargin + 5, 160, {
        align: 'left',
        link: null,
      });
    myDoc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`${item} (${index}/${pageCount} CTN)`, defaultMargin + 80, 160, {
        align: 'left',
        link: null,
      });
    myDoc
      .fontSize(10)
      .font('Helvetica')
      .text('No HP: ', defaultMargin + 5, 180, {
        align: 'left',
        link: null,
      });
    myDoc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(phone, defaultMargin + 80, 180, {
        align: 'left',
        link: null,
      });

    myDoc
      .rect(defaultMargin, 200, myDoc.page.width - 2 * defaultMargin + 1, 20)
      .fill(secondaryColor)
      .stroke(secondaryColor);
    // -------------- End of Customer Details ----------------

    // -------------- Start of Cargo Details ----------------

    myDoc.rect(defaultMargin + 80, 220, 15, 15).stroke(secondaryColor);
    myDoc.rect(defaultMargin + 80, 235, 15, 15).stroke(secondaryColor);
    myDoc.rect(defaultMargin + 80, 250, 15, 15).stroke(secondaryColor);
    myDoc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('SENTRAL CARGO', defaultMargin + 100, 222, {
        align: 'left',
        link: null,
      });

    myDoc.rect(defaultMargin + 220, 220, 15, 15).stroke(secondaryColor);
    myDoc.rect(defaultMargin + 220, 235, 15, 15).stroke(secondaryColor);
    myDoc.rect(defaultMargin + 220, 250, 15, 15).stroke(secondaryColor);
    myDoc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('(LAINNYA)...', defaultMargin + 240, 252, {
        align: 'left',
        link: null,
      });

    myDoc.moveTo(400, 220).lineTo(400, 270).stroke();

    myDoc
      .rect(defaultMargin, 265, myDoc.page.width - 2 * defaultMargin + 1, 20)
      .fill(secondaryColor)
      .stroke(secondaryColor);
    // -------------- End of Cargo Details ----------------

    // -------------- Start of Footer ----------------
    myDoc.fontSize(7).font('Helvetica').text('TERIMA KASIH SUDAH BERBELANJA', defaultMargin, 290, {
      align: 'center',
      link: null,
    });
    myDoc.fontSize(9).font('Helvetica-Bold').text('Produk dikirim dalam keadan baik', defaultMargin, 310, {
      align: 'center',
      link: null,
    });
    // -------------- End of Footer ----------------
  }
  myDoc.end();
});

const updateTrackingData = catchAsync(async (req, res) => {
  let body = req.body.setSendMessageNow ? { ...req.body, sendMessageStatus: true } : req.body;
  const trackingData = await trackingDataService.updateTrackingDataById(req.params.trackingDataId, body);
  const { phone, setSendMessageNow, images } = trackingData;
  console.log('trackingData update', trackingData);
  if (setSendMessageNow) {
    const { message } = messageFormatter(trackingData);
    console.log({ message, phone });
    if (phone === undefined || message === undefined) {
      res.send({ status: 'error', message: 'please enter valid phone and message', data: null });
    } else {
      // eslint-disable-next-line no-undef
      client
        .sendMessage(`${phone}@c.us`, message)
        .then((response) => {
          if (response.id.fromMe) {
            res.send({ status: 'success', message: `Message successfully sent to ${phone}`, data: trackingData });
          }
          if (images && images.length > 0) {
            images.forEach(async (image) => {
              const media = await MessageMedia.fromUrl(image);
              // eslint-disable-next-line no-undef
              client.sendMessage(`${phone}@c.us`, media).then(() => console.log('image sent'));
            });
          }
        })
        .catch((err) => {
          console.log('error when update tracking data', err);
          res.send({ status: 'error', message: `Message failed sent to ${phone}`, data: trackingData });
        });
    }
  }
  // res.send({ status: 'success', message: 'Success edit tracking data', data: trackingData });
});

const deleteTrackingData = catchAsync(async (req, res) => {
  await trackingDataService.deleteTrackingDataById(req.params.trackingDataId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createTrackingData,
  getTrackingDatas,
  getTrackingData,
  updateTrackingData,
  deleteTrackingData,
  printTrackingDatatoPDF,
};
