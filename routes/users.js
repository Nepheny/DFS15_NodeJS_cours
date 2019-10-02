var express = require('express');
var router = express.Router();

const { check, validationResult } = require('express-validator');
const crypto = require('crypto');

const mongo = require('../bin/mongo');
const ObjectId = require('mongodb').ObjectId;

/**
   * GET users listing
   */
router.get('/', function (req, res, next) {
  res.render('users', {});
});

/**
 * Création d'un utilisateur
 */
router.post('/', [
  check('pseudo').isAlphanumeric(),
  check('email').isEmail(),
  check('password').isLength({ min: 4 })
], (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) return res.send({ ok: false, errors });

  mongo.getInstance().collection('users').find({ email: req.body.email }).toArray((err, users) => {
    if (err) throw err;

    if (users.length > 0) {
      res.send({ ok: false, message: 'user already exists' })

    } else {
      const hash = crypto.createHash('sha256');
      const newUser = {
        pseudo: req.body.pseudo,
        email: req.body.email,
        password: hash.update(req.body.password).digest('hex'),
        avatar: '',
        lastUpdate: new Date(),
        creationDate: new Date()
      }

      mongo.getInstance().collection('users').insertOne(newUser);
      mongo.getInstance().collection('users').findOne({ email: req.body.email }, (err, user) => {
        if (err) throw err;

        user ? res.send({ ok: true, user }) : res.send({ ok: false, message: 'registration failed' })
      });
    }
  });
});

/**
 * Login d'un utilisateur
 */
router.put('/', (req, res) => {
  if (req.session.user && req.session.user !== "") {
    res.send({ ok: false, message: 'user already connected' });

  } else {
    mongo.getInstance().collection('users').findOne({ email: req.body.email }, (err, user) => {
      if (err) throw err;

      const hash = crypto.createHash('sha256');

      if (hash.update(req.body.password).digest('hex') === user.password) {
        const lastConnect = new Date();
        const updatedUser = { ...user, lastConnect }

        mongo.getInstance().collection('users').updateOne({ email: req.body.email }, { $set: updatedUser }, (err, result) => {
          req.session.user = updatedUser;
          req.
            res.send({ ok: true, session: req.session });
        });

      } else {
        res.send({ ok: false, message: 'user does not exists' });
      }
    });
  }
});

/**
 * Déconnexion
 */
router.delete('/', (req, res) => {
  if (!req.session.user) {
    res.send({ ok: false, message: 'user already disconnected' });
  } else {
    req.session.destroy(() => res.send({ ok: true, session: req.session }));
  }
});

/**
 * GET user details
 */
router.get('/:id', (req, res) => {
  mongo.getInstance().collection('users').findOne({ _id: ObjectId(req.params.id) }, (err, user) => {
    if (err) throw err;

    res.send({ ok: true, user });
  });
});

/**
 * Mise à jour d'un utilisateur
 */
router.put('/:id', (req, res) => {
  if (req.body.avatar) check('avatar').isString();
  if (req.body.description) check('description').isString();
  if (req.body.email) check('email').isEmail();
  if (req.body.password) check('pseudo').isAlphanumeric();
  if (req.body.password) check('password').isLength({ min: 4 });

  const errors = validationResult(req);

  if (!errors.isEmpty()) return res.send({ ok: false, errors });

  const lastUpdate = new Date();
  let updatedUser = {};

  if (req.body.password) {
    const hash = crypto.createHash('sha256');

    updatedUser = {
      ...req.body,
      lastUpdate,
      password: hash.update(req.body.password).digest('hex')
    };

  } else {
    updatedUser = {
      ...req.body,
      lastUpdate,
    };
  }

  mongo.getInstance().collection('users').updateOne({ _id: ObjectId(req.params.id) }, { $set: updatedUser }, (err, result) => {
    if (err) throw err;

    res.send({ ok: true });
  });
});

/**
 * Supprime un utilisateur
 */
router.delete('/:id', (req, res) => {
  mongo.getInstance().collection('users').findOne({ _id: ObjectId(req.params.id) }, (err, user) => {
    if (err) throw err;

    mongo.getInstance().collection('users').deleteOne({ _id: ObjectId(user._id) }, (err, result) => {
      if (err) throw err;

      res.send({ ok: true });
    });
  });
});

module.exports = router;
