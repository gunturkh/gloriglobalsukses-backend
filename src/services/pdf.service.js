const PDFDocument = require('pdfkit');

/**
 * Generate PDF
 * @param {string} url
 * @returns {Promise}
 */
const generatePDF = async (req, res) => {
  const myDoc = new PDFDocument({ bufferPages: true });

  const buffers = [];
  myDoc.on('data', buffers.push.bind(buffers));
  myDoc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res
      .writeHead(200, {
        'Content-Length': Buffer.byteLength(pdfData),
        'Content-Type': 'application/pdf',
        'Content-disposition': 'attachment;filename=test.pdf',
      })
      .end(pdfData);
  });

  myDoc.font('Times-Roman').fontSize(12).text(`this is a test text`);
  myDoc.end();
};

module.exports = generatePDF;
