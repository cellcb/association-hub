package com.assoc.common.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;

public interface FileStorageService {

    String storeFile(MultipartFile file, String subdirectory) throws IOException;

    String storeFileWithName(MultipartFile file, String subdirectory, String filename) throws IOException;

    InputStream getFileAsStream(String filePath) throws IOException;

    byte[] getFileAsBytes(String filePath) throws IOException;

    boolean deleteFile(String filePath) throws IOException;

    boolean fileExists(String filePath);

    Path getAbsolutePath(String filePath);

    String getFileUrl(String filePath);

    boolean isValidFileType(MultipartFile file, String[] allowedTypes);

    boolean isValidFileSize(MultipartFile file, long maxSizeBytes);

    String generateUniqueFilename(String originalFilename);

    String getFileExtension(String filename);

    String getMimeType(MultipartFile file);
}
