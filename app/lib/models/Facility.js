import mongoose from 'mongoose';

const FacilitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    sport: { 
        type: String, 
        required: true,
        enum: ['football', 'basketball', 'tennis', 'swimming', 'gym']
    },
    image: { type: String, required: true },
    capacity: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, min: 0, max: 5 },
    available: { type: Boolean, default: true },
    features: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.Facility || mongoose.model('Facility', FacilitySchema);
