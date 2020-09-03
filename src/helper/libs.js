import crypto from 'crypto-js';
import aes from 'crypto-js/aes';

import { KMS } from 'aws-sdk';

export const generateEncryptionKey = () => {
    return crypto.lib.WordArray.random(32).toString(crypto.enc.Hex);
}

export const encrypt = (secretKey, encryptKey) => {
    return aes.encrypt(secretKey, encryptKey).toString()
}

export const decrypt = (secretKey, encryptKey) => {
    return aes.decrypt(secretKey, encryptKey).toString(crypto.enc.Utf8)
}


export const awsEncrypt = async (...arg) => {
  const {keyId, region, accessKeyId, secretAccessKey, sessionToken, algorithm, plainText} = arg[0];
    const kms = new KMS({
      region,
      accessKeyId,
      secretAccessKey,
      sessionToken
    });
    const encrypted = await kms.encrypt({
        KeyId: keyId,
        Plaintext: plainText,
        EncryptionAlgorithm: algorithm
    }).promise();
    return encrypted.CiphertextBlob.toString('base64');
}

export const awsDecrypt = async (...arg) => {
    const {keyId, region, accessKeyId, secretAccessKey, sessionToken, encryptionKey, algorithm} = arg[0];
    const kms = new KMS({
        region,
        accessKeyId,
        secretAccessKey,
        sessionToken
    });
    const decrypted = await kms.decrypt({
        KeyId: keyId, // your key alias or full ARN key
        CiphertextBlob: Buffer.from(encryptionKey, 'base64'),
        EncryptionAlgorithm: algorithm
    }).promise();
    return decrypted.Plaintext.toString('ascii');
}
