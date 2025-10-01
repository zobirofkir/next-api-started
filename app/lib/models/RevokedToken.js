import mongoose from 'mongoose';

const RevokedTokenSchema = new mongoose.Schema({
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
});

export default mongoose.models.RevokedToken || mongoose.model('RevokedToken', RevokedTokenSchema);


