const mongoose = require('mongoose');

const sportEventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Must provide a sport event name'],
    maxlength: [80, 'Sport event name cannot exceed 80 characters'],
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required:[true, 'Must provide event reference id for the sportevent']
  },
  venue: {
    type: String,
    required: [true, 'Must provide a venue for sport event']
  },
  startDate: {
    type: Date,
    required: [true, 'must provide a start date for the event'],
  },
  endDate: {
      type: Date,
      required: [true, 'must provide a end date for the event'],
  },
  medalCount: {
    type: Number,
    required: [true, 'must provide a medal count for the event'],
  }
});


const SportEvent = mongoose.model('SportEvent', sportEventSchema);

module.exports = SportEvent;
