const API_BASE = '/api';

/**
 * Public RAG chat request
 */
export interface PublicRagChatRequest {
  query: string;
  types?: string[];
  conversationId?: string;
}

/**
 * RAG reference item
 */
export interface RagReference {
  entityType: string;
  entityId: number;
  title: string;
  typeName: string;
  score?: number;
}

/**
 * SSE event types
 */
export type RagSseEventType = 'meta' | 'references' | 'content' | 'done' | 'error';

/**
 * SSE event data
 */
export interface RagSseEvent {
  type: RagSseEventType;
  data: string;
}

/**
 * Meta event data
 */
export interface RagMetaData {
  conversationId: string;
}

/**
 * Parse SSE event from raw text
 */
function parseSseEvent(eventText: string): RagSseEvent | null {
  const lines = eventText.trim().split('\n');
  let eventType: RagSseEventType = 'content';
  let data = '';

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventType = line.slice(6).trim() as RagSseEventType;
    } else if (line.startsWith('data:')) {
      data = line.slice(5);
    }
  }

  if (!eventType && !data) return null;

  return { type: eventType, data };
}

/**
 * Callback handlers for SSE events
 */
export interface RagChatCallbacks {
  onMeta?: (data: RagMetaData) => void;
  onReferences?: (references: RagReference[]) => void;
  onContent?: (content: string) => void;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Public RAG chat with SSE streaming
 * @param request Chat request
 * @param callbacks Event callbacks
 * @returns AbortController for cancellation
 */
export function publicRagChat(
  request: PublicRagChatRequest,
  callbacks: RagChatCallbacks
): AbortController {
  const abortController = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE}/public/rag/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(request),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete events (separated by double newline)
        const events = buffer.split('\n\n');
        buffer = events.pop() || ''; // Keep incomplete event in buffer

        for (const eventText of events) {
          if (!eventText.trim()) continue;

          const event = parseSseEvent(eventText);
          if (!event) continue;

          switch (event.type) {
            case 'meta':
              if (callbacks.onMeta) {
                try {
                  const meta = JSON.parse(event.data) as RagMetaData;
                  callbacks.onMeta(meta);
                } catch {
                  console.error('Failed to parse meta event:', event.data);
                }
              }
              break;
            case 'references':
              if (callbacks.onReferences) {
                try {
                  const refs = JSON.parse(event.data) as RagReference[];
                  callbacks.onReferences(refs);
                } catch {
                  console.error('Failed to parse references event:', event.data);
                }
              }
              break;
            case 'content':
              if (callbacks.onContent) {
                callbacks.onContent(event.data);
              }
              break;
            case 'done':
              if (callbacks.onDone) {
                callbacks.onDone();
              }
              break;
            case 'error':
              if (callbacks.onError) {
                callbacks.onError(new Error(event.data));
              }
              break;
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      if (callbacks.onError) {
        callbacks.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  fetchData();

  return abortController;
}

/**
 * Get entity detail URL based on type
 */
export function getEntityUrl(entityType: string, entityId: number): string {
  switch (entityType) {
    case 'activity':
      return `/activities/${entityId}`;
    case 'news':
      return `/news/${entityId}`;
    case 'project':
      return `/projects/${entityId}`;
    case 'expert':
      return `/experts/${entityId}`;
    case 'product':
      return `/products/${entityId}`;
    default:
      return '#';
  }
}

/**
 * Get entity type icon class
 */
export function getEntityTypeStyle(entityType: string): { bg: string; text: string; icon: string } {
  switch (entityType) {
    case 'activity':
      return { bg: 'bg-purple-100', text: 'text-purple-600', icon: 'Calendar' };
    case 'news':
      return { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'FileText' };
    case 'project':
      return { bg: 'bg-teal-100', text: 'text-teal-600', icon: 'FolderOpen' };
    case 'expert':
      return { bg: 'bg-green-100', text: 'text-green-600', icon: 'Users' };
    case 'product':
      return { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'Package' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-600', icon: 'File' };
  }
}
