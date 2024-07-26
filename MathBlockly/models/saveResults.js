const mongoose = require('mongoose');
const { Schema } = mongoose;

const saveResultsSchema = new mongoose.Schema({
    resultID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    questionID: {
        type: Schema.Types.ObjectId,
        required: true
    },
    question: {
        type: String
    },
    answerID: {
        type: Object,
    },
});

const SaveResults = mongoose.model('saveResults', saveResultsSchema);

module.exports = SaveResults;
