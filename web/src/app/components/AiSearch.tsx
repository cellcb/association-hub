import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Loader2,
  RefreshCw,
  Calendar,
  FileText,
  FolderOpen,
  Users,
  Package,
  ArrowRight,
  MessageSquare,
  User,
  Bot,
  Send,
  ChevronUp,
} from 'lucide-react';
import ReactMarkdown, { Components } from 'react-markdown';
import { publicRagChat, RagReference, getEntityTypeStyle } from '@/lib/rag';
import { PageType, NavigationParams } from '../App';

/**
 * Fix markdown formatting issues from LLM output.
 * LLMs often output markdown without proper newlines before headers and lists,
 * and sometimes omit the required space after # in headers.
 * This function adds necessary newlines and spaces to ensure proper rendering.
 */
function fixMarkdown(text: string): string {
  // Fix ### headers without space after (e.g., "###活动" -> "\n\n### 活动")
  // Match: any non-newline char + 1-6 # + non-space/non-# char
  text = text.replace(/([^\n])(#{1,6})([^\s#])/g, '$1\n\n$2 $3');

  // Fix ### headers with space after but no newline before
  text = text.replace(/([^\n])(#{1,6}\s)/g, '$1\n\n$2');

  // Fix ### at start that has no space after (e.g., "###活动" at line start)
  text = text.replace(/^(#{1,6})([^\s#])/gm, '$1 $2');

  // Add double newlines before - list items that are not at start of line
  text = text.replace(/([^\n\s])(\s*-\s+\S)/g, '$1\n\n$2');

  // Ensure numbered lists have newlines before them
  text = text.replace(/([^\n])(\d+\.\s+\S)/g, '$1\n\n$2');

  return text;
}

// Custom markdown components for better styling
const markdownComponents: Components = {
  // Styled paragraphs
  p: ({ children }) => (
    <p className="my-2 leading-relaxed">{children}</p>
  ),
  // Styled unordered lists
  ul: ({ children }) => (
    <ul className="my-2 ml-4 space-y-1">{children}</ul>
  ),
  // Styled ordered lists
  ol: ({ children }) => (
    <ol className="my-2 ml-4 space-y-1 list-decimal">{children}</ol>
  ),
  // Styled list items with custom bullet
  li: ({ children }) => (
    <li className="flex items-start gap-2">
      <span className="text-indigo-500 mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  // Styled bold text - black for better readability
  strong: ({ children }) => (
    <strong className="font-bold text-gray-900">{children}</strong>
  ),
  // Styled headings
  h1: ({ children }) => (
    <h1 className="text-lg font-bold text-gray-900 mt-3 mb-2">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-gray-900 mt-3 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-gray-900 mt-2 mb-1">{children}</h3>
  ),
  // Styled code blocks
  code: ({ children, className }) => {
    const isInline = !className;
    return isInline ? (
      <code className="px-1.5 py-0.5 bg-gray-100 text-indigo-600 rounded text-sm font-mono">
        {children}
      </code>
    ) : (
      <code className="block p-3 bg-gray-50 rounded-lg text-sm font-mono overflow-x-auto my-2">
        {children}
      </code>
    );
  },
  // Styled blockquotes
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-indigo-300 pl-4 my-2 text-gray-600 italic">
      {children}
    </blockquote>
  ),
  // Styled links
  a: ({ href, children }) => (
    <a href={href} className="text-indigo-600 hover:text-indigo-800 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

interface AiSearchProps {
  onNavigate: (page: PageType, params?: NavigationParams) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  references?: RagReference[];
}

type SearchStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

const SUGGESTED_QUESTIONS = [
  '最近有什么活动',
  '找建筑给排水产品',
  '找供水领域的专家',
];

const FOLLOW_UP_SUGGESTIONS = [
  '详细介绍一下',
  '有联系方式吗',
  '还有类似的吗',
];

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Calendar,
  FileText,
  FolderOpen,
  Users,
  Package,
};

export function AiSearch({ onNavigate }: AiSearchProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentReferences, setCurrentReferences] = useState<RagReference[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Use refs to track latest values for closures
  const currentAnswerRef = useRef('');
  const currentReferencesRef = useRef<RagReference[]>([]);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentAnswer, messages]);

  const handleSearch = () => {
    doSearch(query);
  };

  const handleNewConversation = () => {
    setConversationId(null);
    setMessages([]);
    setCurrentAnswer('');
    setCurrentReferences([]);
    setQuery('');
    setStatus('idle');
    setError(null);
  };

  const doSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setStatus('loading');
    setError(null);
    setCurrentAnswer('');
    setCurrentReferences([]);
    currentAnswerRef.current = '';
    currentReferencesRef.current = [];

    // Add user message to history
    const userMessage: ChatMessage = { role: 'user', content: searchQuery.trim() };
    setMessages(prev => [...prev, userMessage]);

    abortControllerRef.current = publicRagChat(
      {
        query: searchQuery.trim(),
        conversationId: conversationId || undefined,
      },
      {
        onMeta: (meta) => {
          setConversationId(meta.conversationId);
          setStatus('streaming');
        },
        onReferences: (refs) => {
          setCurrentReferences(refs);
          currentReferencesRef.current = refs;
        },
        onContent: (content) => {
          setCurrentAnswer(prev => {
            const newAnswer = prev + content;
            currentAnswerRef.current = newAnswer;
            return newAnswer;
          });
        },
        onDone: () => {
          // Use refs to get latest values
          const finalAnswer = currentAnswerRef.current;
          const finalRefs = currentReferencesRef.current;

          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: finalAnswer,
              references: finalRefs,
            },
          ]);
          setStatus('done');
          setQuery('');
        },
        onError: (err) => {
          setStatus('error');
          setError(err.message);
        },
      }
    );
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setIsExpanded(true);
    // Use setTimeout to ensure query state is set before search
    setTimeout(() => doSearch(suggestion), 0);
  };

  const handleReferenceClick = (ref: RagReference) => {
    // Build URL path based on entity type
    const pathMap: Record<string, string> = {
      activity: 'activities',
      news: 'news',
      project: 'projects',
      expert: 'experts',
      product: 'products',
    };
    // Parameter name matches the entity type
    const paramMap: Record<string, string> = {
      activity: 'activityId',
      news: 'newsId',
      project: 'projectId',
      expert: 'expertId',
      product: 'productId',
    };
    const basePath = pathMap[ref.entityType];
    const paramName = paramMap[ref.entityType];
    if (basePath && paramName) {
      // Open in new tab to preserve current conversation
      const url = `/${basePath}?${paramName}=${ref.entityId}`;
      window.open(url, '_blank');
    }
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || FileText;
  };

  const hasConversation = messages.length > 0 || status !== 'idle';

  return (
    <section className={`${
      isExpanded
        ? 'fixed inset-0 top-16 z-40 bg-gradient-to-br from-indigo-50 via-white to-blue-50'
        : 'py-12 bg-gradient-to-br from-indigo-50 via-white to-blue-50'
    }`}>
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${
        isExpanded ? 'h-full flex flex-col py-4' : ''
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between ${
          isExpanded ? 'flex-shrink-0 mb-4' : 'mb-6'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">智能助手</h2>
              <p className="text-sm text-gray-500">有什么可以帮您？</p>
            </div>
          </div>
          {hasConversation && (
            <div className="flex items-center gap-2">
              {isExpanded && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <ChevronUp className="w-4 h-4" />
                  收起
                </button>
              )}
              <button
                onClick={handleNewConversation}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                新对话
              </button>
            </div>
          )}
        </div>

        {/* Chat Container */}
        {hasConversation && (
          <div
            ref={chatContainerRef}
            className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-y-auto transition-all duration-300 ease-in-out relative ${
              isExpanded ? 'flex-1 min-h-0' : 'max-h-96 mb-4'
            }`}
          >
            <div className="p-6 space-y-6">
              {/* Message History */}
              {messages.map((msg, index) => (
                <div key={index} className="space-y-3">
                  {/* User Message */}
                  {msg.role === 'user' && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">您</p>
                        <p className="text-gray-900">{msg.content}</p>
                      </div>
                    </div>
                  )}

                  {/* Assistant Message */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">智能助手</p>
                        <div className="text-gray-900 text-sm">
                          <ReactMarkdown components={markdownComponents}>{fixMarkdown(msg.content)}</ReactMarkdown>
                        </div>

                        {/* References for this message */}
                        {msg.references && msg.references.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.references.slice(0, 4).map((ref, refIndex) => {
                              const style = getEntityTypeStyle(ref.entityType);
                              return (
                                <button
                                  key={refIndex}
                                  onClick={() => handleReferenceClick(ref)}
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${style.bg} ${style.text} hover:opacity-80 transition-opacity`}
                                >
                                  [{ref.typeName}] {ref.title}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {index < messages.length - 1 && (
                    <div className="border-b border-gray-100" />
                  )}
                </div>
              ))}

              {/* Current streaming answer */}
              {(status === 'streaming' || status === 'loading') && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">智能助手</p>
                    {status === 'loading' ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>正在搜索相关内容...</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-gray-900 text-sm">
                          <ReactMarkdown components={markdownComponents}>{fixMarkdown(currentAnswer)}</ReactMarkdown>
                          <span className="inline-block w-2 h-5 bg-indigo-500 animate-pulse ml-0.5" />
                        </div>

                        {/* Current references */}
                        {currentReferences.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {currentReferences.slice(0, 4).map((ref, refIndex) => {
                              const style = getEntityTypeStyle(ref.entityType);
                              return (
                                <button
                                  key={refIndex}
                                  onClick={() => handleReferenceClick(ref)}
                                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${style.bg} ${style.text} hover:opacity-80 transition-opacity`}
                                >
                                  [{ref.typeName}] {ref.title}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Error state */}
              {status === 'error' && error && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-500 mb-1">出错了</p>
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Search Input */}
        <div className={`bg-white rounded-2xl shadow-lg border-2 border-gray-200 focus-within:border-indigo-400 transition-colors ${
          isExpanded ? 'flex-shrink-0 mt-4' : ''
        }`}>
          <div className="flex items-center p-2">
            <div className="flex-shrink-0 pl-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => hasConversation && setIsExpanded(true)}
              placeholder={hasConversation ? '继续提问...' : '输入您的问题，如"最近有什么活动？"'}
              className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              disabled={status === 'loading' || status === 'streaming'}
            />
            <button
              onClick={handleSearch}
              disabled={!query.trim() || status === 'loading' || status === 'streaming'}
              className="flex-shrink-0 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mr-1"
            >
              {status === 'loading' || status === 'streaming' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Suggestions */}
        <div className={`mt-4 flex flex-wrap items-center gap-2 ${
          isExpanded ? 'flex-shrink-0' : ''
        }`}>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            {hasConversation ? '可以追问：' : '试试问：'}
          </span>
          {(hasConversation ? FOLLOW_UP_SUGGESTIONS : SUGGESTED_QUESTIONS).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700 hover:text-gray-900 transition-colors"
              disabled={status === 'loading' || status === 'streaming'}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
