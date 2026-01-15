import { Plus, Edit, Trash2, X, Loader2, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import {
  getAdminExpertiseFields,
  createExpertiseField,
  updateExpertiseField,
  deleteExpertiseField,
} from '@/lib/api';
import type {
  ExpertiseFieldResponse,
  ExpertiseFieldRequest,
} from '@/types/expert';

interface FormData {
  name: string;
  code: string;
  sortOrder: number;
  status: number;
  description: string;
}

const emptyFormData: FormData = {
  name: '',
  code: '',
  sortOrder: 0,
  status: 1,
  description: '',
};

export function ExpertiseFieldManagement() {
  const [fields, setFields] = useState<ExpertiseFieldResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedField, setSelectedField] = useState<ExpertiseFieldResponse | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFields = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminExpertiseFields();
      if (result.success && result.data) {
        setFields(result.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  const handleAdd = () => {
    setFormData(emptyFormData);
    setError(null);
    setShowAddModal(true);
  };

  const handleEdit = (field: ExpertiseFieldResponse) => {
    setSelectedField(field);
    setFormData({
      name: field.name,
      code: field.code || '',
      sortOrder: field.sortOrder,
      status: field.status,
      description: field.description || '',
    });
    setError(null);
    setShowEditModal(true);
  };

  const handleDelete = (field: ExpertiseFieldResponse) => {
    setSelectedField(field);
    setError(null);
    setShowDeleteModal(true);
  };

  const handleSubmitAdd = async () => {
    if (!formData.name.trim()) {
      setError('领域名称不能为空');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const request: ExpertiseFieldRequest = {
        name: formData.name,
        code: formData.code || undefined,
        sortOrder: formData.sortOrder,
        status: formData.status,
        description: formData.description || undefined,
      };
      const result = await createExpertiseField(request);
      if (result.success) {
        setShowAddModal(false);
        loadFields();
      } else {
        setError(result.message || '创建失败');
      }
    } catch (e) {
      setError('创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedField) return;
    if (!formData.name.trim()) {
      setError('领域名称不能为空');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const request: ExpertiseFieldRequest = {
        name: formData.name,
        code: formData.code || undefined,
        sortOrder: formData.sortOrder,
        status: formData.status,
        description: formData.description || undefined,
      };
      const result = await updateExpertiseField(selectedField.id, request);
      if (result.success) {
        setShowEditModal(false);
        loadFields();
      } else {
        setError(result.message || '更新失败');
      }
    } catch (e) {
      setError('更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedField) return;

    setSubmitting(true);
    setError(null);
    try {
      const result = await deleteExpertiseField(selectedField.id);
      if (result.success) {
        setShowDeleteModal(false);
        loadFields();
      } else {
        setError(result.message || '删除失败');
      }
    } catch (e) {
      setError('删除失败');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
          <CheckCircle className="w-3 h-3" />
          启用
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
        <XCircle className="w-3 h-3" />
        禁用
      </span>
    );
  };

  const renderFormModal = (isEdit: boolean) => {
    const show = isEdit ? showEditModal : showAddModal;
    const onClose = () => isEdit ? setShowEditModal(false) : setShowAddModal(false);
    const onSubmit = isEdit ? handleSubmitEdit : handleSubmitAdd;
    const title = isEdit ? '编辑专业领域' : '新增专业领域';

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                领域名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入领域名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                领域代码
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="留空将自动生成"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  排序
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>启用</option>
                  <option value={0}>禁用</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="请输入领域描述"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              取消
            </button>
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? '保存' : '创建'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-2">专业领域</h2>
          <p className="text-gray-500">管理专家的专业领域分类</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增领域
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <BookOpen className="w-12 h-12 mb-4 text-gray-300" />
            <p>暂无专业领域数据</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">领域名称</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">代码</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">排序</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {fields.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-gray-900 font-medium">{field.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 font-mono text-sm">{field.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500">{field.sortOrder}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(field.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(field)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(field)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {renderFormModal(false)}
      {renderFormModal(true)}

      {showDeleteModal && selectedField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">确认删除</h3>
              <p className="text-gray-500">
                确定要删除专业领域「{selectedField.name}」吗？此操作无法撤销。
              </p>
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
