import { useState, useRef, useCallback } from 'react';
import './MediaUpload.css';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface MediaUploadProps {
  onFilesChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

function MediaUpload({ onFilesChange, maxFiles = 5, maxSizeMB = 10 }: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((newFiles: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(newFiles);
    
    // Vérifier le nombre de fichiers
    if (files.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }

    const validFiles: MediaFile[] = [];

    for (const file of fileArray) {
      // Vérifier le type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        setError(`${file.name}: Type non supporté. Images et vidéos uniquement.`);
        continue;
      }

      // Vérifier la taille
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        setError(`${file.name}: Fichier trop volumineux (max ${maxSizeMB}MB)`);
        continue;
      }

      // Créer l'aperçu
      const preview = URL.createObjectURL(file);
      
      validFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        type: isImage ? 'image' : 'video'
      });
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    }
  }, [files, maxFiles, maxSizeMB, onFilesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      processFiles(selectedFiles);
    }
    // Reset input pour permettre de sélectionner le même fichier
    e.target.value = '';
  }, [processFiles]);

  const handleRemoveFile = useCallback((id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    // Libérer l'URL de l'aperçu
    const removedFile = files.find(f => f.id === id);
    if (removedFile) {
      URL.revokeObjectURL(removedFile.preview);
    }
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="media-upload">
      {/* Zone de drop */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${files.length > 0 ? 'has-files' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="file-input"
        />
        
        <div className="drop-zone-content">
          <div className="drop-icon">
            {isDragging ? '📥' : '📷'}
          </div>
          <div className="drop-text">
            <span className="drop-main">
              {isDragging ? 'Déposez les fichiers ici' : 'Glissez vos photos/vidéos ici'}
            </span>
            <span className="drop-sub">
              ou <span className="browse-link">parcourir</span>
            </span>
          </div>
          <div className="drop-hint">
            Images et vidéos • Max {maxSizeMB}MB par fichier • {maxFiles} fichiers max
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="upload-error">
          <span className="error-icon">!</span>
          {error}
        </div>
      )}

      {/* Aperçu des fichiers */}
      {files.length > 0 && (
        <div className="files-preview">
          {files.map(mediaFile => (
            <div key={mediaFile.id} className="file-preview-item">
              {mediaFile.type === 'image' ? (
                <img src={mediaFile.preview} alt="Aperçu" className="preview-media" />
              ) : (
                <video src={mediaFile.preview} className="preview-media" />
              )}
              <div className="file-info">
                <span className="file-name">{mediaFile.file.name}</span>
                <span className="file-size">
                  {(mediaFile.file.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
              <button
                type="button"
                className="remove-file-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(mediaFile.id);
                }}
                title="Supprimer"
              >
                ✕
              </button>
              <div className="file-type-badge">
                {mediaFile.type === 'image' ? '🖼️' : '🎬'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaUpload;

