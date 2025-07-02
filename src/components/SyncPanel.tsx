import React, { useState, useEffect } from 'react';
import { syncService } from '../services/syncService.ts';
import { RefreshCw, Cloud, HardDrive, AlertCircle, CheckCircle, Download, Upload } from 'lucide-react';

interface SyncPanelProps {
  isDarkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  showNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

const SyncPanel: React.FC<SyncPanelProps> = ({ isDarkMode, isOpen, onClose, showNotification }) => {
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadSyncStatus();
    }
  }, [isOpen]);

  const loadSyncStatus = async () => {
    setIsLoading(true);
    try {
      const status = await syncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Erreur chargement statut:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPreview = async () => {
    setIsLoading(true);
    try {
      const previewData = await syncService.getSyncPreview();
      setPreview(previewData);
      setShowPreview(true);
    } catch (error) {
      showNotification('Erreur lors de l\'aperçu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncService.performSync();
      if (result.success) {
        showNotification(result.message, 'success');
        loadSyncStatus(); // Recharger le statut
        setShowPreview(false);
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Erreur de synchronisation', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceDownload = async () => {
    if (!window.confirm('⚠️ Attention ! Cela va remplacer vos données locales par celles du cloud. Continuer ?')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await syncService.forceDownload();
      if (result.success) {
        showNotification(result.message, 'success');
        loadSyncStatus();
        setShowPreview(false);
        // Recharger la page pour afficher les nouvelles données
        window.location.reload();
      } else {
        showNotification(result.message, 'error');
      }
    } catch (error) {
      showNotification('Erreur de téléchargement', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay animate-fadeInUp">
      <div className={`relative w-full mx-4 max-w-2xl ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } rounded-xl shadow-2xl border transition-all-300`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <Cloud className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h3 className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Synchronisation Cloud
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors hover:${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <RefreshCw className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className={`h-8 w-8 mx-auto mb-4 animate-spin ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Chargement...
              </p>
            </div>
          ) : !showPreview ? (
            // Vue principale
            <div className="space-y-6">
              {/* Statut */}
              {syncStatus && (
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <HardDrive className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Local
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {syncStatus.localReservations} réservations
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {syncStatus.localVehicles} véhicules
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Cloud className={`h-5 w-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Cloud
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {syncStatus.remoteReservations} réservations
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {syncStatus.remoteVehicles} véhicules
                    </p>
                  </div>
                </div>
              )}

              {/* Indicateur de synchronisation */}
              {syncStatus && (
                <div className={`p-4 rounded-lg flex items-center space-x-3 ${
                  syncStatus.needsSync 
                    ? isDarkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
                    : isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
                }`}>
                  {syncStatus.needsSync ? (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      syncStatus.needsSync 
                        ? 'text-yellow-800' 
                        : isDarkMode ? 'text-green-400' : 'text-green-800'
                    }`}>
                      {syncStatus.needsSync ? 'Synchronisation nécessaire' : 'Données synchronisées'}
                    </p>
                    {syncStatus.lastSync && (
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Dernière sync: {new Date(syncStatus.lastSync).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleShowPreview}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4" />
                  <span>Envoyer au Cloud</span>
                </button>

                <button
                  onClick={handleForceDownload}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4" />
                  <span>Télécharger du Cloud</span>
                </button>
              </div>
            </div>
          ) : (
            // Vue aperçu
            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Aperçu de la synchronisation
                </h4>
                
                {preview && (
                  <div className="space-y-2">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      📤 À envoyer: {preview.toUpload.reservations.length} réservations, {preview.toUpload.vehicles.length} véhicules
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      📥 À recevoir: {preview.toDownload.reservations.length} réservations, {preview.toDownload.vehicles.length} véhicules
                    </p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Retour
                </button>

                <button
                  onClick={handleSync}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  disabled={isLoading}
                >
                  Confirmer la Synchronisation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncPanel; 