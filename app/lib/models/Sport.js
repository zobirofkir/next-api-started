import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
    site: { type: String },
    building: { type: String },
    court: { type: String },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number }
    }
}, { _id: false });

const ScheduleSchema = new mongoose.Schema({
    startDate: { type: Date },
    endDate: { type: Date },
    daysOfWeek: [{ type: String }],
    startTime: { type: String },
    endTime: { type: String }
}, { _id: false });

const SportSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['team', 'individual', 'duo', 'other'], default: 'team' },
    description: { type: String },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    isIndoor: { type: Boolean, default: false },
    minPlayers: { type: Number, default: 1 },
    maxPlayers: { type: Number },
    capacity: { type: Number },
    pricePerParticipant: { type: Number, default: 0 },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    location: LocationSchema,
    schedule: ScheduleSchema,
    equipment: [{ type: String }],
    tags: [{ type: String }],
    isCancelled: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Sport || mongoose.model('Sport', SportSchema);