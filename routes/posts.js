var express = require('express');
var router = express.Router();

const { check, validationResult } = require('express-validator');

const mongo = require('../bin/mongo');
const ObjectId = require('mongodb').ObjectId;

/**
 * GET posts listing
 */
router.get('/', function (req, res, next) {
    let request = req.query.sub
        ? {
            $or: [
                { parent_id: { $exists: false } },
                { parent_id: "" },
                { achived: { $exists: true } },
                { archived: 1 },
            ],
            $query: { sub: req.query.sub }
        }
        : {
            $or: [
                { parent_id: { $exists: false } },
                { parent_id: "" },
                { achived: { $exists: true } },
                { archived: 1 }
            ]
        };

    mongo.getInstance().collection('posts').find(request).toArray((err, posts) => {
        if (err) throw err;

        res.send({ ok: true, posts, query: req.query })
    });
});

/**
 * Création d'un post
 */
router.post('/', [
    check('title').not().isEmpty(),
    check('message').isLength({ max: 5000 }),
    check('sub').not().isEmpty()
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.send({ ok: false, errors });

    if (req.session.user && req.session.user !== "") {
        const dateTime = new Date();
        const usersRate = [];
        const rate = 0;
        const nbComments = 0;
        const author = {
            _id: req.session.user._id,
            pseudo: req.session.user.pseudo,
            avatar: req.session.user.avatar || ''
        }
        const newPost = {
            title: req.body.title,
            message: req.body.message,
            sub: req.body.sub,
            author,
            dateTime,
            rate,
            usersRate,
            nbComments
        }

        mongo.getInstance().collection('posts').insertOne(newPost);
        res.send({ ok: true, post: newPost });

    } else {
        res.send({ ok: false, message: 'user has to be connected' });
    }

});

/**
 * Voir un post
 */
router.get('/:id', (req, res) => {
    mongo.getInstance().collection('posts').findOne({ _id: ObjectId(req.params.id) }, (err, post) => {
        if (err) throw err;

        res.send({ ok: true, post });
    });
});

/**
 * Création d'un commentaire
 */
router.post('/:id', [
    check('message').not().isEmpty()
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) return res.send({ ok: false, errors });

    if (req.session.user && req.session.user !== "") {
        const dateTime = new Date();
        const usersRate = [];
        const rate = 0;
        const nbComments = 0;
        const author = {
            _id: req.session.user._id,
            pseudo: req.session.user.pseudo,
            avatar: req.session.user.avatar || ''
        }
        const newComment = {
            message: req.body.message,
            parent_id: ObjectId(req.params.id),
            author,
            dateTime,
            rate,
            usersRate,
            nbComments
        }

        mongo.getInstance().collection('posts').insertOne(newComment);
        res.send({ ok: true, post: newComment });

    } else {
        res.send({ ok: false, message: 'user has to be connected' });
    }
});

/**
 * Update un post / commentaire
 */
router.put('/:id', [check('rate').isNumeric()], (req, res) => {
    if (req.session.user && req.session.user !== "") {
        mongo.getInstance().collection('posts').findOne({ _id: ObjectId(req.params.id) }, (err, post) => {
            if (err) throw err;

            const rate = post.rate + req.body.rate;
            const usersRate = [...post.usersRate, {
                userId: req.session.user._id,
                rate: req.body.rate,
                dateTime: new Date()

            }];
            const updatedPost = { ...post, rate, usersRate };

            mongo.getInstance().collection('posts').updateOne({ _id: ObjectId(req.params.id) }, { $set: updatedPost }, (err, result) => {
                if (err) throw err;

                res.send({ ok: true });
            });
        });

    } else {
        res.send({ ok: false, message: 'user has to be connected' })
    }
});

/**
 * Supprimer un post / commentaire
 */
router.delete('/:id', (req, res) => {
    mongo.getInstance().collection('posts').findOne({ _id: ObjectId(req.params.id) }, (err, post) => {
        if (err) throw err;

        if (post && !post.archived && !post.parent_id && post.parent_id !== "") {
            mongo.getInstance().collection('posts').updateOne(
                { _id: ObjectId(post._id) },
                { $set: { ...post, archived: true } },
                (err, result) => {
                    if (err) throw err;

                    res.send({ ok: true });
                });

        } else {
            res.send({ ok: false, message: 'comment or already archived' });
        }
    });
});

module.exports = router;