import nodeMailer from "nodemailer";
import { promisify } from 'util';
import fs from 'fs';
import hbs from 'hbs';


const readFile = promisify(fs.readFile);


const sendEmail = async (options) => {
  const {otp,email,subject,htmlFile}=options;

  const content = await readFile(`view/${htmlFile}`, 'utf8');
  const template = hbs.compile(content);
  const html = template({ otp });

  const transporter = nodeMailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: email,
    subject: subject,
    html: html, // Use 'html' instead of 'text' for HTML content
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
