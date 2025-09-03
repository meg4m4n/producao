import React, { useState, useEffect } from 'react';
import { X, Save, MessageSquare, Upload, FileText, Plus, Trash2, Eye, Edit } from 'lucide-react';
import { Producao, BOMFile } from '../types';

interface Comment {
  id: string;
  text: string;
  files: BOMFile[];
  createdAt: string;
  updatedAt: string;
}

interface ComponenteCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comments: string, files?: File[]) => void;
  producao: Producao | null;
}

const ComponenteCommentsModal: React.FC<ComponenteCommentsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  producao 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [previewFile, setPreviewFile] = useState<File | BOMFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize comments from producao data
  useEffect(() => {
    if (isOpen && producao) {
      // Parse existing comments or create empty array
      const existingComments = producao.comments ? [
        {
          id: '1',
          text: producao.comments,
          files: producao.bomFiles || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ] : [];
      setComments(existingComments);
      setNewComment('');
      setSelectedFiles([]);
      setEditingComment(null);
      setPreviewFile(null);
    }
  }, [isOpen, producao]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => 
      file.type === 'application/pdf' || 
      file.name.toLowerCase().endsWith('.pdf') ||
      file.type.startsWith('image/') ||
      file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)
    );
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addComment = () => {
    if (!newComment.trim() && selectedFiles.length === 0) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      files: selectedFiles.map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: `https://storage.example.com/comments/${file.name}`,
        uploadDate: new Date().toISOString()
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    setSelectedFiles([]);
  };

  const updateComment = (id: string) => {
    if (!editText.trim()) return;

    setComments(prev => prev.map(comment => 
      comment.id === id 
        ? { ...comment, text: editText.trim(), updatedAt: new Date().toISOString() }
        : comment
    ));
    setEditingComment(null);
    setEditText('');
  };

  const deleteComment = (id: string) => {
    if (confirm('Tem certeza que deseja remover este comentário?')) {
      setComments(prev => prev.filter(comment => comment.id !== id));
    }
  };

  const deleteFileFromComment = (commentId: string, fileId: string) => {
    if (confirm('Tem certeza que deseja remover este ficheiro?')) {
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, files: comment.files.filter(file => file.id !== fileId) }
          : comment
      ));
    }
  };

  const handleSave = () => {
    // Combine all comments into a single string for the producao
    const allCommentsText = comments.map(comment => 
      `[${new Date(comment.createdAt).toLocaleString('pt-PT')}] ${comment.text}`
    ).join('\n\n');
    
    // Get all files from all comments
    const allFiles = comments.flatMap(comment => comment.files);
    
    onSave(allCommentsText);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !producao) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Gestão de Comentários</h2>
              <p className="text-sm text-gray-600">{producao.referenciaInterna} - {producao.marca}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(90vh-120px)]">
          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    {editingComment === comment.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateComment(comment.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditText('');
                            }}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-900 whitespace-pre-wrap">{comment.text}</p>
                    )}
                  </div>
                  
                  {editingComment !== comment.id && (
                    <div className="flex space-x-1 ml-4">
                      <button
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditText(comment.text);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar comentário"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remover comentário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Files attached to comment */}
                {comment.files.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ficheiros Anexos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {comment.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-sm text-gray-900 truncate">{file.name}</span>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => setPreviewFile(file)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Pré-visualizar"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteFileFromComment(comment.id, file.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Remover ficheiro"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  Criado: {formatDate(comment.createdAt)}
                  {comment.updatedAt !== comment.createdAt && (
                    <span> • Editado: {formatDate(comment.updatedAt)}</span>
                  )}
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum comentário</h3>
                <p className="text-gray-500">Adicione o primeiro comentário sobre os componentes</p>
              </div>
            )}
          </div>

          {/* Add New Comment */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Adicionar Novo Comentário</h3>
            
            {/* Comment Text */}
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Adicione comentários sobre componentes, fornecedores, prazos..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* File Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-lg p-4 text-center transition-colors mb-4
                ${isDragging 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">Arraste ficheiros aqui ou</p>
              <label className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm">
                <Plus className="w-4 h-4" />
                <span>Selecionar Ficheiros</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,application/pdf,image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, GIF</p>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Ficheiros Selecionados ({selectedFiles.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Pré-visualizar"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Comment Button */}
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {newComment.length} caracteres
              </div>
              <button
                onClick={addComment}
                disabled={!newComment.trim() && selectedFiles.length === 0}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Comentário</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Todos os Comentários</span>
            </button>
          </div>
        </div>

        {/* File Preview Modal */}
        {previewFile && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pré-visualização: {previewFile.name}
                </h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 h-96 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Pré-visualização de ficheiro</p>
                  <p className="text-sm text-gray-500">
                    {previewFile.name}
                    {'size' in previewFile && ` (${formatFileSize(previewFile.size)})`}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    A pré-visualização completa estará disponível após o upload
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default ComponenteCommentsModal;