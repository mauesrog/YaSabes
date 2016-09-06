import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import config from '../config';

// and import User and your config with the secret
import User from '../models/user_model';

// options for local strategy, we'll use username AS the username
// not have separate ones
const localOptions = { usernameField: 'username' };

// options for jwt strategy
// we'll pass in the jwt in an `authorization` header
// so passport can find it there
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret,
};

// username + password authentication strategy
const localLogin = new LocalStrategy(localOptions, (username, password, done) => {
  // Verify this username and password, call done with the user
  // if it is the correct username and password
  // otherwise, call done with false
  User.findOne({ username }, (err, renter) => {
    if (err) { return done(err); }

    if (!renter) { return done(null, false); }

    // compare passwords - is `password` equal to user.password?
    User.comparePassword(password, (err, isMatch) => {
      if (err) {
        done(err);
      } else if (!isMatch) {
        done(null, false);
      } else {
        done(null, renter);
      }
    });
  });
});

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  console.log(payload);
  // See if the user ID in the payload exists in our database
  // If it does, call 'done' with that other
  // otherwise, call done without a user object
  User.findById(payload.sub, (err, renter) => {
    if (err) {
      done(err, false);
    } else if (renter) {
      done(null, renter);
    } else {
      done(null, false);
    }
  });
});

// Tell passport to use this strategy
passport.use('login', localLogin);
passport.use('auth', jwtLogin);


export const requireSignin = passport.authenticate('login', { session: false });
export const requireAuth = passport.authenticate('auth', { session: false });