const crypto = require('crypto');
const algorithm = 'aes-256-gcm';
const ivLength = 16;

// Ensure the encryption key is exactly 32 bytes (256 bits) for aes-256-gcm
const getSecretKey = () => {
    const envKey = process.env.ENCRYPTION_KEY;
    if (!envKey) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }
    // If key is already 32 bytes, use it directly; otherwise hash it to 32 bytes
    const keyBuffer = Buffer.from(envKey, 'utf8');
    if (keyBuffer.length === 32) {
        return keyBuffer;
    }
    // Hash the key to ensure it's exactly 32 bytes
    return crypto.createHash('sha256').update(envKey).digest();
};

exports.encrypt = (text) => {
    if (!text) {
        throw new Error('Text to encrypt cannot be empty');
    }
    const secretKey = getSecretKey();
    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

exports.decrypt = (hash) => {
    if (!hash) {
        throw new Error('Hash to decrypt cannot be empty');
    }
    const secretKey = getSecretKey();
    const parts = hash.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
    }
    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};