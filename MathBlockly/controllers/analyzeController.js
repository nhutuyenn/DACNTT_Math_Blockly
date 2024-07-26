const mongoose = require('mongoose');
const ResultModel = require('../models/result');
const LessonModel = require('../models/lessons');

async function calculateTotalDuration(results) {
  try {
    // const results = await ResultModel.find({ accountID: userId });
    const totalDuration = results.reduce((acc, result) => {
      const [hours, minutes, seconds] = result.time.split(':').map(Number);
      const timeInSeconds = (hours * 3600) + (minutes * 60) + seconds;
      return acc + timeInSeconds;
    }, 0);

    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const seconds = totalDuration % 60;

    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    return formattedTime;
  } catch (err) {
    console.error('Error calculating total duration:', err);
    return null;
  }
}

async function totalCorrect(results) {
  try {
    // const results = await ResultModel.find({ accountID: userId });
    let total = 0;
    let exactly = 0;
    for (let i = 0; i < results.length; i++) {
      total += results[i].score;
    }
    exactly = Math.round((total / (results.length * 10)) * 100);
    return exactly;
  } catch (error) {
    console.error('Error calculating total correct:', error);
    return null;
  }
}

async function getTotalLessonsByType(userId, type, { startDate, endDate }) {
  try {
    if (type === 'all') {
      const lessons = await LessonModel.find();
      const lessonIds = lessons.map(lesson => lesson._id);
      const results = await ResultModel.find({
        accountID: userId,
        lessonID: { $in: lessonIds },
        createAt: { $gte: startDate, $lt: endDate } // Sử dụng startDate và endDate để truy vấn
      });
      return results.length;
    }
    const lessons = await LessonModel.find({ type: type });
    const lessonIds = lessons.map(lesson => lesson._id);
    const results = await ResultModel.find({
      accountID: userId,
      lessonID: { $in: lessonIds },
      createAt: { $gte: startDate, $lt: endDate } // Sử dụng startDate và endDate để truy vấn
    });
    return results.length;
  } catch (err) {
    console.error('Error getting total lessons by type:', err);
    return 0;
  }
  }

async function calculateAccuracy(userId, type, { startDate, endDate }) {
    try {
      if (type === 'all') {
        const lessons = await LessonModel.find();
        const lessonIds = lessons.map(lesson => lesson._id);
        const results = await ResultModel.find({ 
          accountID: userId, 
          lessonID: { $in: lessonIds }, 
          createAt: { $gte: startDate, $lt: endDate } 
        });
        let sumPoint = 0;
        for (let i = 0; i < results.length; i++) {
            sumPoint += results[i].score;
        }
        const accuracy = Math.round((sumPoint / (results.length * 10)) * 100);
        if (isNaN(accuracy)) {
          return 0;
        }
        return accuracy;
      }
        const lessons = await LessonModel.find({ type: type });
        const lessonIds = lessons.map(lesson => lesson._id);
        const results = await ResultModel.find({ 
          accountID: userId, 
          lessonID: { $in: lessonIds }, 
          createAt: { $gte: startDate, $lt: endDate } 
        });
        let sumPoint = 0;
        for (let i = 0; i < results.length; i++) {
            sumPoint += results[i].score;
        }
        const accuracy = Math.round((sumPoint / (results.length * 10)) * 100);
        if (isNaN(accuracy)) {
          return 0;
        }
        return accuracy;
    } catch (error) {
        console.error('Error calculating accuracy:', error);
        return null;
    }
}

async function calculateAverageLessonTime(userId, type, { startDate, endDate }) {
    try { 
        if (type === 'all') {
          const lessons = await LessonModel.find();
          const lessonIds = lessons.map(lesson => lesson._id);
          const results = await ResultModel.find({ 
            accountID: userId, 
            lessonID: { $in: lessonIds }, 
            createAt: { $gte: startDate, $lt: endDate } 
          });
          const totalDuration = results.reduce((acc, result) => {
              const [hours, minutes, seconds] = result.time.split(':').map(Number);
              const timeInSeconds = (hours * 3600) + (minutes * 60) + seconds;
              return acc + timeInSeconds;
          }, 0);
  
          const averageDuration = totalDuration / results.length;
  
          const hours = Math.floor(averageDuration / 3600);
          if (isNaN(hours)) {
            return 0;
          }
          const minutes = Math.floor((averageDuration % 3600) / 60);
          if (isNaN(minutes)) {
            return 0;
          }
          const seconds = Math.round(averageDuration % 60);
          if (isNaN(seconds)) {
            return 0;
          }
  
          const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
          return formattedTime;
        }
        const lessons = await LessonModel.find({ type: type });
        const lessonIds = lessons.map(lesson => lesson._id);
        const results = await ResultModel.find({ 
          accountID: userId, 
          lessonID: { $in: lessonIds }, 
          createAt: { $gte: startDate, $lt: endDate } 
        });
        const totalDuration = results.reduce((acc, result) => {
            const [hours, minutes, seconds] = result.time.split(':').map(Number);
            const timeInSeconds = (hours * 3600) + (minutes * 60) + seconds;
            return acc + timeInSeconds;
        }, 0);

        const averageDuration = totalDuration / results.length;

        const hours = Math.floor(averageDuration / 3600);
        if (isNaN(hours)) {
          return 0;
        }
        const minutes = Math.floor((averageDuration % 3600) / 60);
        if (isNaN(minutes)) {
          return 0;
        }
        const seconds = Math.round(averageDuration % 60);
        if (isNaN(seconds)) {
          return 0;
        }

        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        return formattedTime;
    } catch (err) {
        console.error('Error calculating average lesson time:', err);
        return null;
    }
}

async function calculateAverageScore(userId, type, { startDate, endDate }) {
  try {
    if (type === 'all') {
      const lessons = await LessonModel.find();
      const lessonIds = lessons.map(lesson => lesson._id);
      const results = await ResultModel.find({ 
        accountID: userId, 
        lessonID: { $in: lessonIds }, 
        createAt: { $gte: startDate, $lt: endDate } 
      });
  const totalScore = results.reduce((acc, result) => {
    return acc + result.score;
  }, 0);

  const averageScore = Math.round(totalScore / results.length);
  if (isNaN(averageScore)) {
    return 0;
  }
  return averageScore;
    }
    const lessons = await LessonModel.find({ type: type });
        const lessonIds = lessons.map(lesson => lesson._id);
        const results = await ResultModel.find({ 
          accountID: userId, 
          lessonID: { $in: lessonIds }, 
          createAt: { $gte: startDate, $lt: endDate } 
        });
    const totalScore = results.reduce((acc, result) => {
      return acc + result.score;
    }, 0);

    const averageScore = Math.round(totalScore / results.length);
    if (isNaN(averageScore)) {
      return 0;
    }
    return averageScore;
  } catch (error) {
    console.error('Error calculating average score:', error);
    return null;
  }
}

async function calculateHighestScore(userId, type, { startDate, endDate }) {
  try {
    if (type === 'all') {
      const lessons = await LessonModel.find();
      const lessonIds = lessons.map(lesson => lesson._id);
      const results = await ResultModel.find({ 
        accountID: userId, 
        lessonID: { $in: lessonIds }, 
        createAt: { $gte: startDate, $lt: endDate } 
      });
      const highestScore = results.reduce((maxScore, result) => {
        return Math.max(maxScore, result.score);
      }, 0);
      return highestScore;
    }
    const lessons = await LessonModel.find({ type: type });
    const lessonIds = lessons.map(lesson => lesson._id);
    const results = await ResultModel.find({ 
      accountID: userId, 
      lessonID: { $in: lessonIds }, 
      createAt: { $gte: startDate, $lt: endDate } 
    });
    const highestScore = results.reduce((maxScore, result) => {
      return Math.max(maxScore, result.score);
    }, 0);
    return highestScore;
  } catch (error) {
    console.error('Error calculating highest score:', error);
    return null;
  }
}



module.exports = {
  calculateTotalDuration,
  totalCorrect,
  getTotalLessonsByType,
  calculateAccuracy,
  calculateAverageLessonTime,
  calculateAverageScore,
  calculateHighestScore,
};