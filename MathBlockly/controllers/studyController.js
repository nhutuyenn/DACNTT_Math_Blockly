


module.exports = {
    study_get: async (req, res) => {
        const lesson = await Lesson.find();
        const question = await Question.find();
        const answer = await Answer.find();
        console.log(lesson);
        console.log(question.direction);
        console.log(answer.answer);
        res.render('StudyPage');
    }
}