package com.assoc.common.storage;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Basic properties required for tenant-aware file storage handling.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileStorageProperties {

    /**
     * Root file system path where uploads will be stored.
     */
    private String uploadPath;

    /**
     * Base URL exposed to clients for retrieving the file.
     * Can include query parameters such as "/api/files?path=".
     */
    private String baseUrl;
}
