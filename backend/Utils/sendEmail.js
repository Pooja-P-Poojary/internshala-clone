// backend/utils/sendEmail.js
const SibApiV3Sdk = require("@getbrevo/brevo");

const sendEmail = async (to, subject, html) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.sender = { name: "InternArea", email: "shruthip715@gmail.com" };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html;

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

module.exports = sendEmail;