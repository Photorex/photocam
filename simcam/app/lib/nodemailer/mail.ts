// import nodemailer from 'nodemailer';

// const SERVICE_EMAIL = process.env.SERVICE_EMAIL!;
// const SERVICE_EMAIL_PASSWORD = process.env.SERVICE_EMAIL_PASSWORD!;
// const EMAIL_VERIFICATION_URL = process.env.EMAIL_VERIFICATION_URL!;
// const PASSWORD_RESET_URL = process.env.PASSWORD_RESET_URL!;

// const transporter = nodemailer.createTransport({
//   host: 'smtp.zoho.com',
//   port: 465,
//   secure: true, //ssl
//   auth: {
//     user: SERVICE_EMAIL,
//     pass: SERVICE_EMAIL_PASSWORD,
//   },
// });

// export async function sendVerificationEmail(email: string, token: string) {
//   const verificationUrl = `${EMAIL_VERIFICATION_URL}/${token}`;
//   await transporter.sendMail({
//     from: '"simcam.net" <simcam>',
//     to: email,
//     subject: "Verify Your Email",
//     html: `Please click on the following link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`,
//   });
// }

// export async function sendPasswordResetEmail(email: string, token: string) {
//   const passwordResetUrl = `${PASSWORD_RESET_URL}/${token}`;
//   await transporter.sendMail({
//     from: '"simcam" <simcam>',
//     to: email,
//     subject: "Reset your password",
//     html: `Please click on the following link to reset your password: <a href="${passwordResetUrl}">${passwordResetUrl}</a>`,
//   });
// }


import nodemailer from 'nodemailer';

const SERVICE_EMAIL = process.env.SERVICE_EMAIL!;
const SERVICE_EMAIL_PASSWORD = process.env.SERVICE_EMAIL_PASSWORD!;
const EMAIL_VERIFICATION_URL = process.env.EMAIL_VERIFICATION_URL!;
const PASSWORD_RESET_URL = process.env.PASSWORD_RESET_URL!;

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: SERVICE_EMAIL,
      pass: SERVICE_EMAIL_PASSWORD,
    },
});

export async function sendVerificationEmail(
    email: string, 
    token: string,
    returnTo?: string,
) {
    const verificationUrl =
    `${EMAIL_VERIFICATION_URL}/${token}${returnTo ? `?return=${encodeURIComponent(returnTo)}` : ''}`;
  console.log(`Sending verification email to: ${email}`);
  console.log(`Verification URL: ${verificationUrl}`);

  try {
    await transporter.sendMail({
      from: '"simcam.net" <user@gmail.com>',
      to: email,
      subject: "Verify Your Email",
      html: `Please click on the following link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a>`,
    });
    console.log(`Verification email successfully sent to: ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const passwordResetUrl = `${PASSWORD_RESET_URL}/${token}`;
  await transporter.sendMail({
    from: '"simcam.net" <user@gmail.com>',
    to: email,
    subject: "Reset your password",
    html: `Please click on the following link to reset your password: <a href="${passwordResetUrl}">${passwordResetUrl}</a>`,
  });
}