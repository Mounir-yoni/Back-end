/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require("nodemailer");

// Nodemailer
const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOpts = {
    from: process.env.EMAIL_FROM || `Agence de Voyage <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
