package com.tianji.media.controller;

import com.tianji.common.utils.StringUtils;
import com.tianji.media.domain.dto.FileDTO;
import com.tianji.media.service.IFileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

/**
 * 文件表，可以是普通文件、图片等 前端控制器
 */
@Slf4j
@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Tag(name = "媒资管理相关接口")
public class FileController {

    private final IFileService fileService;

    @Operation(summary = "上传文件")
    @PostMapping
    public FileDTO uploadFile(
            @Parameter(description = "文件数据") @RequestParam("file") MultipartFile file) {
        return fileService.uploadFile(file);
    }

    @Operation(summary = "获取文件信息")
    @GetMapping("/{id}")
    public FileDTO getFileInfo(
            @Parameter(description = "文件id", example = "1") @PathVariable("id") Long id) {
        return fileService.getFileInfo(id);
    }

    @Operation(summary = "公开访问文件（通过存储 key 读取文件流）")
    @GetMapping("/public/{key}")
    public ResponseEntity<byte[]> getFileByKey(@PathVariable("key") String key) {
        if (StringUtils.isBlank(key)) {
            return ResponseEntity.notFound().build();
        }
        try (InputStream inputStream = fileService.downloadByKey(key)) {
            if (inputStream == null) {
                return ResponseEntity.notFound().build();
            }
            byte[] bytes = inputStream.readAllBytes();
            HttpHeaders headers = new HttpHeaders();
            String lower = key.toLowerCase();
            if (lower.endsWith(".png")) {
                headers.setContentType(MediaType.IMAGE_PNG);
            } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
                headers.setContentType(MediaType.IMAGE_JPEG);
            } else if (lower.endsWith(".gif")) {
                headers.setContentType(MediaType.IMAGE_GIF);
            } else if (lower.endsWith(".webp")) {
                headers.setContentType(new MediaType("image", "webp"));
            } else if (lower.endsWith(".svg")) {
                headers.setContentType(new MediaType("image", "svg+xml"));
            } else {
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            }
            headers.setContentLength(bytes.length);
            return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.warn("读取文件失败: {}", key, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "删除文件")
    @DeleteMapping("/{id}")
    public void deleteFileById(
            @Parameter(description = "文件id", example = "1") @PathVariable("id") Long id) {
        fileService.removeById(id);
    }
}
