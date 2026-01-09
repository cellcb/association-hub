import { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Globe,
  Layout,
  BarChart3,
  Grid3X3,
  Building2,
  Users,
  MessageSquare,
  Star,
  Calendar,
  Smartphone,
  Target,
  Zap,
  Info,
} from 'lucide-react';
import { getConfigs, updateConfig } from '@/lib/api';
import type { ConfigResponse, ConfigUpdateRequest } from '@/types/config';
import { configCategoryLabels } from '@/types/config';

type CategoryKey = keyof typeof configCategoryLabels;

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  header: Globe,
  hero: Layout,
  carousel: ImageIcon,
  stats: BarChart3,
  features: Grid3X3,
  about: Building2,
  members: Users,
  testimonials: MessageSquare,
  highlights: Star,
  exhibition: Calendar,
  digital: Smartphone,
  value: Target,
  cta: Zap,
  footer: Info,
};

export function ConfigManagement() {
  const [configs, setConfigs] = useState<ConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('header');
  const [editedValues, setEditedValues] = useState<Record<number, string>>({});
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const loadConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getConfigs({ size: 100 });
      if (result.success && result.data) {
        setConfigs(result.data.content);
      } else {
        setError(result.message || '加载配置失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const handleSave = async (config: ConfigResponse) => {
    const newValue = editedValues[config.id];
    if (newValue === undefined || newValue === config.configValue) return;

    setSaving(config.id);
    try {
      const request: ConfigUpdateRequest = { configValue: newValue };
      const result = await updateConfig(config.id, request);
      if (result.success) {
        setConfigs((prev) =>
          prev.map((c) => (c.id === config.id ? { ...c, configValue: newValue } : c))
        );
        setEditedValues((prev) => {
          const updated = { ...prev };
          delete updated[config.id];
          return updated;
        });
      } else {
        setError(result.message || '保存失败');
      }
    } catch {
      setError('保存失败，请重试');
    } finally {
      setSaving(null);
    }
  };

  const handleValueChange = (configId: number, value: string) => {
    setEditedValues((prev) => ({ ...prev, [configId]: value }));
  };

  const toggleExpand = (configId: number) => {
    setExpandedItems((prev) => {
      const updated = new Set(prev);
      if (updated.has(configId)) {
        updated.delete(configId);
      } else {
        updated.add(configId);
      }
      return updated;
    });
  };

  const filteredConfigs = configs.filter((c) => c.category === activeCategory);
  const categories = [...new Set(configs.map((c) => c.category))].sort();

  const isModified = (configId: number) => {
    const config = configs.find((c) => c.id === configId);
    return (
      editedValues[configId] !== undefined && editedValues[configId] !== config?.configValue
    );
  };

  const parseJsonValue = (value: string): unknown => {
    try {
      let parsed = JSON.parse(value);
      // Handle double-encoded JSON strings
      if (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          // Not double-encoded, keep the string
        }
      }
      return parsed;
    } catch {
      return value;
    }
  };

  // Format JSON string for display in textarea
  const formatJsonString = (value: string): string => {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  };

  const renderJsonEditor = (config: ConfigResponse) => {
    const currentValue = editedValues[config.id] ?? config.configValue;
    const parsed = parseJsonValue(currentValue);
    const isArray = Array.isArray(parsed);
    const isObject = typeof parsed === 'object' && parsed !== null && !isArray;
    const isExpanded = expandedItems.has(config.id);

    if (isArray) {
      return (
        <ArrayEditor
          value={parsed as unknown[]}
          onChange={(newValue) => handleValueChange(config.id, JSON.stringify(newValue, null, 2))}
          configKey={config.configKey}
        />
      );
    }

    if (isObject) {
      return (
        <div className="space-y-4">
          <ObjectEditor
            value={parsed as Record<string, unknown>}
            onChange={(newValue) => handleValueChange(config.id, JSON.stringify(newValue, null, 2))}
          />
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => toggleExpand(config.id)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {isExpanded ? '收起' : '展开'} JSON 编辑器
            </button>
            {isExpanded && (
              <textarea
                value={formatJsonString(currentValue)}
                onChange={(e) => handleValueChange(config.id, e.target.value)}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2 whitespace-pre"
              />
            )}
          </div>
        </div>
      );
    }

    // Simple string value - check if it looks like JSON (starts with { or [)
    const stringValue = typeof parsed === 'string' ? parsed.replace(/^"|"$/g, '') : String(parsed);
    const looksLikeJson = stringValue.trim().startsWith('{') || stringValue.trim().startsWith('[');

    if (looksLikeJson || stringValue.length > 100) {
      // Use textarea for JSON-like content or long strings
      return (
        <textarea
          value={formatJsonString(stringValue)}
          onChange={(e) => handleValueChange(config.id, e.target.value)}
          rows={Math.min(20, Math.max(6, stringValue.split('\n').length + 2))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-pre"
        />
      );
    }

    return (
      <input
        type="text"
        value={stringValue}
        onChange={(e) => handleValueChange(config.id, JSON.stringify(e.target.value))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">加载配置中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-gray-900 flex items-center gap-3">
            <Settings className="w-7 h-7 text-blue-600" />
            网站配置管理
          </h1>
          <p className="text-gray-600 mt-1">配置首页展示内容，修改后实时生效</p>
        </div>
        <button
          onClick={loadConfigs}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          刷新
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
      )}

      <div className="flex gap-6">
        {/* Category Sidebar */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-2 sticky top-6">
            <div className="text-xs text-gray-500 px-3 py-2 uppercase tracking-wider">
              配置分类
            </div>
            {categories.map((category) => {
              const Icon = categoryIcons[category] || Settings;
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category as CategoryKey)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">
                    {configCategoryLabels[category as CategoryKey] || category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Config Editor */}
        <div className="flex-1 space-y-4">
          {filteredConfigs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
              该分类下暂无配置项
            </div>
          ) : (
            filteredConfigs.map((config) => (
              <div
                key={config.id}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg text-gray-900">{config.description || config.configKey}</h3>
                    <p className="text-sm text-gray-500 font-mono">{config.configKey}</p>
                  </div>
                  <button
                    onClick={() => handleSave(config)}
                    disabled={!isModified(config.id) || saving === config.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isModified(config.id)
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {saving === config.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    保存
                  </button>
                </div>
                {renderJsonEditor(config)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Array Editor Component
interface ArrayEditorProps {
  value: unknown[];
  onChange: (value: unknown[]) => void;
  configKey: string;
}

function ArrayEditor({ value, onChange, configKey }: ArrayEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleItemChange = (index: number, newItem: unknown) => {
    const newValue = [...value];
    newValue[index] = newItem;
    onChange(newValue);
  };

  const handleAddItem = () => {
    if (value.length > 0 && typeof value[0] === 'object') {
      // Clone the first item structure with empty values
      const template = JSON.parse(JSON.stringify(value[0]));
      const emptyTemplate = clearObjectValues(template);
      onChange([...value, emptyTemplate]);
    } else {
      onChange([...value, '']);
    }
  };

  const handleRemoveItem = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const clearObjectValues = (obj: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (Array.isArray(obj[key])) {
          result[key] = [];
        } else {
          result[key] = clearObjectValues(obj[key] as Record<string, unknown>);
        }
      } else if (typeof obj[key] === 'string') {
        result[key] = '';
      } else if (typeof obj[key] === 'number') {
        result[key] = 0;
      } else if (typeof obj[key] === 'boolean') {
        result[key] = false;
      } else {
        result[key] = null;
      }
    }
    return result;
  };

  const getItemTitle = (item: unknown, index: number): string => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>;
      return (obj.title as string) || (obj.name as string) || (obj.label as string) || `项目 ${index + 1}`;
    }
    return `项目 ${index + 1}`;
  };

  return (
    <div className="space-y-3">
      {value.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <div
            className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <div className="flex items-center gap-3">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-900">{getItemTitle(item, index)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveItem(index);
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {expandedIndex === index ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>
          {expandedIndex === index && (
            <div className="p-4 border-t border-gray-200">
              {typeof item === 'object' && item !== null ? (
                <ObjectEditor
                  value={item as Record<string, unknown>}
                  onChange={(newItem) => handleItemChange(index, newItem)}
                />
              ) : (
                <input
                  type="text"
                  value={String(item)}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          )}
        </div>
      ))}
      <button
        onClick={handleAddItem}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        <Plus className="w-4 h-4" />
        添加项目
      </button>
    </div>
  );
}

// Object Editor Component
interface ObjectEditorProps {
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
}

function ObjectEditor({ value, onChange }: ObjectEditorProps) {
  const handleFieldChange = (key: string, newValue: unknown) => {
    onChange({ ...value, [key]: newValue });
  };

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      title: '标题',
      subtitle: '副标题',
      description: '描述',
      content: '内容',
      image: '图片URL',
      avatar: '头像URL',
      icon: '图标',
      color: '颜色',
      bgClass: '背景类',
      buttonText: '按钮文字',
      buttonLink: '按钮链接',
      link: '链接',
      name: '名称',
      label: '标签',
      value: '值',
      count: '数量',
      organization: '组织',
      phone: '电话',
      email: '邮箱',
      address: '地址',
      copyright: '版权信息',
      features: '特性列表',
      borderColor: '边框颜色',
      iconColor: '图标颜色',
      highlighted: '高亮显示',
      text: '文字',
      activityId: '关联活动ID',
    };
    return labels[key] || key;
  };

  const isImageField = (key: string): boolean => {
    return ['image', 'avatar', 'logo', 'cover'].some((k) => key.toLowerCase().includes(k));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(value).map(([key, val]) => {
        // Handle nested objects recursively
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          return (
            <div key={key} className="col-span-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-3">{getFieldLabel(key)}</label>
              <ObjectEditor
                value={val as Record<string, unknown>}
                onChange={(newVal) => handleFieldChange(key, newVal)}
              />
            </div>
          );
        }

        // Handle arrays
        if (Array.isArray(val)) {
          // Check if array contains objects
          const hasObjects = val.length > 0 && typeof val[0] === 'object' && val[0] !== null;
          if (hasObjects) {
            // Use ArrayEditor for object arrays
            return (
              <div key={key} className="col-span-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-3">{getFieldLabel(key)}</label>
                <ArrayEditor
                  value={val}
                  onChange={(newVal) => handleFieldChange(key, newVal)}
                  configKey={key}
                />
              </div>
            );
          }
          // Simple string array - use textarea
          return (
            <div key={key} className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">{getFieldLabel(key)}</label>
              <textarea
                value={val.join('\n')}
                onChange={(e) => handleFieldChange(key, e.target.value.split('\n').filter(Boolean))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="每行一项"
              />
            </div>
          );
        }

        // Handle boolean
        if (typeof val === 'boolean') {
          return (
            <div key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={val}
                onChange={(e) => handleFieldChange(key, e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label className="text-sm text-gray-600">{getFieldLabel(key)}</label>
            </div>
          );
        }

        // Handle image fields
        if (isImageField(key)) {
          return (
            <div key={key} className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">{getFieldLabel(key)}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={String(val || '')}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="输入图片 URL"
                />
                {val && (
                  <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden flex-shrink-0">
                    <img src={String(val)} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          );
        }

        // Handle long text
        if (typeof val === 'string' && val.length > 100) {
          return (
            <div key={key} className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">{getFieldLabel(key)}</label>
              <textarea
                value={val}
                onChange={(e) => handleFieldChange(key, e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          );
        }

        // Handle regular strings and numbers
        return (
          <div key={key}>
            <label className="block text-sm text-gray-600 mb-1">{getFieldLabel(key)}</label>
            <input
              type={typeof val === 'number' ? 'number' : 'text'}
              value={String(val || '')}
              onChange={(e) =>
                handleFieldChange(
                  key,
                  typeof val === 'number' ? Number(e.target.value) : e.target.value
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        );
      })}
    </div>
  );
}
