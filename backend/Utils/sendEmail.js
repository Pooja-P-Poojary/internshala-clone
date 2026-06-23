const sendEmail = async (to, subject, html) => {

  console.log("Sending email to:", to);
  console.log("BREVO API KEY EXISTS:", !!process.env.BREVO_API_KEY);


  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: "InternArea", email: "shruthip715@gmail.com" },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    }),
  });

  const responseText = await response.text();

  console.log("BREVO STATUS:", response.status);
  console.log("BREVO RESPONSE:", responseText);

  if (!response.ok) {
    throw new Error(`Brevo API error: ${responseText}`);
  }

   return responseText;
};

module.exports = sendEmail;