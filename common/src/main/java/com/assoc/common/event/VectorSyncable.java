package com.assoc.common.event;

/**
 * 支持向量化数据重新同步的服务接口。
 * 业务模块的 Service 实现此接口后，将被 ai 模块自动发现并纳入批量同步。
 */
public interface VectorSyncable {

    /**
     * 获取实体类型标识（如 "news", "product", "expert"）
     */
    String getEntityType();

    /**
     * 重新同步所有数据的向量化
     * @return 同步的记录数
     */
    int resyncVectors();
}
