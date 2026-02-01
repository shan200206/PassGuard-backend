const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    websiteName: { type: String, required: true },
    keyLabel: { type: String, required: true }, // username/email/phone
    passwordValue: { type: String, required: true }, // Encrypted
}, { timestamps: true });

module.exports = mongoose.model('Password', passwordSchema);