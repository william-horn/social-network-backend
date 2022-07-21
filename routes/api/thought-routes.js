

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

        res.status(200).json(thoughts);
    } catch(err) {
        res.status(500).json(err);
    }
};

// create a new thought
const POST_ROOT = async ({ body }, res) => {
    try {
        const newThought = await Thought.create(body);

        const test = await User.findOneAndUpdate(
            {},
            { $push: { thoughts: newThought._id }},
            { new: true }
        );

        console.log('updated: ', test);

        res.json(newThought);
    } catch(err) {
        res.status(500).json(err);
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
        res.status(500).json(err);
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
        res.status(500).json(err);
    }
};

// delete a thought
const POST_ID = async ({ params, body }, res) => {
    try {
        const thought = await Thought.findOneAndUpdate(
            { _id: params.id },
            { $push: { reactions: body }},
            { new: true }
        )
        .select('-__v');

        if (!thought) {
            return errorThoughtNotFound(res);
        }

        return res.status(200).json(thought);
    } catch(err) {
        res.status(500).json(err);
    }
};

// delete a friend
const DELETE_THOUGHT = async ({ params }, res) => {
    try {
        const thought = await Thought.findOneAndDelete(
            { _id: params.thoughtId },
            { new: true, runValidators: true }
        );

        if (!thought) {
            return errorThoughtNotFound(res);
        }

        await User.findOneAndUpdate(
            { thoughts: params.thoughtId },
            { $pull: { thoughts: params.thoughtId } },
            { new: true }
        );

        return res.status(200).json(thought);
    } catch(err) {
        res.status(500).json(err);
    }
};


// delete a friend
const DELETE_REACTION = async ({ params }, res) => {
    try {
        const thought = await Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: { reactionId: params.reactionId }}},
            { new: true, runValidators: true }
        )
        .select('-__v');

        if (!thought) {
            return errorThoughtNotFound(res);
        }

        return res.status(200).json(thought);
    } catch(err) {
        res.status(500).json(err);
    }
};


// all root routes
router
    .route('/')
    .get(GET_ROOT) // *done
    .post(POST_ROOT) //* done

// all root/:id routes
router
    .route('/:id')
    .get(GET_ID) //*done
    .put(UPDATE_ID) //*done
    .post(POST_ID) //*done

// all root/:id/friends/:friendId routes
router
    .route('/:userId/:thoughtId')
    .delete(DELETE_THOUGHT)


router
    .route('/:userId/:thoughtId/:reactionId')
    .delete(DELETE_REACTION)



module.exports = router

