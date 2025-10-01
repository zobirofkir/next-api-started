import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    firebaseUid: { type: String, unique: true, sparse: true },
    photoURL: { type: String },
    provider: { type: String, enum: ['email', 'google', 'firebase'], default: 'email' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);