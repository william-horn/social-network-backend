

const router = require('express').Router();
const { Thought, User } = require('../../models');

const errorThoughtNotFound = res => 
    res.status(404).json({ message: 'thought does not exist' });



// get all thoughts
const GET_ROOT = async (req, res) => {
    try {
        const thoughts = await Thought.find({})
            .select('-__v')
            .sort('-createdAt');

        return res.status(200).json(thoughts);
    } catch(err) {
        console.log('ERROR: ', err);
        return res.status(500).json(err);
    }
};

// get single thought 
const GET_ID = async ({ params }, res) => {
    try {
        const thought = await Thought.findOne({ _id: params.id })
            .select('-__v')

        if (!thought) {
            return errorThoughtNotFound(res);
        }

        return res.status(200).json(thought);
    } catch(err) {
        console.log('ERROR: ', err);
        return res.status(500).json(err);
    }
};

// update a single thought
const UPDATE_ID = async ({ params, body }, res) => {
    try {
        const thought = await Thought.findOneAndUpdate(
            { _id: params.id }, 
            body, 
            { runValidators: true, new: true }
        );

        if (!thought) {
            return errorThoughtNotFound(res);
        }

        return res.status(200).json(thought);
    } catch(err) {
        console.log('ERROR: ', err);
        return res.status(500).json(err);
    }
};

// delete a thought
const POST_ID = async ({ body }, res) => {
    try {
        // const user = await User.findOne({ _id: body.userId });
        const user = await User.findOneAndUpdate(
            { username: body.author },
            { $push: { thoughts: (await Thought.create(body))._id }},
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'user does not exist' });
        }

        return res.status(200).json(user);
    } catch(err) {
        console.log('ERROR: ', err);
        return res.status(500).json(err);
    }
};

const POST_REACTION = async ({ params, body }, res) => {
    try {
        const thought = await Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $addToSet: { reactions: { 
                reactionText: body.reactionText,
                author: body.author
            }}},
            { new: true}
        );

        return res.status(200).json(thought);
    } catch(err) {
        console.log('ERROR: ', err);
        return res.status(500).json(err);
    }
};

const DELETE_ID = async ({ params }, res) => {
    try {
        const thought = await Thought.findOneAndDelete({ _id: params.id });
        
        if (!thought) {
            return errorThoughtNotFound(res);
        }

        await User.findOneAndUpdate(
            { username: thought.author },
            { $pull: { thoughts: thought._id }},
            { new: true, runValidators: true }
        );

        return res.status(200).json({ message: 'DELETED THOUGHT', thoughtDeleted: thought });
    } catch(err) {
        console.log('ERROR: ', err);
        return res.status(500).json(err);
    }
};

// delete a friend
const DELETE_REACTION = async ({ params }, res) => {
    try {
        const thought = await Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: { _id: params.reactionId }}},
            { new: true, runValidators: true }
        )
        .select('-__v');

        if (!thought) {
            return errorThoughtNotFound(res);
        }

        return res.status(200).json(thought);
    } catch(err) {
        console.log('ERROR: ', err);
        return res.status(500).json(err);
    }
};


// all root routes
router
    .route('/')
    .get(GET_ROOT) // *done
    .post(POST_ID) //*done

// all root/:id routes
router
    .route('/:id')
    .get(GET_ID) //*done
    .put(UPDATE_ID) //*done
    .delete(DELETE_ID)


// all root/:thoughtId/reactions
router
    .route('/:thoughtId/reactions')
    .post(POST_REACTION)


router
    .route('/:thoughtId/reactions/:reactionId')
    .delete(DELETE_REACTION)



module.exports = router

