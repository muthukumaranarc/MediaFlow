package com.mediaflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class MetadataExtractionService {

    @Value("${mediaflow.ffprobe.path:ffprobe}")
    private String ffprobePath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class MediaMetadata {
        private Double duration = 0.0;
        private Integer width = 0;
        private Integer height = 0;
        private String videoCodec = "unknown";
        private String audioCodec = "unknown";
        private Long bitrate = 0L;

        public Double getDuration() { return duration; }
        public void setDuration(Double duration) { this.duration = duration; }
        public Integer getWidth() { return width; }
        public void setWidth(Integer width) { this.width = width; }
        public Integer getHeight() { return height; }
        public void setHeight(Integer height) { this.height = height; }
        public String getVideoCodec() { return videoCodec; }
        public void setVideoCodec(String videoCodec) { this.videoCodec = videoCodec; }
        public String getAudioCodec() { return audioCodec; }
        public void setAudioCodec(String audioCodec) { this.audioCodec = audioCodec; }
        public Long getBitrate() { return bitrate; }
        public void setBitrate(Long bitrate) { this.bitrate = bitrate; }
    }

    public MediaMetadata extract(Path filePath) {
        MediaMetadata metadata = new MediaMetadata();
        try {
            List<String> command = new ArrayList<>();
            command.add(ffprobePath);
            command.add("-v");
            command.add("error");
            command.add("-show_entries");
            command.add("stream=codec_name,codec_type,width,height,bit_rate,duration");
            command.add("-show_entries");
            command.add("format=duration,size,bit_rate");
            command.add("-of");
            command.add("json");
            command.add(filePath.toAbsolutePath().toString());

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line);
                }
            }

            int exitCode = process.waitFor();
            if (exitCode == 0 && output.length() > 0) {
                JsonNode root = objectMapper.readTree(output.toString());
                JsonNode formatNode = root.path("format");
                if (formatNode.has("duration")) {
                    metadata.setDuration(formatNode.get("duration").asDouble(0.0));
                }
                if (formatNode.has("bit_rate")) {
                    metadata.setBitrate(formatNode.get("bit_rate").asLong(0L));
                }

                JsonNode streamsNode = root.path("streams");
                if (streamsNode.isArray()) {
                    for (JsonNode stream : streamsNode) {
                        String type = stream.path("codec_type").asText("");
                        if ("video".equalsIgnoreCase(type)) {
                            metadata.setVideoCodec(stream.path("codec_name").asText("h264"));
                            if (stream.has("width")) {
                                metadata.setWidth(stream.get("width").asInt(0));
                            }
                            if (stream.has("height")) {
                                metadata.setHeight(stream.get("height").asInt(0));
                            }
                            if (metadata.getDuration() == 0.0 && stream.has("duration")) {
                                metadata.setDuration(stream.get("duration").asDouble(0.0));
                            }
                        } else if ("audio".equalsIgnoreCase(type)) {
                            metadata.setAudioCodec(stream.path("codec_name").asText("aac"));
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("ffprobe execution error: " + e.getMessage());
        }
        return metadata;
    }
}
