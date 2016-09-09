import dotenv from 'dotenv';

dotenv.config();

export default {
  secret: process.env.API_SECRET,
  sendgridSecret: process.env.SENDGRID_API_KEY,
};
