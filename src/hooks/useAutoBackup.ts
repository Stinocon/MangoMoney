import { useEffect, useCallback, useRef } from 'react';

// Types for the backup system
interface BackupMetadata {
  exportDate: string;
  version: string;
  appName: string;
  autoBackup: boolean;
  [key: string]: any;
}

interface BackupData {
  assets: any;
  settings: any;
  metadata: BackupMetadata;
}

interface BackupEntry {
  timestamp: string;
  data: BackupData;
  checksum: string;
  size: number;
  version: string;
}

interface AutoBackupOptions {
  intervalMs?: number;
  maxBackups?: number;
  sizeThreshold?: number; // Backup solo se i dati sono cambiati di almeno X bytes
  compressionLevel?: 'none' | 'basic';
}

export const useAutoBackup = (
  assets: any,
  settings: any,
  metadata: any,
  options: AutoBackupOptions = {}
) => {
  const {
    intervalMs = 5 * 60 * 1000, // 5 minuti default
    maxBackups = 10,
    sizeThreshold = 1024, // 1KB
    compressionLevel = 'basic'
  } = options;

  const lastBackupRef = useRef<BackupEntry | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Genera checksum
  const generateChecksum = useCallback((data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }, []);

  // Comprimi dati (basic compression)
  const compressData = useCallback((data: string): string => {
    if (compressionLevel === 'none') return data;
    
    // Basic compression: remove whitespace from JSON
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed);
    } catch {
      return data;
    }
  }, [compressionLevel]);

  // Crea backup entry
  const createBackupEntry = useCallback((): BackupEntry => {
    const exportData = {
      assets,
      settings,
      metadata: {
        ...metadata,
        exportDate: new Date().toISOString(),
        version: '3.0',
        appName: 'MangoMoney',
        autoBackup: true
      }
    };

    const dataString = JSON.stringify(exportData, null, 2);
    const compressedData = compressData(dataString);
    const checksum = generateChecksum(compressedData);

    return {
      timestamp: new Date().toISOString(),
      data: exportData,
      checksum,
      size: compressedData.length,
      version: '3.0'
    };
  }, [assets, settings, metadata, compressData, generateChecksum]);

  // Salva backup in localStorage con retry logic
  const saveBackup = useCallback((backupEntry: BackupEntry) => {
    const maxRetries = 3;
    let attempts = 0;
    
    const attemptSave = () => {
      try {
        // Recupera backup esistenti
        const existingBackupsStr = localStorage.getItem('mangomoney-auto-backups');
        const existingBackups: BackupEntry[] = existingBackupsStr 
          ? JSON.parse(existingBackupsStr) 
          : [];

        // Aggiungi nuovo backup
        const updatedBackups = [backupEntry, ...existingBackups];

        // Mantieni solo i backup più recenti
        const trimmedBackups = updatedBackups.slice(0, maxBackups);

        // Salva
        localStorage.setItem('mangomoney-auto-backups', JSON.stringify(trimmedBackups));
        
        // Aggiorna timestamp ultimo backup
        localStorage.setItem('mangomoney-last-backup-time', new Date().toISOString());
        
        // Aggiorna riferimento
        lastBackupRef.current = backupEntry;
      } catch (error) {
        console.error(`Errore nel salvataggio auto-backup (tentativo ${attempts + 1}):`, error);
        
        if (++attempts < maxRetries) {
          // Exponential backoff: wait 1s, 2s, 4s
          setTimeout(attemptSave, 1000 * Math.pow(2, attempts - 1));
        } else {
          console.error('Auto-backup fallito dopo tutti i tentativi');
          // Could trigger user notification here
        }
      }
    };
    
    attemptSave();
  }, [maxBackups]);

  // Determina se fare backup
  const shouldBackup = useCallback((newBackup: BackupEntry): boolean => {
    const lastBackup = lastBackupRef.current;
    
    if (!lastBackup) return true; // Primo backup
    
    // Controlla se i dati sono cambiati abbastanza
    if (Math.abs(newBackup.size - lastBackup.size) < sizeThreshold) {
      return false;
    }
    
    // Controlla checksum
    if (newBackup.checksum === lastBackup.checksum) {
      return false;
    }
    
    return true;
  }, [sizeThreshold]);

  // Esegui backup
  const performBackup = useCallback(() => {
    try {
      const newBackup = createBackupEntry();
      
      if (shouldBackup(newBackup)) {
        saveBackup(newBackup);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Errore durante auto-backup:', error);
      return false;
    }
  }, [createBackupEntry, shouldBackup, saveBackup]);

  // Esegui backup manuale (forza sempre la creazione)
  const performManualBackup = useCallback(() => {
    try {
      const newBackup = createBackupEntry();
      saveBackup(newBackup);
      return true;
    } catch (error) {
      console.error('Errore durante backup manuale:', error);
      return false;
    }
  }, [createBackupEntry, saveBackup]);

  // Recupera backup esistenti
  const getBackups = useCallback((): BackupEntry[] => {
    try {
      const backupsStr = localStorage.getItem('mangomoney-auto-backups');
      return backupsStr ? JSON.parse(backupsStr) : [];
    } catch {
      return [];
    }
  }, []);

  // Ripristina da backup
  const restoreFromBackup = useCallback((timestamp: string): any | null => {
    const backups = getBackups();
    const backup = backups.find(b => b.timestamp === timestamp);
    return backup ? backup.data : null;
  }, [getBackups]);

  // Elimina backup
  const deleteBackup = useCallback((timestamp: string) => {
    const backups = getBackups();
    const filteredBackups = backups.filter(b => b.timestamp !== timestamp);
    localStorage.setItem('mangomoney-auto-backups', JSON.stringify(filteredBackups));
  }, [getBackups]);

  // Pulisci backup vecchi
  const cleanOldBackups = useCallback(() => {
    const backups = getBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Mantieni solo backup degli ultimi 30 giorni
    
    const recentBackups = backups.filter(backup => 
      new Date(backup.timestamp) > cutoffDate
    );
    
    localStorage.setItem('mangomoney-auto-backups', JSON.stringify(recentBackups));
  }, [getBackups]);

  // Effect per auto-backup
  useEffect(() => {
    if (intervalMs > 0) {
      // Inizializza con backup esistenti
      const backups = getBackups();
      if (backups.length > 0) {
        lastBackupRef.current = backups[0];
      }

      // Imposta intervallo
      intervalRef.current = setInterval(() => {
        performBackup();
        cleanOldBackups();
      }, intervalMs);

      return () => {
        // ✅ Cleanup completo
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = undefined;
        }
      };
    }

    return () => {
      // ✅ Cleanup anche quando intervalMs = 0
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [intervalMs, performBackup, cleanOldBackups, getBackups]);

  // Backup manuale
  const manualBackup = useCallback(() => {
    return performManualBackup();
  }, [performManualBackup]);

  // Ottieni info sui backup
  const getBackupInfo = useCallback(() => {
    const backups = getBackups();
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
    
    return {
      count: backups.length,
      totalSize,
      lastBackup: backups[0]?.timestamp || null,
      oldestBackup: backups[backups.length - 1]?.timestamp || null
    };
  }, [getBackups]);

  return {
    performBackup: manualBackup,
    getBackups,
    restoreFromBackup,
    deleteBackup,
    cleanOldBackups,
    getBackupInfo,
    isEnabled: intervalMs > 0
  };
};
