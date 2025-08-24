/**
 * Secure localStorage with AES encryption
 * 
 * @description
 * Provides encrypted storage for sensitive financial data
 * using AES encryption with device-specific keys.
 * 
 * @version 3.2.0
 * @security CRITICAL - Protects financial data in localStorage
 */

import CryptoJS from 'crypto-js';
import { auditTrail } from './advancedSecurity';

// ✅ CRITICAL: Generate device-specific encryption key
const generateEncryptionKey = (): string => {
  // Create device-specific key from browser fingerprint
  const deviceFingerprint = [
    navigator.userAgent,
    navigator.language,
    window.screen.width + 'x' + window.screen.height,
    new Date().getTimezoneOffset(),
    navigator.cookieEnabled ? '1' : '0'
  ].join('|');
  
  // Hash the fingerprint to create consistent key
  const baseKey = CryptoJS.SHA256(deviceFingerprint).toString();
  
  // Add application-specific salt
  const appSalt = 'mango-money-secure-v3.2.0';
  return CryptoJS.SHA256(baseKey + appSalt).toString().substring(0, 32);
};

const ENCRYPTION_KEY = generateEncryptionKey();

// ✅ Secure localStorage interface
export const secureLocalStorage = {
  /**
   * Encrypt and store data in localStorage
   */
  setItem: (key: string, data: any): void => {
    try {
      // Rate limiting for storage operations
      if (!rateLimitCheck('storage_write', 100, 60000)) { // 100 writes per minute
        throw new Error('Storage rate limit exceeded');
      }
      
      const jsonData = JSON.stringify(data);
      
      // Add integrity check
      const integrity = CryptoJS.SHA256(jsonData).toString();
      const dataWithIntegrity = {
        data: jsonData,
        integrity,
        timestamp: Date.now(),
        version: '3.2.0'
      };
      
      // Encrypt the entire package
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(dataWithIntegrity), 
        ENCRYPTION_KEY
      ).toString();
      
      localStorage.setItem(key, encrypted);
      
      auditTrail.logSecurityEvent('secure_storage_write', {
        key: key.replace(/mangomoney-/, ''), // Remove prefix for privacy
        dataSize: jsonData.length
      }, 'low');
      
    } catch (error) {
      auditTrail.logSecurityEvent('secure_storage_error', {
        action: 'write',
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
      throw new Error('Failed to encrypt and store data');
    }
  },

  /**
   * Decrypt and retrieve data from localStorage
   */
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return defaultValue;
      
      // Decrypt the data
      const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) {
        auditTrail.logSecurityEvent('secure_storage_decryption_failed', { key }, 'high');
        throw new Error('Decryption failed - corrupted data or wrong key');
      }
      
      const dataWithIntegrity = JSON.parse(decryptedText);
      
      // Verify integrity
      const currentIntegrity = CryptoJS.SHA256(dataWithIntegrity.data).toString();
      if (dataWithIntegrity.integrity !== currentIntegrity) {
        auditTrail.logSecurityEvent('secure_storage_integrity_failed', { key }, 'high');
        throw new Error('Data integrity check failed - data may be corrupted');
      }
      
      // Check version compatibility
      if (dataWithIntegrity.version && dataWithIntegrity.version !== '3.2.0') {
        auditTrail.logSecurityEvent('secure_storage_version_mismatch', {
          key,
          storedVersion: dataWithIntegrity.version,
          currentVersion: '3.2.0'
        }, 'medium');
      }
      
      const result = JSON.parse(dataWithIntegrity.data) as T;
      
      auditTrail.logSecurityEvent('secure_storage_read', {
        key: key.replace(/mangomoney-/, ''),
        dataAge: Date.now() - (dataWithIntegrity.timestamp || 0)
      }, 'low');
      
      return result;
      
    } catch (error) {
      auditTrail.logSecurityEvent('secure_storage_error', {
        action: 'read',
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium');
      
      console.warn(`Failed to decrypt data for key ${key}, returning default value`);
      return defaultValue;
    }
  },

  /**
   * Remove encrypted item from localStorage
   */
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
      auditTrail.logSecurityEvent('secure_storage_delete', { key }, 'medium');
    } catch (error) {
      auditTrail.logSecurityEvent('secure_storage_error', {
        action: 'delete',
        key,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium');
    }
  },

  /**
   * Clear all encrypted data
   */
  clear: (): void => {
    try {
      // Only clear MangoMoney keys to avoid affecting other apps
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mangomoney-')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      auditTrail.logSecurityEvent('secure_storage_clear_all', {
        keysRemoved: keysToRemove.length
      }, 'medium');
      
    } catch (error) {
      auditTrail.logSecurityEvent('secure_storage_error', {
        action: 'clear',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
    }
  },

  /**
   * Verify data integrity without decrypting
   */
  verifyIntegrity: (key: string): boolean => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return false;
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedText) return false;
      
      const dataWithIntegrity = JSON.parse(decryptedText);
      const currentIntegrity = CryptoJS.SHA256(dataWithIntegrity.data).toString();
      
      return dataWithIntegrity.integrity === currentIntegrity;
      
    } catch (error) {
      return false;
    }
  },

  /**
   * Get storage statistics
   */
  getStats: (): { totalKeys: number; encryptedKeys: number; totalSize: number } => {
    let totalKeys = 0;
    let encryptedKeys = 0;
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalKeys++;
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
          if (key.startsWith('mangomoney-')) {
            encryptedKeys++;
          }
        }
      }
    }
    
    return { totalKeys, encryptedKeys, totalSize };
  }
};

// ✅ Rate limiting helper
const rateLimitCheck = (action: string, maxRequests: number, windowMs: number): boolean => {
  const key = `rateLimit_${action}`;
  const now = Date.now();
  const stored = sessionStorage.getItem(key);
  
  if (!stored) {
    sessionStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
    return true;
  }
  
  const { count, resetTime } = JSON.parse(stored);
  
  if (now > resetTime) {
    sessionStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
    return true;
  }
  
  if (count >= maxRequests) {
    return false;
  }
  
  sessionStorage.setItem(key, JSON.stringify({ count: count + 1, resetTime }));
  return true;
};

// ✅ Secure backup system
export const secureBackup = {
  /**
   * Create encrypted backup with password protection
   */
  create: (data: any, password?: string): string => {
    try {
      if (!rateLimitCheck('backup_create', 5, 300000)) { // 5 backups per 5 minutes
        throw new Error('Backup creation rate limit exceeded');
      }
      
      // Add metadata and integrity
      const backupData = {
        data,
        metadata: {
          version: '3.2.0',
          created: new Date().toISOString(),
          dataProtectionNotice: 'This backup contains encrypted personal financial data',
          app: 'MangoMoney'
        },
        integrity: CryptoJS.SHA256(JSON.stringify(data)).toString()
      };
      
      let encrypted: string;
      
      if (password) {
        // User-provided password encryption
        encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(backupData),
          password
        ).toString();
      } else {
        // Device-specific encryption
        encrypted = CryptoJS.AES.encrypt(
          JSON.stringify(backupData),
          ENCRYPTION_KEY
        ).toString();
      }
      
      auditTrail.logSecurityEvent('secure_backup_created', {
        hasPassword: !!password,
        dataSize: JSON.stringify(data).length
      }, 'medium');
      
      return btoa(encrypted); // Base64 encode for safe transport
      
    } catch (error) {
      auditTrail.logSecurityEvent('secure_backup_error', {
        action: 'create',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
      throw new Error('Failed to create secure backup');
    }
  },

  /**
   * Restore encrypted backup
   */
  restore: (backupData: string, password?: string): any => {
    try {
      if (!rateLimitCheck('backup_restore', 10, 300000)) { // 10 restores per 5 minutes
        throw new Error('Backup restore rate limit exceeded');
      }
      
      const encrypted = atob(backupData);
      
      let decrypted: string;
      if (password) {
        decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
      } else {
        decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
      }
      
      if (!decrypted) {
        throw new Error('Decryption failed - wrong password or corrupted backup');
      }
      
      const backupObj = JSON.parse(decrypted);
      
      // Verify integrity
      const currentIntegrity = CryptoJS.SHA256(JSON.stringify(backupObj.data)).toString();
      if (backupObj.integrity !== currentIntegrity) {
        throw new Error('Backup integrity check failed - data may be corrupted');
      }
      
      auditTrail.logSecurityEvent('secure_backup_restored', {
        hasPassword: !!password,
        backupDate: backupObj.metadata?.created
      }, 'medium');
      
      return backupObj.data;
      
    } catch (error) {
      auditTrail.logSecurityEvent('secure_backup_error', {
        action: 'restore',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
      throw new Error('Failed to restore backup: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
};

// ✅ Migration utility for existing unencrypted data
export const migrateToSecureStorage = (): void => {
  try {
    const keysToMigrate = ['mangomoney-assets', 'mangomoney-settings', 'mangomoney-auto-backups'];
    let migratedCount = 0;
    
    keysToMigrate.forEach(key => {
      const existingData = localStorage.getItem(key);
      if (existingData && !existingData.startsWith('U2FsdGVkX1')) { // Not already encrypted
        try {
          const parsed = JSON.parse(existingData);
          secureLocalStorage.setItem(key, parsed);
          migratedCount++;
        } catch (error) {
          console.warn(`Failed to migrate ${key}:`, error);
        }
      }
    });
    
    if (migratedCount > 0) {
      auditTrail.logSecurityEvent('storage_migration_completed', {
        migratedKeys: migratedCount
      }, 'medium');
      console.log(`✅ Migrated ${migratedCount} storage keys to encrypted format`);
    }
    
  } catch (error) {
    auditTrail.logSecurityEvent('storage_migration_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'high');
    console.error('Storage migration failed:', error);
  }
};

// ✅ Initialize secure storage (run on app start)
export const initializeSecureStorage = (): void => {
  try {
    // Check if this is the first run with secure storage
    const isFirstRun = !localStorage.getItem('mangomoney-secure-initialized');
    
    if (isFirstRun) {
      // Migrate existing data if any
      migrateToSecureStorage();
      
      // Mark as initialized
      localStorage.setItem('mangomoney-secure-initialized', 'true');
      
      auditTrail.logSecurityEvent('secure_storage_initialized', {
        firstRun: true
      }, 'low');
    }
    
    // Verify encryption key works
    const testKey = 'mangomoney-test';
    const testData = { test: 'encryption_test', timestamp: Date.now() };
    
    secureLocalStorage.setItem(testKey, testData);
    const retrieved = secureLocalStorage.getItem(testKey, null) as any;
    
    if (!retrieved || retrieved.test !== 'encryption_test') {
      throw new Error('Encryption verification failed');
    }
    
    secureLocalStorage.removeItem(testKey);
    
    console.log('✅ Secure storage initialized successfully');
    
  } catch (error) {
    auditTrail.logSecurityEvent('secure_storage_init_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'high');
    console.error('Failed to initialize secure storage:', error);
    throw error;
  }
};
