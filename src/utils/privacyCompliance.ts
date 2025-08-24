/**
 * GDPR Compliance & Privacy Utilities for MangoMoney
 * 
 * @description
 * Privacy-first utilities for GDPR compliance including data portability,
 * right to erasure, data minimization, and consent management.
 * 
 * @version 3.2.0
 * @compliance GDPR Art. 7, 17, 20, 25 (Privacy by Design)
 */

import { secureLocalStorage, secureBackup } from './secureStorage';
import { auditTrail, sanitizeForLogging } from './advancedSecurity';

// ✅ GDPR Data Categories
export type GDPRDataCategory = 
  | 'financial_portfolio'
  | 'user_settings'
  | 'application_usage'
  | 'error_logs'
  | 'security_audit';

// ✅ Export Data Structure for GDPR Art. 20 (Data Portability)
export interface GDPRExportData {
  exportInfo: {
    requestDate: string;
    version: string;
    dataProtectionNotice: string;
    legalBasis: string;
    retentionInfo: string;
    processingPurpose: string;
    dataController: string;
  };
  userData: {
    assets?: any;
    settings?: any;
    metadata?: {
      created: string;
      lastModified: string;
      totalSessions: number;
    };
  };
  technicalData: {
    storageStats: any;
    securityEvents: any[];
  };
}

// ✅ GDPR Compliance Utilities
export const privacyCompliance = {
  /**
   * GDPR Art. 20 - Data Portability
   * Export all user data in structured format
   */
  exportAllUserData: (): GDPRExportData => {
    try {
      auditTrail.logSecurityEvent('gdpr_data_export_requested', {}, 'medium');
      
      const assets = secureLocalStorage.getItem('mangomoney-assets', {});
      const settings = secureLocalStorage.getItem('mangomoney-settings', {});
      const securityEvents = JSON.parse(localStorage.getItem('security-audit') || '[]');
      const storageStats = secureLocalStorage.getStats();
      
      // Sanitize security events for export
      const sanitizedEvents = securityEvents.map((event: any) => ({
        ...event,
        details: sanitizeForLogging(event.details)
      }));
      
      const exportData: GDPRExportData = {
        exportInfo: {
          requestDate: new Date().toISOString(),
          version: '3.2.0',
          dataProtectionNotice: 'This export contains all your personal data processed by MangoMoney in accordance with GDPR Article 20',
          legalBasis: 'Consent (Art. 6.1.a) - Personal financial portfolio management',
          retentionInfo: 'Data is stored locally on your device only. No data is transmitted to external servers.',
          processingPurpose: 'Personal financial portfolio management and analysis',
          dataController: 'Self-controlled (local storage only, no external data controller)'
        },
        userData: {
          assets: assets,
          settings: settings,
          metadata: {
            created: (settings as any).firstLaunch || new Date().toISOString(),
            lastModified: new Date().toISOString(),
            totalSessions: (settings as any).totalSessions || 1
          }
        },
        technicalData: {
          storageStats,
          securityEvents: sanitizedEvents.slice(-50) // Last 50 events only
        }
      };
      
      auditTrail.logSecurityEvent('gdpr_data_export_completed', {
        dataSize: JSON.stringify(exportData).length,
        includesAssets: !!assets,
        includesSettings: !!settings
      }, 'medium');
      
      return exportData;
      
    } catch (error) {
      auditTrail.logSecurityEvent('gdpr_data_export_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'high');
      throw new Error('Failed to export user data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  /**
   * GDPR Art. 17 - Right to Erasure ("Right to be Forgotten")
   * Delete all user data permanently
   */
  deleteAllUserData: (reason: 'user_request' | 'consent_withdrawn' | 'data_retention_expired' = 'user_request'): void => {
    try {
      auditTrail.logSecurityEvent('gdpr_data_deletion_requested', { reason }, 'high');
      
      // List all MangoMoney data keys
      const keysToDelete = [
        'mangomoney-assets',
        'mangomoney-settings',
        'mangomoney-auto-backups',
        'mangomoney-error-log',
        'mangomoney-secure-initialized',
        'security-audit'
      ];
      
      let deletedCount = 0;
      let errors: string[] = [];
      
      // Delete encrypted data using secure storage
      keysToDelete.forEach(key => {
        try {
          if (key === 'security-audit') {
            // Regular localStorage for audit trail
            localStorage.removeItem(key);
          } else {
            // Encrypted storage
            secureLocalStorage.removeItem(key);
          }
          deletedCount++;
        } catch (error) {
          errors.push(`Failed to delete ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
      
      // Clear session storage
      sessionStorage.clear();
      
      // Clear any remaining rate limiting data
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('rateLimit_')) {
          sessionStorage.removeItem(key);
        }
      }
      
      // Final audit entry before deletion
      auditTrail.logSecurityEvent('gdpr_data_deletion_completed', {
        reason,
        deletedKeys: deletedCount,
        errors: errors.length > 0 ? errors : undefined
      }, 'high');
      
      // Clear audit trail last
      localStorage.removeItem('security-audit');
      
      console.log(`✅ GDPR Data Deletion Complete: ${deletedCount} keys deleted`);
      
      if (errors.length > 0) {
        console.warn('Some deletion errors occurred:', errors);
        throw new Error(`Data deletion partially failed: ${errors.join(', ')}`);
      }
      
    } catch (error) {
      console.error('GDPR data deletion failed:', error);
      throw new Error('Failed to delete user data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  /**
   * GDPR Art. 25 - Data Minimization Audit
   * Check for unnecessary personal data collection
   */
  auditDataMinimization: (): { compliant: boolean; issues: string[]; recommendations: string[] } => {
    try {
      const issues: string[] = [];
      const recommendations: string[] = [];
      
      const assets = secureLocalStorage.getItem('mangomoney-assets', {});
      const settings = secureLocalStorage.getItem('mangomoney-settings', {});
      const storageStats = secureLocalStorage.getStats();
      
      // Check asset data for excessive personal information
      Object.values(assets).forEach((section: any, sectionIndex) => {
        if (Array.isArray(section)) {
          section.forEach((item: any, itemIndex) => {
            // Check for overly detailed personal notes
            if (item.notes && item.notes.length > 500) {
              issues.push(`Item ${itemIndex} in section ${sectionIndex} has very long notes (${item.notes.length} chars)`);
              recommendations.push('Consider shortening personal notes to essential information only');
            }
            
            // Check for potentially identifying information
            if (item.description && (
              item.description.toLowerCase().includes('ssn') ||
              item.description.toLowerCase().includes('tax id') ||
              item.description.toLowerCase().includes('social security')
            )) {
              issues.push(`Item ${itemIndex} may contain sensitive identifying information`);
              recommendations.push('Avoid storing SSN, tax IDs, or other sensitive identifiers');
            }
            
            // Check for excessive metadata
            if (item.metadata && Object.keys(item.metadata).length > 10) {
              issues.push(`Item ${itemIndex} has excessive metadata (${Object.keys(item.metadata).length} fields)`);
              recommendations.push('Store only necessary metadata for portfolio management');
            }
          });
        }
      });
      
      // Check settings for unnecessary data collection
      if ((settings as any).analyticsData && Object.keys((settings as any).analyticsData).length > 0) {
        issues.push('Analytics data is being collected');
        recommendations.push('Disable analytics data collection to improve privacy');
      }
      
      // Check storage size
      if (storageStats.totalSize > 5000000) { // 5MB
        issues.push(`Large storage usage (${Math.round(storageStats.totalSize / 1024 / 1024 * 100) / 100}MB)`);
        recommendations.push('Review stored data and remove unnecessary information');
      }
      
      // Security audit log size check
      const securityEvents = JSON.parse(localStorage.getItem('security-audit') || '[]');
      if (securityEvents.length > 100) {
        recommendations.push('Security audit log is large - automatic cleanup recommended');
      }
      
      auditTrail.logSecurityEvent('gdpr_data_minimization_audit', {
        issuesFound: issues.length,
        recommendationsGenerated: recommendations.length
      }, 'low');
      
      return {
        compliant: issues.length === 0,
        issues,
        recommendations
      };
      
    } catch (error) {
      auditTrail.logSecurityEvent('gdpr_data_minimization_audit_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium');
      
      return {
        compliant: false,
        issues: ['Audit failed due to error'],
        recommendations: ['Manual review recommended']
      };
    }
  },

  /**
   * Generate Privacy Report for User
   */
  generatePrivacyReport: (): {
    dataCollected: string[];
    legalBasis: string;
    retentionPeriod: string;
    userRights: string[];
    contact: string;
  } => {
    const storageStats = secureLocalStorage.getStats();
    
    return {
      dataCollected: [
        'Financial portfolio data (assets, amounts, descriptions)',
        'Application settings and preferences',
        'Security and error logs (no personal data)',
        'Usage statistics (local only)'
      ],
      legalBasis: 'Consent (GDPR Art. 6.1.a) - Provided by using the application for personal portfolio management',
      retentionPeriod: 'Data is retained locally on your device until you delete it. No automatic deletion.',
      userRights: [
        'Right to access your data (full export available)',
        'Right to rectification (edit functionality)',
        'Right to erasure (delete all data)',
        'Right to data portability (export in JSON format)',
        'Right to object (stop using the application)',
        'Right to withdraw consent (delete all data)'
      ],
      contact: 'This is a client-side application. No external data controller. All data is stored locally on your device.'
    };
  },

  /**
   * Check for data retention compliance
   */
  checkDataRetention: (): { 
    needsReview: boolean; 
    oldDataCount: number; 
    recommendations: string[] 
  } => {
    try {
      const settings = secureLocalStorage.getItem('mangomoney-settings', {});
      const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
      
      const firstLaunch = (settings as any).firstLaunch ? new Date((settings as any).firstLaunch).getTime() : Date.now();
      const needsReview = firstLaunch < oneYearAgo;
      
      const recommendations: string[] = [];
      
      if (needsReview) {
        recommendations.push('Consider reviewing stored data - app has been used for over a year');
        recommendations.push('Delete old transactions or assets that are no longer relevant');
        recommendations.push('Review and update privacy settings');
      }
      
      // Check security audit log age
      const securityEvents = JSON.parse(localStorage.getItem('security-audit') || '[]');
      const oldEvents = securityEvents.filter((event: any) => {
        const eventTime = new Date(event.timestamp).getTime();
        return eventTime < oneYearAgo;
      });
      
      if (oldEvents.length > 0) {
        recommendations.push(`Consider clearing old security logs (${oldEvents.length} events older than 1 year)`);
      }
      
      return {
        needsReview,
        oldDataCount: oldEvents.length,
        recommendations
      };
      
    } catch (error) {
      return {
        needsReview: false,
        oldDataCount: 0,
        recommendations: ['Error checking data retention - manual review recommended']
      };
    }
  }
};

// ✅ Consent Management (for future use if needed)
export const consentManager = {
  /**
   * Record user consent for data processing
   */
  recordConsent: (purpose: string, granted: boolean): void => {
    try {
      const consent = secureLocalStorage.getItem('mangomoney-consent', {}) as any;
      consent[purpose] = {
        granted,
        timestamp: new Date().toISOString(),
        version: '3.2.0'
      };
      
      secureLocalStorage.setItem('mangomoney-consent', consent);
      
      auditTrail.logSecurityEvent('consent_recorded', {
        purpose,
        granted
      }, 'low');
      
    } catch (error) {
      auditTrail.logSecurityEvent('consent_recording_error', {
        purpose,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium');
    }
  },

  /**
   * Check if consent is granted for specific purpose
   */
  checkConsent: (purpose: string): boolean => {
    try {
      const consent = secureLocalStorage.getItem('mangomoney-consent', {}) as any;
      return consent[purpose]?.granted === true;
    } catch (error) {
      return false; // Default to no consent on error
    }
  },

  /**
   * Withdraw consent for specific purpose
   */
  withdrawConsent: (purpose: string): void => {
    try {
      const consent = secureLocalStorage.getItem('mangomoney-consent', {}) as any;
      if (consent[purpose]) {
        consent[purpose].granted = false;
        consent[purpose].withdrawnAt = new Date().toISOString();
      }
      
      secureLocalStorage.setItem('mangomoney-consent', consent);
      
      auditTrail.logSecurityEvent('consent_withdrawn', { purpose }, 'medium');
      
    } catch (error) {
      auditTrail.logSecurityEvent('consent_withdrawal_error', {
        purpose,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium');
    }
  }
};
