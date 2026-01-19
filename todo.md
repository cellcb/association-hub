# TODO: 智能追问建议

## 背景

当前 `AiSearch.tsx` 中的追问建议是静态硬编码的：

```typescript
const FOLLOW_UP_SUGGESTIONS = [
  '费用多少？',
  '怎么报名？',
  '在哪举办？',
];
```

这些建议与实际对话内容无关，用户体验不够智能。

## 目标

根据 RAG 返回的内容，动态生成相关的追问建议。

## 方案

### 方案一：后端生成（推荐）

在 RAG 响应中增加 `suggestedQuestions` 字段，由 LLM 根据上下文生成。

**后端修改：**

1. 修改 `RagChatResponse.java`，添加字段：
   ```java
   private List<String> suggestedQuestions;
   ```

2. 修改 `RagService.java` 的 system prompt，要求 LLM 在回答末尾输出建议问题：
   ```
   在回答结束后，根据内容生成 2-3 个用户可能想继续追问的问题。
   格式：[建议问题]问题1|问题2|问题3[/建议问题]
   ```

3. 在流式输出完成后，解析并提取建议问题。

**前端修改：**

1. 修改 `rag.ts` 的 SSE 处理，增加 `suggestions` 事件：
   ```typescript
   onSuggestions?: (questions: string[]) => void;
   ```

2. 修改 `AiSearch.tsx`，使用动态建议替代静态列表。

### 方案二：前端根据实体类型生成

根据 RAG 返回的 references 中的 entityType，显示对应的预设问题。

```typescript
const ENTITY_SUGGESTIONS: Record<string, string[]> = {
  activity: ['费用多少？', '怎么报名？', '在哪举办？', '有什么要求？'],
  news: ['有更多详情吗？', '相关新闻有哪些？'],
  expert: ['如何联系？', '擅长哪些领域？', '有哪些成果？'],
  project: ['项目规模多大？', '用了什么技术？', '获得过什么奖项？'],
  product: ['价格多少？', '有什么特点？', '如何购买？'],
};

// 根据返回的 references 动态选择建议
const getSuggestions = (refs: RagReference[]) => {
  const types = [...new Set(refs.map(r => r.entityType))];
  const suggestions: string[] = [];
  types.forEach(type => {
    suggestions.push(...(ENTITY_SUGGESTIONS[type] || []).slice(0, 2));
  });
  return suggestions.slice(0, 4);
};
```

### 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| 后端生成 | 更智能、与内容强相关 | 需要修改后端、增加 token 消耗 |
| 前端实体映射 | 实现简单、无后端改动 | 不够智能、问题较通用 |

## 建议

先实现**方案二**（前端实体映射），快速上线。后续根据用户反馈决定是否升级到**方案一**。

## 相关文件

- `web/src/app/components/AiSearch.tsx` - 前端搜索组件
- `web/src/lib/rag.ts` - RAG API 调用
- `ai/src/main/java/com/assoc/ai/service/RagService.java` - 后端 RAG 服务
- `ai/src/main/java/com/assoc/ai/dto/RagChatResponse.java` - 响应 DTO
