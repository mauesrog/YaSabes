import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

import { validateEmail, validatePassword, validateUsername } from '../utils';

// create a schema for posts with a field
const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validateEmail, 'Email not from pseudo-elite schools'],
  },
  password: {
    type: String,
    validate: [validatePassword, 'Invalid password'],
  },
  username: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validateUsername, 'Invalid username'],
  },
  bio: {
    type: String,
    default: '',
  },
  firstName: String,
  secondName: {
    type: String,
    default: '',
  },
  lastName: String,
  age: {
    type: Number,
    min: 18,
    max: 100,
  },
  matches: [{
    type: [Schema.Types.ObjectId],
    ref: 'Match',
    default: [],
  }],
  conversations: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
  },
}, {
  timestamp: true,
}
);


UserSchema.pre('save', function encryptPassword(next) {
  try {
    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, (err, salt) => {
      try {
        if (err) { return next(err); }

        // hash (encrypt) our password using the salt
        bcrypt.hash(user.password, salt, null, (err, hash) => {
          try {
            if (err) { return next(err); }

            const firstNames = user.firstName.split(' ');
            const lastNames = user.firstName.split(' ');

            let firstNamesString = '';
            let lastNamesString = '';

            for (let i = 0; i < firstNames.length; i++) {
              firstNamesString += firstNames[i].charAt(0).toUpperCase() + firstNames[i].slice(1);

              if (i < firstNames.length - 1) {
                firstNamesString += ' ';
              }
            }

            for (let i = 0; i < lastNames.length; i++) {
              lastNamesString += lastNames[i].charAt(0).toUpperCase() + lastNames[i].slice(1);

              if (i < lastNames.length - 1) {
                lastNamesString += ' ';
              }
            }

            if (typeof user.secondName !== 'undefined') {
              const secondNames = user.firstName.split(' ');
              let secondNamesString = '';

              for (let i = 0; i < secondNames.length; i++) {
                secondNamesString += secondNames[i].charAt(0).toUpperCase() + secondNames[i].slice(1);

                if (i < secondNames.length - 1) {
                  secondNamesString += ' ';
                }
              }

              user.secondName = secondNamesString;
            }

            // overwrite plain text password with encrypted password
            user.password = hash;
            user.firstName = firstNamesString;
            user.lastName = lastNamesString;
            return next();
          } catch (err) {
            next(err);
          }
        });
      } catch (err) {
        return next(err);
      }
    });
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
  try {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      try {
        if (err) { return callback(err); }

        callback(null, isMatch);
      } catch (err) {
        callback(err);
      }
    });
  } catch (err) {
    callback(err);
  }
};

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
