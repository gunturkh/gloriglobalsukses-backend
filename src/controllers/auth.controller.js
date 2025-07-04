const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { QR } = require('../models');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const checkWaAuth = catchAsync(async (req, res) => {
  // eslint-disable-next-line no-undef
  client
    .getState()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      if (err) {
        res.send('DISCONNECTED');
      }
    });
});

const getQR = catchAsync(async (req, res) => {
  // console.log('fineQR', findQR);
  // eslint-disable-next-line no-undef
  client
    .getState()
    .then(async (data) => {
      if (data) {
        res.status('200').send({ message: 'authenticated' });
      } else {
        const qr = await QR.findOne({ name: 'qr' });
        return res.status('200').send({ message: 'qr code', data: qr });
      }
    })
    .catch(() => {
      const qr = QR.findOne({ name: 'qr' });
      return res.status('200').send({ message: 'qr code', data: qr });
    });
  // return res.status('200').send({ message: 'ok', qr: foundQR });
});

const waLogout = catchAsync(async (req, res) => {
  // eslint-disable-next-line no-undef
  // if (client) {
  //   // eslint-disable-next-line no-undef
  //   await client.logout();
  //   // eslint-disable-next-line no-undef
  //   authed = false;
  // }
  // eslint-disable-next-line no-undef
  client
    .getState()
    .then(async (data) => {
      if (data) {
        // eslint-disable-next-line no-undef
        await client.logout();
        // eslint-disable-next-line no-undef
        // await client.destroy();
        // eslint-disable-next-line no-undef
        authed = false;
        return res.status('200').send({ message: 'wa logout success' });
      }
      // eslint-disable-next-line no-undef
      await client.logout();
      // eslint-disable-next-line no-undef
      // await client.destroy();
      return res.status('200').send({ message: 'wa logout failed' });
    })
    .catch(async () => {
      // eslint-disable-next-line no-undef
      await client.logout();
      // eslint-disable-next-line no-undef
      // await client.destroy();
      return res.status('200').send({ message: 'wa logout failed' });
    });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  checkWaAuth,
  getQR,
  waLogout,
};
