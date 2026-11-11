package com.mediaflow;

import com.mediaflow.service.MediaValidationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MediaFlowApplicationTests {

    @Autowired
    private MediaValidationService validationService;

    @Autowired
    private com.mediaflow.service.AuthService authService;

    @Test
    void contextLoads() {
        assertNotNull(validationService);
        assertNotNull(authService);
    }

    @Test
    void testDemoLoginGeneratesValidToken() {
        com.mediaflow.dto.AuthResponse demoUser = authService.getDemoUser();
        assertNotNull(demoUser);
        assertNotNull(demoUser.getToken());
        assertEquals("demo@mediaflow.local", demoUser.getEmail());
    }

    @Test
    void testUploadValidationRejectsEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "test.mp4", "video/mp4", new byte[0]);
        assertThrows(IllegalArgumentException.class, () -> validationService.validate(emptyFile));
    }

    @Test
    void testUploadValidationRejectsInvalidRenamedType() {
        // T02: Text file renamed to .mp4
        byte[] textBytes = "This is a plain text file, not a video.".getBytes();
        MockMultipartFile fakeVideo = new MockMultipartFile("file", "fake.mp4", "video/mp4", textBytes);
        assertThrows(IllegalArgumentException.class, () -> validationService.validate(fakeVideo));
    }
}
