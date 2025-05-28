
import { useCallback } from 'react';
import type { EncryptedData } from './types';

export function useEncryption() {
  // Generate secure encryption key
  const generateEncryptionKey = useCallback(async (
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> => {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }, []);

  // Encrypt sensitive data
  const encryptData = useCallback(async (
    data: any,
    password: string
  ): Promise<EncryptedData> => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await generateEncryptionKey(password, salt);
    
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    return {
      data: Array.from(new Uint8Array(encryptedBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      iv: Array.from(iv)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      salt: Array.from(salt)
        .map(b => b.toString(16).padStart(2, '0'))
        .join(''),
      algorithm: 'AES-GCM',
      keyDerivation: 'PBKDF2'
    };
  }, [generateEncryptionKey]);

  // Decrypt sensitive data
  const decryptData = useCallback(async (
    encryptedData: EncryptedData,
    password: string
  ): Promise<any> => {
    const salt = new Uint8Array(
      encryptedData.salt.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );
    const iv = new Uint8Array(
      encryptedData.iv.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );
    const data = new Uint8Array(
      encryptedData.data.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    );

    const key = await generateEncryptionKey(password, salt);
    
    try {
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      const decryptedText = new TextDecoder().decode(decryptedBuffer);
      return JSON.parse(decryptedText);
    } catch (error) {
      throw new Error('Failed to decrypt data: Invalid password or corrupted data');
    }
  }, [generateEncryptionKey]);

  return {
    encryptData,
    decryptData
  };
}
