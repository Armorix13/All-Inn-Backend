import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  token: string,
  baseUrl: string|undefined
): Promise<void> => {
  try {
    const verificationLink = `${baseUrl}/verify?token=${token}`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
            <header style="background-color: #4CAF50; padding: 15px; text-align: center; color: white; font-size: 1.5em;">
                Verify Your Email
            </header>
            <div style="padding: 20px; text-align: center;">
                <p style="font-size: 1.1em;">Hi there,</p>
                <p style="font-size: 1.1em;">
                    Click the button below to verify your email address:
                </p>
                <a href="${verificationLink}" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
                    Verify Email
                </a>
                <p style="font-size: 0.9em; margin-top: 20px; color: #555;">
                    If the button above doesn't work, copy and paste the following link into your browser:
                </p>
            </div>
            <footer style="background-color: #f1f1f1; padding: 10px; text-align: center; color: #888;">
                &copy; 2024 Your Company. All rights reserved.
            </footer>
        </div>
    </body>
    </html>`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
