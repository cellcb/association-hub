package com.assoc.cms.controller;

import com.assoc.cms.dto.ManufacturerListResponse;
import com.assoc.cms.dto.ManufacturerRequest;
import com.assoc.cms.dto.ManufacturerResponse;
import com.assoc.cms.service.ManufacturerService;
import com.assoc.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/manufacturers")
@RequiredArgsConstructor
@Tag(name = "厂商管理", description = "厂商后台管理接口")
public class AdminManufacturerController {

    private final ManufacturerService manufacturerService;

    @GetMapping
    @Operation(summary = "获取厂商列表（管理端）")
    public Result<Page<ManufacturerListResponse>> getManufacturers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return Result.success(manufacturerService.getAllManufacturers(status, categoryId, keyword, pageRequest));
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取厂商详情")
    public Result<ManufacturerResponse> getManufacturer(@PathVariable Long id) {
        return Result.success(manufacturerService.getManufacturerById(id));
    }

    @PostMapping
    @Operation(summary = "创建厂商")
    public Result<ManufacturerResponse> createManufacturer(@Valid @RequestBody ManufacturerRequest request) {
        return Result.success(manufacturerService.createManufacturer(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新厂商")
    public Result<ManufacturerResponse> updateManufacturer(
            @PathVariable Long id,
            @Valid @RequestBody ManufacturerRequest request) {
        return Result.success(manufacturerService.updateManufacturer(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除厂商")
    public Result<Void> deleteManufacturer(@PathVariable Long id) {
        manufacturerService.deleteManufacturer(id);
        return Result.success(null);
    }

    @PostMapping("/resync-vectors")
    @Operation(summary = "重新同步向量")
    public Result<Integer> resyncVectors() {
        return Result.success(manufacturerService.resyncVectors());
    }
}
