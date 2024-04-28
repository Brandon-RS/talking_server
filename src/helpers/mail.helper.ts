import { Transporter, createTransport } from 'nodemailer';
import logger from './logger.helper';

export class MailServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MailServiceError';
  }
}

let _transporter: Transporter;

export const initMailService = () => {
  _transporter = createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD,
    },
  });

  _transporter.verify((error) =>
    error ? logger.error(`${error}`) : logger.info(`Email service is ready`)
  );
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sendEmail = async (to: string, subject: string, body: string) => {
  if (!isValidEmail(to)) {
    throw new MailServiceError('Email not sent: Invalid recipient provided');
  }

  if (subject === '') {
    throw new MailServiceError('Email not sent: No subject provided');
  }

  if (body === '') {
    throw new MailServiceError('Email not sent: No body provided');
  }

  await _transporter.sendMail({
    from: process.env.AUTH_EMAIL,
    to,
    subject,
    html: body,
  });
};

export const sendVerificationEmail = async (email: string, url: string) => {
  logger.info(`Sending verification email to ${email}`);

  const subject = 'Verify your email';
  const body = `
      <h1>Email Verification</h1>
      <p>Click <a href="${url}">here</a> to verify your email</p>
      <p><span>This link expires in 30 minutes</span></p>
    `;

  await sendEmail(email, subject, body);
};

// export default transporter;
