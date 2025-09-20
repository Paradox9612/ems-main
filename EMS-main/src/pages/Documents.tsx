import React, { useEffect, useState } from 'react';
import { FileText, Upload, Download, Trash2, Search, Eye, File, FolderOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface Document {
  id: string;
  userId: string;
  employeeName: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  category: 'contract' | 'certificate' | 'report' | 'other';
}

export const Documents: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load documents from localStorage (simulate DB)
  useEffect(() => {
    const storedDocs = localStorage.getItem('documents');
    if (storedDocs) {
      setDocuments(JSON.parse(storedDocs));
    }
  }, []);

  // Save documents to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(documents));
  }, [documents]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    setTimeout(() => {
      const newDocument: Document = {
        id: Date.now().toString(),
        userId: user.id,
        employeeName: `${user.firstName} ${user.lastName}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString().split('T')[0],
        category: 'other',
      };

      setDocuments((prev) => [newDocument, ...prev]);
      setUploading(false);
      event.target.value = '';
    }, 2000);
  };

  const handleDownload = (doc: Document) => {
    alert(`Downloading ${doc.name}... (demo only)`);
  };

  const handlePreview = (doc: Document) => {
    alert(`Previewing ${doc.name}... (demo only)`);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'contract': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'certificate': return 'bg-green-100 text-green-800 border-green-200';
      case 'report': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter docs: employees only see their own, admin sees all
  const visibleDocuments = isAdmin
    ? documents
    : documents.filter((doc) => doc.userId === user?.id);

  const filteredDocuments = visibleDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'contract', label: 'Contracts' },
    { value: 'certificate', label: 'Certificates' },
    { value: 'report', label: 'Reports' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Management</h1>
        <p className="text-gray-600">
          {isAdmin ? 'Manage all employees documents' : 'Upload and manage your documents'}
        </p>
      </div>

      {/* Upload Section - Only Employees */}
      {!isAdmin && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Document</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="relative cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Upload className="h-4 w-4" />
                <span>{uploading ? 'Uploading...' : 'Choose PDF File'}</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {uploading && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-600">Processing...</span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600">
              <p>• PDF files only</p>
              <p>• Maximum size: 10MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {isAdmin ? 'All Documents' : 'Your Documents'}
          </h2>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== 'all'
                  ? 'No documents match your search criteria.'
                  : isAdmin
                  ? 'No employee has uploaded documents yet.'
                  : 'Upload your first document to get started.'}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                  {isAdmin && (
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Upload Date</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-500">PDF Document</div>
                        </div>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-white">
                              {doc.employeeName.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">{doc.employeeName}</div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(
                          doc.category
                        )}`}
                      >
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.uploadDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handlePreview(doc)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {(isAdmin || doc.userId === user?.id) && (
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
