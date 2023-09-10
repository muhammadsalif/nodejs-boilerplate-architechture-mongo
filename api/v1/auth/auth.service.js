const jwt = require("jsonwebtoken");
const config = require("../../../config/environment/index");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: config.ETHEREAL.ETHEREAL_USEREMAIL,
    pass: config.ETHEREAL.ETHEREAL_USERPASSWORD,
  },
});

const _generateEmailWithMagicLink = async (_user) => {
  const secret = config.JWT.SECRET + _user.password;
  const token = jwt.sign({ id: _user._id, email: _user.email }, secret, {
    expiresIn: config.JWT.EXPIRES_IN,
  });
  const magicLink = `{YOUR_BASE_URL}/reset-password/${_user._id}/${token}`;

  try {
    await transporter.sendMail({
      from: `"Company 👻" <company@gmail.com>`,
      to: _user.email,
      subject: "Magic link",
      text: "Magic link to reset password",
      html: `
        <a href=${magicLink}>Click here</a>
        </br>
          OR
        </br>
        <p>Paste that link in browser : </br>${magicLink}</p>
      `,
    });
    return Promise.resolve();
  } catch (err) {
    console.log("Error in sending email", err);
    return Promise.reject(err);
  }
};
module.exports = { _generateEmailWithMagicLink };
