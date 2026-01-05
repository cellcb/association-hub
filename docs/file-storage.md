# 文件存储模块说明

## 目标

为满足“本地磁盘 / 对象存储 (S3 兼容)”双模式部署需求，`common` 模块提供统一的 `FileStorageService` 接口，业务模块只面向该接口编程。后端通过配置切换具体实现，从而实现无侵入地替换存储介质。

## 组件划分

1. **接口**：`common/src/main/java/com/waterplatform/common/storage/FileStorageService.java` 统一定义存储、读取、删除、URL 生成等操作。
2. **本地实现**：`TenantFileStorageService` 负责本地磁盘读写，包含租户前缀与日期目录规则。
3. **S3 实现（待新增）**：遵循同一接口，内部通过 S3 SDK 上传对象、读取字节并生成预签名 URL 或 CDN 地址。
4. **模块子接口**：例如 `KbFileStorageService`、`SystemFileStorageService` 继承自 `FileStorageService`，方便在依赖注入时区分业务能力并额外注入模块配置（上传根目录、URL 前缀等）。

## 切换方案

1. 在配置中心增加 `file.storage.type=local|s3` 及 S3 所需参数（endpoint、accessKey、secretKey、bucket、region 等）。
2. 提供 `StorageAutoConfiguration`：
   ```java
   @Bean
   @ConditionalOnProperty(prefix = "file.storage", name = "type", havingValue = "local", matchIfMissing = true)
   FileStorageService localStorage(RequestContext ctx, StorageProps props) {
       return new TenantFileStorageService(ctx, props.toFileStorageProperties());
   }

   @Bean
   @ConditionalOnProperty(prefix = "file.storage", name = "type", havingValue = "s3")
   FileStorageService s3Storage(StorageProps props) {
       return new S3FileStorageService(props.getS3());
   }
   ```
3. 业务模块仍注入 `KbFileStorageService` / `SystemFileStorageService`，它们可以简单包装 `@Primary` 的 `FileStorageService`，或在 S3 模式下直接继承 `S3FileStorageService`。
4. `getFileUrl` 根据实现返回不同形式的 URL；若使用预签名 URL 可在实现中设置过期时间并在配置中开启缓存策略。

## 注意事项

- 数据库存储仍建议保存逻辑相对路径，便于未来切换存储方案时无需数据迁移，只需调整 URL 生成逻辑。
- S3 模式下需要考虑对象 ACL、预签名有效期、CDN 缓存等政策，可通过扩展接口方法或配置补充。
- 如果后续引入更多存储（OSS、COS 等），只需新增对应实现并扩展配置枚举，业务模块无需改动。

通过上述结构，项目能够在不同部署环境间自由切换文件存储实现，同时保持模块对文件系统的依赖最小化。
