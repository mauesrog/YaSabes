import User from '../models/user_model';
import Conversation from '../models/conversation_model';
import ConversationRef from '../models/conversation_ref_model';
import { emailVerificationToken, tokenForUser, userFromVerificationToken } from '../utils';

import multer from 'multer';
import sendgrid from 'sendgrid';

import config from '../config';

const sg = require('sendgrid')(config.sendgridSecret);

import fs from 'fs';

const helper = sendgrid.mail;

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    console.log('file is', file);
    cb(null, true);
  },
}).single('image');

export const sendVerificationToken = (req, res) => {
  try {
    const from_email = new helper.Email('mauricio.esquivel.rogel.18@dartmouth.edu');
    const to_email = new helper.Email(req.user.email);
    const subject = 'Verifica tu cuenta Ya Sabe';
    const content = new helper.Content('text/plain', `Hola ${req.user.firstName},\n¡Bienvenido a Ya Sabes! Nos emociona mucho darte la bienvenida a esta hermosa comunidad. Por favor copia y pega este token en la app para verificar tu cuenta:\n\t${emailVerificationToken(req.user)}`);
    const mail = new helper.Mail(from_email, subject, to_email, content);

    const request = sg.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON(),
    });

    sg.API(request, (error, response) => {
      try {
        if (error) {
          res.json({ error: `${error}` });
        } else {
          console.log('hahaha');
          console.log(response.statusCode);
          console.log(response.body);
          console.log(response.headers);

          res.json({ message: `Email verification sent to ${req.user.email} for user ${req.user._id}` });
        }
      } catch (err) {
        res.json({ error: `${err}` });
      }
    });
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const signup = (req, res) => {
  try {
    const user = new User();
    const conversationHead = new Conversation();
    const conversationInitialRef = new ConversationRef();

    if (typeof req.body.email === 'undefined' || typeof req.body.password === 'undefined' ||
      typeof req.body.username === 'undefined' || typeof req.body.firstName === 'undefined' ||
      typeof req.body.lastName === 'undefined' || typeof req.body.age === 'undefined') {
      console.log('not all fields present');
      res.json({
        error: 'ERR: Users need \'email\', \'password\', \'username\', \'firstName\', \'lastName\', and \'age\' fields',
      });
    } else {
      user.email = req.body.email;
      user.password = req.body.password;
      user.username = req.body.username;
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.age = req.body.age;

      if (typeof req.body.bio !== 'undefined' && req.body.bio.length > 0) {
        user.bio = req.body.bio;
      }

      if (typeof req.body.secondName !== 'undefined' && req.body.secondName.length > 0) {
        user.secondName = req.body.secondName;
      }

      conversationInitialRef.userId = user._id;
      conversationInitialRef.convoId = conversationHead._id;

      conversationInitialRef.save()
      .then(convoRef => {
        try {
          conversationHead.users = [user._id, user._id];
          conversationHead.head = true;
          conversationHead.next = [];
          conversationHead.next.push(convoRef._id);
          conversationHead.prev = conversationHead.next;

          conversationHead.save()
          .then(resultConvo => {
            try {
              user.conversations = resultConvo._id;

              user.save()
              .then(result => {
                try {
                  const fakeReq = { user: result };
                  const fakeRes = {
                    json: jsonData => {
                      try {
                        res.json(typeof jsonData.error === 'undefined' ? {
                          user: result,
                          token: tokenForUser(result),
                          message: `User created with \'id\' ${result._id}!`,
                        } : { error: jsonData.error });
                      } catch (err) {
                        res.json({ error: `${err}` });
                      }
                    },
                  };

                  sendVerificationToken(fakeReq, fakeRes);
                } catch (err) {
                  console.log(`res json error: ${err}`);
                  res.json({ error: `${err}` });
                }
              })
              .catch(error => {
                console.log(`user save error: ${error}`);
                res.json({ error: `${error}` });
              });
            } catch (err) {
              console.log(`general error level 2: ${err}`);
              res.json({ error: `${err}` });
            }
          })
          .catch(error => {
            console.log(`conversation save error: ${error}`);
            res.json({ error: `${error}` });
          });
        } catch (err) {
          res.json({ error: `${err}` });
        }
      })
      .catch(error => {
        res.json({ error: `${error}` });
      });
    }
  } catch (err) {
    console.log(`general error: ${err}`);
    res.json({ error: `${err}` });
  }
};

export const signin = (req, res) => {
  try {
    User.findById(req.user._id)
    .then(user => {
      res.json({
        user,
        message: `User ${user._id}, ${user.username} successfully logged in`,
        token: tokenForUser(req.user),
      });
    })
    .catch(error => {
      console.log(`signing: ${error}`);
      res.json({ error: `${error}` });
    });
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const updateUserData = (req, res) => {
  try {
    User.update({ _id: req.user._id }, req.body)
    .then(updatedUser => {
      try {
        res.json({
          message: `User data updated for user ${req.user._id}`,
          user: updatedUser,
        });
      } catch (err) {
        res.json({ error: `${err}` });
      }
    })
    .catch(error => {
      res.json({ error: `${error}` });
    });
    res.json({ message: 'yes' });
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const getUserData = (req, res) => {
  try {
    User.findById(req.user._id)
    .then(user => {
      try {
        res.json({ user });
      } catch (err) {
        res.json({ error: `${err}` });
      }
    })
    .catch(error => {
      res.json({ error: `${error}` });
    });
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const getProfilePicture = (req, res) => {
  try {
    User.findById(req.user._id)
    .then(userData => {
      try {
        res.json(userData.profilePicture);
      } catch (err) {
        res.json({ error: `${err}` });
      }
    })
    .catch(error => {
      res.json({ error: `${error}` });
    });
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const setProfilePicture = (req, res) => {
  try {
    upload(req, res, error => {
      if (error) {
        res.json({ error: `${error}` });
      } else {
        const profilePicture = {
          data: fs.readFileSync(req.file.path),
          contentType: 'image/png',
        };

        User.update({ _id: req.user._id }, { profilePicture })
        .then(updatedUser => {
          try {
            res.json({
              message: `Profile picture added for user ${req.user._id}`,
              profilePicture,
            });
          } catch (err) {
            res.json({ error: `${err}` });
          }
        })
        .catch(error2 => {
          res.json({ error: `${error2}` });
        });
      }
    });
  } catch (err) {
    res.json({ error: `${err}` });
  }
};


export const checkVerificationToken = (req, res) => {
  try {
    if (typeof req.body.verificationToken === 'undefined') {
      console.log('not all fields present');
      res.json({
        error: 'Users need \'verificationToken\'field',
      });
    } else {
      console.log(userFromVerificationToken(req.body.verificationToken));
      if (userFromVerificationToken(req.body.verificationToken) === req.user._id.toString()) {
        User.update({ _id: req.user._id }, { verified: true })
        .then(success => {
          try {
            console.log(success);
            User.findById(req.user._id)
            .then(user => {
              try {
                res.json({
                  user,
                  message: 'Account verified',
                });
              } catch (err) {
                res.json({ error: `${err}` });
              }
            })
            .catch(error => {
              res.json({ error: `${error}` });
            });
          } catch (err) {
            res.json({ error: `${err}` });
          }
        })
        .catch(error => {
          res.json({ error: `${error}` });
        });
      } else {
        res.json({ error: 'User ids don\'t match: invalid verification token' });
      }
    }
  } catch (err) {
    res.json({ error: `${err}` });
  }
};
