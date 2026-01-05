---
name: spring-ai
description: >
  Spring AI 框架开发专家指南。提供 LLM 客户端、向量存储、RAG 系统、
  嵌入模型和 Spring AI 配置的指导。当使用 Spring AI、OpenAI、Claude、
  Ollama 或其他 LLM 集成到 Spring Boot 应用时使用此技能。
  参考文档：https://docs.spring.io/spring-ai/reference/
allowed-tools:
  - Read
  - Grep
  - Glob
  - WebFetch
---

# Spring AI Assistant Skill

## 概述
Spring AI 框架专业指导技能，帮助开发者：
- 将 LLM 集成到 Spring Boot 应用
- 构建 RAG (检索增强生成) 系统
- 配置向量存储和嵌入模型
- 实现工具调用和函数集成
- 优化 AI 驱动的功能

## 激活场景
当你需要以下帮助时，此技能会自动激活：
- Spring AI API 或配置问题
- 实现 LLM 与 Spring Boot 的集成
- 使用向量存储后端构建 RAG 系统
- 调试 Spring AI 相关问题
- AI 模型集成的最佳实践
- 配置嵌入或向量存储

## 核心知识领域

### 1. 模型客户端 (Chat Models)
- ChatClient / ChatModel API
- 支持的模型：OpenAI、Anthropic Claude、Azure OpenAI、Ollama、Amazon Bedrock 等
- 流式响应处理
- 多模态支持（图像、音频）

### 2. 向量存储 (Vector Stores)
- 支持：Weaviate、Chroma、Milvus、PostgreSQL pgvector、Redis、Pinecone 等
- 相似度搜索
- 元数据过滤

### 3. RAG 架构
- DocumentReader：PDF、文本、JSON 等文档加载
- DocumentTransformer：文档分块和转换
- EmbeddingModel：文本嵌入生成
- VectorStore：向量存储和检索
- QuestionAnswerAdvisor：问答增强

### 4. 工具调用 (Function Calling)
- @Tool 注解定义工具
- ToolCallback 接口实现
- 工具执行和响应处理
- MCP (Model Context Protocol) 支持

### 5. 配置
- Spring Boot 自动配置
- 属性配置 (application.yml)
- Bean 配置和自定义

### 6. Prompt 工程
- PromptTemplate 模板
- Message 类型：SystemMessage、UserMessage、AssistantMessage
- Prompt 管理和版本控制

## 参考文档

### 核心文档
- [Spring AI 参考文档](https://docs.spring.io/spring-ai/reference/)
- [快速开始](https://docs.spring.io/spring-ai/reference/getting-started.html)

### Chat Models
- [Chat Model API](https://docs.spring.io/spring-ai/reference/api/chatmodel.html)
- [ChatClient](https://docs.spring.io/spring-ai/reference/api/chatclient.html)
- [OpenAI Chat](https://docs.spring.io/spring-ai/reference/api/chat/openai-chat.html)
- [Anthropic Claude](https://docs.spring.io/spring-ai/reference/api/chat/anthropic-chat.html)
- [Ollama](https://docs.spring.io/spring-ai/reference/api/chat/ollama-chat.html)

### Embeddings & Vector Stores
- [Embedding API](https://docs.spring.io/spring-ai/reference/api/embeddings.html)
- [Vector Store API](https://docs.spring.io/spring-ai/reference/api/vectordbs.html)
- [pgvector](https://docs.spring.io/spring-ai/reference/api/vectordbs/pgvector.html)

### RAG
- [ETL Pipeline](https://docs.spring.io/spring-ai/reference/api/etl-pipeline.html)
- [Document Readers](https://docs.spring.io/spring-ai/reference/api/etl-pipeline.html#_documentreader)
- [Advisors](https://docs.spring.io/spring-ai/reference/api/advisors.html)

### Function Calling
- [Function Calling](https://docs.spring.io/spring-ai/reference/api/functions.html)
- [MCP Support](https://docs.spring.io/spring-ai/reference/api/mcp.html)

## 使用指南

当遇到 Spring AI 相关问题时，我会：
1. 使用 WebFetch 获取最新的 Spring AI 文档
2. 检查项目中的 Spring AI 配置和实现代码
3. 解释 Spring AI 概念、模式和最佳实践
4. 为你的用例建议最优的向量存储选择
5. 调试 Spring AI 集成问题
6. 审查 RAG 管道实现

## 常用配置示例

### Maven 依赖
```xml
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-openai-spring-boot-starter</artifactId>
</dependency>
```

### application.yml 配置
```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4
          temperature: 0.7
```

### ChatClient 使用
```java
@Autowired
private ChatClient chatClient;

String response = chatClient.prompt()
    .user("Hello, Spring AI!")
    .call()
    .content();
```
