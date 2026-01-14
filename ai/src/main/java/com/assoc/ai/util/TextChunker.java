package com.assoc.ai.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Utility for splitting text into chunks suitable for vectorization.
 * Uses sentence-aware chunking with overlap.
 */
@Slf4j
@Component
public class TextChunker {

    @Value("${kb.chunking.size:400}")
    private int chunkSize;

    @Value("${kb.chunking.overlap:50}")
    private int overlap;

    // Sentence boundary pattern (Chinese and English)
    private static final Pattern SENTENCE_PATTERN = Pattern.compile(
            "(?<=[。！？.!?])|(?<=\\n\\n)"
    );

    /**
     * Split text into chunks.
     *
     * @param text the text to chunk
     * @return list of text chunks
     */
    public List<String> chunk(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        text = text.trim();

        // If text is shorter than chunk size, return as single chunk
        if (text.length() <= chunkSize) {
            return List.of(text);
        }

        List<String> chunks = new ArrayList<>();
        List<String> sentences = splitIntoSentences(text);

        StringBuilder currentChunk = new StringBuilder();
        List<String> currentSentences = new ArrayList<>();

        for (String sentence : sentences) {
            // If adding this sentence exceeds chunk size
            if (currentChunk.length() + sentence.length() > chunkSize && !currentChunk.isEmpty()) {
                // Save current chunk
                chunks.add(currentChunk.toString().trim());

                // Start new chunk with overlap
                currentChunk = new StringBuilder();
                currentSentences.clear();

                // Add overlap from previous content
                int overlapChars = 0;
                for (int i = chunks.size() - 1; i >= 0 && overlapChars < overlap; i--) {
                    String prevChunk = chunks.get(i);
                    int startIdx = Math.max(0, prevChunk.length() - (overlap - overlapChars));
                    currentChunk.insert(0, prevChunk.substring(startIdx));
                    overlapChars += prevChunk.length() - startIdx;
                }
            }

            currentChunk.append(sentence);
            currentSentences.add(sentence);
        }

        // Add remaining content
        if (!currentChunk.isEmpty()) {
            chunks.add(currentChunk.toString().trim());
        }

        log.debug("Split text ({} chars) into {} chunks", text.length(), chunks.size());
        return chunks;
    }

    /**
     * Split text into sentences.
     */
    private List<String> splitIntoSentences(String text) {
        String[] parts = SENTENCE_PATTERN.split(text);
        List<String> sentences = new ArrayList<>();

        for (String part : parts) {
            if (!part.isBlank()) {
                sentences.add(part.trim() + " ");
            }
        }

        return sentences;
    }
}
