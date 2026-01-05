package com.assoc.common.storage;

import com.assoc.common.context.RequestContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Locale;
import java.util.UUID;

/**
 * 通用文件存储实现，模块可以通过组合或继承来创建自己的存储服务。
 */
@Slf4j
@RequiredArgsConstructor
public class TenantFileStorageService implements FileStorageService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    private final RequestContext requestContext;
    private final FileStorageProperties properties;

    @Override
    public String storeFile(MultipartFile file, String subdirectory) throws IOException {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String uniqueFilename = generateUniqueFilename(originalFilename);
        return storeFileWithName(file, subdirectory, uniqueFilename);
    }

    @Override
    public String storeFileWithName(MultipartFile file, String subdirectory, String filename) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("文件不能为空");
        }
        if (!StringUtils.hasText(filename) || filename.contains("..")) {
            throw new FileStorageException("文件名包含非法字符: " + filename);
        }

        String normalizedSubDir = subdirectory == null ? "" : subdirectory.trim();
        String dateDirectory = LocalDateTime.now().format(DATE_FORMAT);
        String fullSubdirectory = (StringUtils.hasText(normalizedSubDir) ? normalizedSubDir + "/" : "") + dateDirectory;

        Path targetLocation = getStorageLocation(fullSubdirectory).resolve(filename);
        Files.createDirectories(targetLocation.getParent());

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
        }

        String relativePath = fullSubdirectory + "/" + filename;
        log.info("File stored at {}", relativePath);
        return relativePath;
    }

    @Override
    public InputStream getFileAsStream(String filePath) throws IOException {
        Path file = resolveAndValidatePath(filePath);
        return Files.newInputStream(file);
    }

    @Override
    public byte[] getFileAsBytes(String filePath) throws IOException {
        Path file = resolveAndValidatePath(filePath);
        if (!Files.exists(file)) {
            throw new IOException("File not found: " + filePath);
        }
        return Files.readAllBytes(file);
    }

    @Override
    public boolean deleteFile(String filePath) throws IOException {
        Path file = resolveAndValidatePath(filePath);
        if (Files.exists(file)) {
            Files.delete(file);
            log.info("File deleted: {}", filePath);
            return true;
        }
        return false;
    }

    @Override
    public boolean fileExists(String filePath) {
        try {
            return Files.exists(resolveAndValidatePath(filePath));
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public Path getAbsolutePath(String filePath) {
        return getStorageLocation("").resolve(filePath).normalize();
    }

    @Override
    public String getFileUrl(String filePath) {
        String baseUrl = properties.getBaseUrl();
        if (!StringUtils.hasText(baseUrl)) {
            return filePath;
        }
        if (baseUrl.contains("?")) {
            return baseUrl + filePath;
        }
        if (baseUrl.endsWith("/")) {
            return baseUrl + filePath;
        }
        return baseUrl + "/" + filePath;
    }

    @Override
    public boolean isValidFileType(MultipartFile file, String[] allowedTypes) {
        if (allowedTypes == null || allowedTypes.length == 0) {
            return true;
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            return false;
        }
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        return Arrays.asList(allowedTypes).contains(fileExtension);
    }

    @Override
    public boolean isValidFileSize(MultipartFile file, long maxSizeBytes) {
        return file.getSize() <= maxSizeBytes;
    }

    @Override
    public String generateUniqueFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        if (StringUtils.hasText(extension)) {
            return timestamp + "_" + uuid + "." + extension;
        }
        return timestamp + "_" + uuid;
    }

    @Override
    public String getFileExtension(String filename) {
        if (!StringUtils.hasText(filename)) {
            return null;
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return null;
        }
        return filename.substring(lastDotIndex + 1).toLowerCase(Locale.ROOT);
    }

    @Override
    public String getMimeType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null) {
            return contentType;
        }
        String filename = file.getOriginalFilename();
        if (filename != null) {
            String extension = getFileExtension(filename);
            return getMimeTypeByExtension(extension);
        }
        return "application/octet-stream";
    }

    private Path getStorageLocation(String subdirectory) {
        Path basePath = Paths.get(properties.getUploadPath()).toAbsolutePath().normalize();
        if (!StringUtils.hasText(subdirectory)) {
            return basePath;
        }
        return basePath.resolve(subdirectory);
    }

    private Path resolveAndValidatePath(String filePath) throws IOException {
        Path basePath = getStorageLocation("");
        Path file = basePath.resolve(filePath).normalize();
        if (!file.startsWith(basePath)) {
            throw new IOException("File path is outside storage directory: " + filePath);
        }
        return file;
    }

    private String getMimeTypeByExtension(String extension) {
        if (extension == null) {
            return "application/octet-stream";
        }
        return switch (extension.toLowerCase(Locale.ROOT)) {
            case "pdf" -> "application/pdf";
            case "doc" -> "application/msword";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xls" -> "application/vnd.ms-excel";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "ppt" -> "application/vnd.ms-powerpoint";
            case "pptx" -> "application/vnd.openxmlformats-officedocument.presentationml.presentation";
            case "txt" -> "text/plain";
            case "rtf" -> "application/rtf";
            case "odt" -> "application/vnd.oasis.opendocument.text";
            case "ods" -> "application/vnd.oasis.opendocument.spreadsheet";
            case "odp" -> "application/vnd.oasis.opendocument.presentation";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "bmp" -> "image/bmp";
            case "svg" -> "image/svg+xml";
            case "zip" -> "application/zip";
            case "rar" -> "application/vnd.rar";
            case "7z" -> "application/x-7z-compressed";
            default -> "application/octet-stream";
        };
    }
}
