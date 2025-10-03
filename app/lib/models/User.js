import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { 
        type: String, 
        required: function() { return this.provider === 'email'; } 
    },
    firebaseUid: { type: String, unique: true, sparse: true },
    photoURL: { type: String },
    provider: { 
        type: String, 
        enum: ['email', 'google', 'firebase'], 
        default: 'email' 
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { 
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.resetPasswordToken;
            delete ret.resetPasswordExpires;
            return ret;
        }
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);