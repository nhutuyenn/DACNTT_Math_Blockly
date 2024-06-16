const Results = require('./models/result');

module.exports.calculateTotalDuration = async (req, res) => {
    try {
        const results = await Results.find();
        const totalDuration = results.reduce((acc, result) => {
          const [hours, minutes, seconds] = result.time.split(':').map(Number);
          const timeInSeconds = (hours * 3600) + (minutes * 60) + seconds;
          return acc + timeInSeconds;
        }, 0);
    
        // Convert total duration back to HH:MM:SS format
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