import jwt from 'jwt-simple';
import config from '../config';

export const tokenForUser = user => {
  const timestamp = new Date().getTime();
  const sub = user.id ? user.id : user._id;

  return jwt.encode({ sub, iat: timestamp }, config.secret);
};

export const emailVerificationToken = user => {
  const timestamp = new Date().getTime();
  const sub = user.id ? user.id : user._id;

  return jwt.encode({ sub: `emailAuthForUser:${sub}`, iat: timestamp }, config.secret);
};

export const userFromToken = token => {
  try {
    return jwt.decode(token, config.secret);
  } catch (err) {
    return null;
  }
};

export const userFromVerificationToken = token => {
  try {
    return jwt.decode(token, config.secret).sub.replace('emailAuthForUser:', '');
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const validateArrayLength = (val, limit) => {
  return val.length < limit;
};

export const validateEmail = v => {
  // const emailRegex = /^([a-zA-Z0-9_\-\.]+)@(ibero\.edu\.mx|dartmouth\.edu|up\.edu\.mx|centro\.edu\.mx|itesm\.mx|anahuac\.mx)$/;
  const emailRegex = /^([a-zA-Z0-9_\-\.]+)@(ibero\.edu\.mx|up\.edu\.mx|centro\.edu\.mx|itesm\.mx|anahuac\.mx)$/;
  return emailRegex.test(v);
};

export const validatePassword = v => {
  const passwordRegex = /^[a-zA-Z0-9_\-\.\\\?!\$ñ]{0,10}$/;
  return passwordRegex.test(v);
};

export const validateUsername = v => {
  const usernameRegex = /^[a-zA-Z0-9_\-\.]{0,20}$/;
  return usernameRegex.test(v);
};
