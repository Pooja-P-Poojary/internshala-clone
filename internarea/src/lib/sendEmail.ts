// lib/sendEmail.ts
const sendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: { name: "InternArea", email: "shruthip715@gmail.com" },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo API error: ${error}`);
  }

  const result = await response.json();
  console.log("BREVO RESPONSE:", JSON.stringify(result));
  return result;

  return response.json();
};

export default sendEmail;