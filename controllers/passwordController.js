const Password = require('../models/Password');
const { encrypt, decrypt } = require('../utils/encryption');

exports.createPassword = async (req, res) => {
    try {
        const { websiteName, keyLabel, passwordValue } = req.body;
        
        // Validate required fields
        if (!websiteName || !keyLabel || !passwordValue) {
            return res.status(400).json({ message: 'All fields (websiteName, keyLabel, passwordValue) are required' });
        }
        
        const encryptedPass = encrypt(passwordValue);
        const newPassword = new Password({
            userId: req.userData.userId,
            websiteName,
            keyLabel,
            passwordValue: encryptedPass
        });
        await newPassword.save();
        
        // Return password with decrypted value for response
        const response = {
            _id: newPassword._id,
            userId: newPassword.userId,
            websiteName: newPassword.websiteName,
            keyLabel: newPassword.keyLabel,
            passwordValue: passwordValue, // Return decrypted value
            createdAt: newPassword.createdAt,
            updatedAt: newPassword.updatedAt
        };
        res.status(201).json(response);
    } catch (err) {
        res.status(500).json({ message: 'Error saving password', error: err.message });
    }
};

exports.getPasswords = async (req, res) => {
    try {
        const passwords = await Password.find({ userId: req.userData.userId }).sort({ createdAt: -1 });
        // Return passwords with decrypted values
        const decryptedPasswords = passwords.map(p => ({
            _id: p._id,
            userId: p.userId,
            websiteName: p.websiteName,
            keyLabel: p.keyLabel,
            passwordValue: decrypt(p.passwordValue),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
        }));
        res.status(200).json(decryptedPasswords);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching passwords', error: err.message });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { websiteName, keyLabel, passwordValue } = req.body;
        const { id } = req.params;
        
        // Validate required fields
        if (!websiteName || !keyLabel || !passwordValue) {
            return res.status(400).json({ message: 'All fields (websiteName, keyLabel, passwordValue) are required' });
        }
        
        const encryptedPass = encrypt(passwordValue);
        const updatedPassword = await Password.findOneAndUpdate(
            { _id: id, userId: req.userData.userId },
            { websiteName, keyLabel, passwordValue: encryptedPass },
            { new: true, runValidators: true }
        );
        
        if (!updatedPassword) {
            return res.status(404).json({ message: 'Password not found' });
        }
        
        // Return password with decrypted value
        const response = {
            _id: updatedPassword._id,
            userId: updatedPassword.userId,
            websiteName: updatedPassword.websiteName,
            keyLabel: updatedPassword.keyLabel,
            passwordValue: passwordValue, // Return decrypted value
            createdAt: updatedPassword.createdAt,
            updatedAt: updatedPassword.updatedAt
        };
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ message: 'Error updating password', error: err.message });
    }
};

exports.deletePassword = async (req, res) => {
    try {
        const deletedPassword = await Password.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.userData.userId 
        });
        
        if (!deletedPassword) {
            return res.status(404).json({ message: 'Password not found' });
        }
        
        res.status(200).json({ message: 'Password deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed', error: err.message });
    }
};