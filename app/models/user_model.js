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
    validate: [validateUsername, 'Invalid username'],
  },
  bio: {
    type: String,
    default: '',
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

            // overwrite plain text password with encrypted password
            user.password = hash;
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
