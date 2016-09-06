import Conversation from '../models/conversation_model';
import User from '../models/user_model';
import Message from '../models/message_model';
import ConversationRef from '../models/conversation_ref_model';

const errorHead = 'Error splicing into conversations head.';

const locatUserConvoRef = (userId, conversation, location) => {
  return new Promise((resolve, reject) => {
    try {
      ConversationRef.findById(conversation[location][0])
      .then(convoRef1 => {
        try {
          if (convoRef1.userId.toString() === userId) {
            resolve(convoRef1);
          } else {
            if (conversation[location].length > 1) {
              ConversationRef.findById(conversation[location][1])
              .then(convoRef2 => {
                try {
                  if (convoRef2.userId.toString() === userId) {
                    resolve(convoRef1);
                  } else {
                    reject('No convo refs match user');
                  }
                } catch (err) {
                  reject(err);
                }
              })
              .catch(error => {
                reject(error);
              });
            } else {
              reject('Only one convo ref available. Missing ref');
            }
          }
        } catch (err) {
          reject(err);
        }
      })
      .catch(error => {
        reject(error);
      });
    } catch (err) {
      reject(err);
    }
  });
};

const updateUserConvoRef = (userId, conversation, convoId, location) => {
  return new Promise((resolve, reject) => {
    try {
      locatUserConvoRef(userId, conversation, location)
      .then(convoRef => {
        try {
          ConversationRef.update({ _id: convoRef._id }, { convoId })
          .then(success => {
            try {
              resolve(success);
            } catch (err) {
              reject(err);
            }
          })
          .catch(error => {
            reject(error);
          });
        } catch (err) {
          reject(err);
        }
      })
      .catch(error => {
        reject(error);
      });
    } catch (err) {
      reject(err);
    }
  });
};

const spliceOutConversationBothEndsHelper = (resolve, revoke, convIds, i) => {
  try {
    if (convIds[i] !== null) {
      const prevId = convIds[i][0];
      const nextId = convIds[i][1];
      const userId = convIds[i][2];

      console.log('hey');

      Conversation.findById(prevId)
      .then(prevConvo => {
        try {
          Conversation.findById(nextId)
          .then(nextConvo => {
            try {
              updateUserConvoRef(userId.toString(), prevConvo, nextId, 'next')
              .then(success1 => {
                try {
                  console.log('success1');
                  console.log(success1);

                  updateUserConvoRef(userId.toString(), nextConvo, prevId, 'prev')
                  .then(success2 => {
                    try {
                      console.log('success2');
                      console.log(success2);

                      if (i === convIds.length - 1) {
                        resolve();
                      } else {
                        spliceOutConversationBothEndsHelper(resolve, revoke, convIds, i + 1);
                      }
                    } catch (err) {
                      revoke(err);
                    }
                  })
                  .catch(error => {
                    revoke(error);
                  });
                } catch (err) {
                  revoke(err);
                }
              })
              .catch(error => {
                revoke(error);
              });
            } catch (err) {
              revoke(err);
            }
          })
          .catch(error => {
            revoke(error);
          });
        } catch (err) {
          revoke(err);
        }
      })
      .catch(error => {
        revoke(error);
      });
    } else {
      if (i === convIds.length - 1) {
        resolve();
      } else {
        spliceOutConversationBothEndsHelper(resolve, revoke, convIds, i + 1);
      }
    }
  } catch (err) {
    revoke(err);
  }
};

const spliceOutConversationBothEnds = convIds => {
  return new Promise((resolve, revoke) => {
    try {
      spliceOutConversationBothEndsHelper(resolve, revoke, convIds, 0);
    } catch (err) {
      revoke(err);
    }
  });
};

const spliceIntoBeginningHelper = (resolve, revoke, result, newConversation, users, i) => {
  try {
    const currentUserConvoHead = users[i];
    const currentUserId = currentUserConvoHead.users[0];

    locatUserConvoRef(currentUserId.toString(), currentUserConvoHead, 'next')
    .then(nextConvoRef => {
      try {
        updateUserConvoRef(currentUserId.toString(), currentUserConvoHead, newConversation._id, 'next')
        .then(success => {
          try {
            console.log('success1');
            console.log(success);
            Conversation.findById(nextConvoRef.convoId)
            .then(nextConvo => {
              try {
                updateUserConvoRef(currentUserId.toString(), nextConvo, newConversation._id, 'prev')
                .then(success2 => {
                  try {
                    console.log('success1');
                    console.log(success);

                    result.push(currentUserConvoHead._id);
                    result.push(nextConvo._id);

                    if (i === users.length - 1) {
                      resolve(result);
                    } else {
                      spliceIntoBeginningHelper(resolve, revoke, result, newConversation, users, i + 1);
                    }
                  } catch (err) {
                    revoke(err);
                  }
                })
                .catch(error => {
                  revoke(error);
                });
              } catch (err) {
                revoke(err);
              }
            })
            .catch(error => {
              revoke(error);
            });
          } catch (err) {
            revoke(err);
          }
        })
        .catch(error => {
          revoke(error);
        });
      } catch (err) {
        revoke(err);
      }
    })
    .catch(error => {
      revoke(error);
    });
  } catch (err) {
    revoke(err);
  }
};

const spliceIntoBeginning = (newConversation, users) => {
  return new Promise((resolve, revoke) => {
    try {
      spliceIntoBeginningHelper(resolve, revoke, [], newConversation, users, 0);
    } catch (err) {
      revoke(err);
    }
  });
};

const getMessagesHelper = (resolve, revoke, currConversation, conversationsArray, limit, i) => {
  try {
    let latestConversation;

    if (i === 0) {
      latestConversation = {
        id: currConversation._id,
        user1: currConversation.users[0],
        user2: currConversation.users[1],
        messages: [],
      };
    } else {
      latestConversation = conversationsArray[conversationsArray.length - 1];
    }

    Message.findById(currConversation.messages[limit === 1 ? currConversation.messages.length - 1 : i])
    .then(message => {
      try {
        latestConversation.messages.push(message);

        if (i === 0) {
          User.findById(currConversation.users[0])
          .then(user1Data => {
            try {
              User.findById(currConversation.users[1])
              .then(user2Data => {
                try {
                  latestConversation.usernameUser1 = user1Data.username;
                  latestConversation.usernameUser2 = user2Data.username;

                  conversationsArray.push(latestConversation);

                  if (i === currConversation.messages.length - 1 || (limit !== null && i === limit - 1)) {
                    resolve();
                  } else {
                    getMessagesHelper(resolve, revoke, currConversation, conversationsArray, limit, i + 1);
                  }
                } catch (err) {
                  revoke(err);
                }
              })
              .catch(error => {
                revoke(error);
              });
            } catch (err) {
              revoke(err);
            }
          })
          .catch(error => {
            revoke(error);
          });
        } else {
          if (i === currConversation.messages.length - 1 || (limit !== null && i === limit - 1)) {
            resolve();
          } else {
            getMessagesHelper(resolve, revoke, currConversation, conversationsArray, limit, i + 1);
          }
        }
      } catch (err) {
        revoke(err);
      }
    })
    .catch(error => {
      revoke(error);
    });
  } catch (err) {
    revoke(err);
  }
};

const getMessages = (currConversation, conversationsArray, limit) => {
  return new Promise((resolve, revoke) => {
    try {
      getMessagesHelper(resolve, revoke, currConversation, conversationsArray, limit, 0);
    } catch (err) {
      revoke(err);
    }
  });
};

const getConversationsArrayHelper = (resolve, revoke, currConversation, userId, limit, conversationsArray) => {
  try {
    if (currConversation === null) {
      resolve(conversationsArray);
    } else {
      locatUserConvoRef(userId.toString(), currConversation, 'next')
      .then(convoRef => {
        try {
          Conversation.findById(convoRef.convoId)
          .then(conv => {
            try {
              if (userId !== null && conv.head) {
                resolve(conversationsArray);
              } else {
                getMessages(conv, conversationsArray, limit)
                .then(() => {
                  try {
                    const nextConv = userId === null ? null : conv;

                    getConversationsArrayHelper(resolve, revoke, nextConv, userId, limit, conversationsArray);
                  } catch (err) {
                    revoke(err);
                  }
                })
                .catch(error => {
                  revoke(error);
                });
              }
            } catch (err) {
              revoke(err);
            }
          })
          .catch(error => {
            revoke(error);
          });
        } catch (err) {
          revoke(err);
        }
      })
      .catch(error => {
        revoke(error);
      });
    }
  } catch (err) {
    revoke(err);
  }
};

const getConversationsArray = (currConversation, limit) => {
  return new Promise((resolve, revoke) => {
    try {
      getConversationsArrayHelper(resolve, revoke, currConversation, currConversation.users[0], limit, []);
    } catch (err) {
      revoke(err);
    }
  });
};

export const createConversation = (req, res) => {
  try {
    if (typeof req.body.userId === 'undefined') {
      res.json({
        error: 'ERR: \'userId\' field required',
      });
    } else {
      const conversation = new Conversation();
      const message = new Message();
      const conversationRefPrevUser1 = new ConversationRef();
      const conversationRefNextUser1 = new ConversationRef();
      const conversationRefPrevUser2 = new ConversationRef();
      const conversationRefNextUser2 = new ConversationRef();

      const userId = req.user._id;
      const userId2 = req.body.userId;

      conversation.users = [userId, userId2];
      conversation.messages = [];

      conversationRefPrevUser1.userId = userId;
      conversationRefNextUser1.userId = userId;
      conversationRefPrevUser2.userId = userId2;
      conversationRefNextUser2.userId = userId2;

      message.text = `Hey, I just bought one of your spots! ${conversation._id}`;

      message.save()
      .then(savedMessage => {
        try {
          conversation.messages.push(savedMessage._id);

          User.findById(userId)
          .then(user1 => {
            try {
              User.findById(userId2)
              .then(user2 => {
                try {
                  Conversation.findById(user1.conversations)
                  .then(user1Head => {
                    try {
                      Conversation.findById(user2.conversations)
                      .then(user2Head => {
                        try {
                          spliceIntoBeginning(conversation, [user1Head, user2Head])
                          .then(result => {
                            try {
                              console.log(result);

                              conversationRefPrevUser1.convoId = result[0];
                              conversationRefNextUser1.convoId = result[1];
                              conversationRefPrevUser2.convoId = result[2];
                              conversationRefNextUser2.convoId = result[3];

                              conversationRefPrevUser1.save()
                              .then(refPrev1 => {
                                try {
                                  conversationRefNextUser1.save()
                                  .then(refNext1 => {
                                    try {
                                      conversationRefPrevUser2.save()
                                      .then(refPrev2 => {
                                        try {
                                          conversationRefNextUser2.save()
                                          .then(refNext2 => {
                                            try {
                                              conversation.prev = [refPrev1._id, refPrev2._id];
                                              conversation.next = [refNext1._id, refNext2._id];

                                              conversation.save()
                                              .then(success => {
                                                try {
                                                  res.json({
                                                    id: conversation._id,
                                                    user1: conversation.users[0],
                                                    user2: conversation.users[1],
                                                    message: `Successfully created conversation '${conversation._id}'`,
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
        } catch (err) {
          res.json({ error: `${err}` });
        }
      })
      .catch(error => {
        res.json({ error: `${error}` });
      });
    }
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const popConversationToTop = (req, res) => {
  try {
    if (typeof req.params.conversationId === 'undefined') {
      res.json({
        error: 'Popping conversation requires \'requester type\' and  \'conversationId\' fields',
      });
    } else {
      User.findById(req.user._id)
      .then(userData => {
        try {
          Conversation.findById(userData.conversations)
          .then(userConvHead => {
            try {
              Conversation.findById(req.params.conversationId)
              .then(conv => {
                try {
                  locatUserConvoRef(userData._id.toString(), userConvHead, 'next')
                  .then(headNextRef => {
                    try {
                      if (headNextRef.convoId.toString() === conv._id.toString()) {
                        res.json({ message: 'Conversation already at the top' });
                      } else {
                        locatUserConvoRef(userData._id.toString(), conv, 'next')
                        .then(convNextHead => {
                          try {
                            locatUserConvoRef(userData._id.toString(), conv, 'prev')
                            .then(convPrevHead => {
                              try {
                                spliceOutConversationBothEnds([[convPrevHead.convoId, convNextHead.convoId, userData._id], null])
                                .then((renter, vendor) => {
                                  try {
                                    spliceIntoBeginning(conv, [userConvHead])
                                    .then(result => {
                                      try {
                                        updateUserConvoRef(userData._id.toString(), conv, result[0], 'prev')
                                        .then(success1 => {
                                          try {
                                            console.log('final success1');
                                            console.log(success1);

                                            updateUserConvoRef(userData._id.toString(), conv, result[1], 'next')
                                            .then(success2 => {
                                              try {
                                                console.log('final success2');
                                                console.log(success2);

                                                res.json({ message: `Successfully popped conversation '${req.params.conversationId}' to top` });
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
                      }
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
    }
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const getConversations = (req, res) => {
  try {
    User.findById(req.user._id)
    .then(userData => {
      try {
        Conversation.findById(userData.conversations)
        .then(currConversation => {
          try {
            if (!currConversation.head) {
              res.json({ error: `${errorHead}` });
            } else {
              getConversationsArray(currConversation, 1)
              .then(conversations => {
                try {
                  res.json({ conversations });
                } catch (err) {
                  res.json({ error: `${err}` });
                }
              })
              .catch(error => {
                res.json({ error: `${error}` });
              });
            }
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
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const getConversation = (req, res) => {
  try {
    Conversation.findById(req.params.conversationId)
    .then(currConversation => {
      try {
        if (currConversation.head) {
          res.json({ error: `${errorHead}` });
        } else {
          getConversationsArray(currConversation, null, null)
          .then(conversations => {
            try {
              res.json({ conversations });
            } catch (err) {
              res.json({ error: `${err}` });
            }
          })
          .catch(error => {
            res.json({ error: `${error}` });
          });
        }
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

export const deleteConversation = (req, res) => {
  try {
    if (typeof req.params.conversationId === 'undefined') {
      res.json({
        error: 'ERR: Conversation deletion needs \'conversation id\' fields',
      });
    } else {
      Conversation.findById(req.params.conversationId)
      .then(conv => {
        try {
          const renterId = conv.renter;
          const vendorId = conv.vendor;
          spliceOutConversationBothEnds([[conv.prev.renter, conv.next.renter], [conv.prev.vendor, conv.next.vendor]])
          .then((renter, vendor) => {
            try {
              Conversation.remove({ _id: conv._id })
              .then(success => {
                try {
                  res.json({ message: `Successfully spliced out conversation ${conv._id} from renter ${renterId} and vendor ${vendorId}!` });
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
        } catch (err) {
          res.json({ error: `${err}` });
        }
      })
      .catch(error => {
        res.json({ error: `${error}` });
      });
    }
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const sendMessage = (req, res) => {
  try {
    if (typeof req.params.requester === 'undefined' || typeof req.body.message === 'undefined') {
      res.json({
        error: 'ERR: Sending a message needs \'requester\' and \'message\' fields',
      });
    } else {
      const newMessage = new Message();

      newMessage.sender = req.params.requester;
      newMessage.text = req.body.message;

      newMessage.save()
      .then(msg => {
        try {
          Conversation.findById(req.params.conversationId)
          .then(conv => {
            try {
              const messages = conv.messages.slice(0);
              messages.push(msg._id);

              const updateMessages = { messages };

              Conversation.update({ _id: req.params.conversationId }, updateMessages)
              .then(success => {
                try {
                  res.json({ message: `Successfully added message '${msg._id}' with text '${msg.text}' to conversation '${conv._id}'` });
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
        } catch (err) {
          res.json({ error: `${err}` });
        }
      })
      .catch(error => {
        res.json({ error: `${error}` });
      });
    }
  } catch (err) {
    res.json({ error: `${err}` });
  }
};
