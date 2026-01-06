package com.assoc.cms.service.impl;

import com.assoc.cms.dto.TagResponse;
import com.assoc.cms.entity.Tag;
import com.assoc.cms.repository.TagRepository;
import com.assoc.cms.service.TagService;
import com.assoc.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;

    @Override
    public List<TagResponse> getAllTags() {
        return tagRepository.findAllByOrderByUsageCountDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TagResponse getById(Long id) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("标签不存在: " + id));
        return toResponse(tag);
    }

    @Override
    @Transactional
    public TagResponse getOrCreateByName(String name) {
        Tag tag = tagRepository.findByName(name)
                .orElseGet(() -> {
                    Tag newTag = new Tag();
                    newTag.setName(name);
                    newTag.setUsageCount(0);
                    return tagRepository.save(newTag);
                });
        return toResponse(tag);
    }

    private TagResponse toResponse(Tag tag) {
        TagResponse response = new TagResponse();
        response.setId(tag.getId());
        response.setName(tag.getName());
        response.setUsageCount(tag.getUsageCount());
        return response;
    }
}
