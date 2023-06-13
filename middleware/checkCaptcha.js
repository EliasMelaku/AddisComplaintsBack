const axios = require("axios");

async function checkCaptcha(token) {
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${token}`
  );
  if (response.data.success) {
    return true;
  } else {
    return false;
  }
}

module.exports = { checkCaptcha };
