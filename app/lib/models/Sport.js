import mongoose from 'mongoose';

const SportSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    sheep: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.models.Sport || mongoose.model('Sport', SportSchema);