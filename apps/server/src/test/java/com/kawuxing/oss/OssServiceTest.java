package com.kawuxing.oss;

import com.kawuxing.config.OssConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class OssServiceTest {

    private OssService ossService;
    private OssConfig ossConfig;

    @BeforeEach
    void setUp() {
        ossConfig = new OssConfig();
        ReflectionTestUtils.setField(ossConfig, "bucketName", "kawuxing-assets");
        ReflectionTestUtils.setField(ossConfig, "endpoint", "oss-cn-hangzhou.aliyuncs.com");

        ossService = new OssService(ossConfig);
    }

    @Test
    void getSignedUrl_containsBucketName() {
        String url = ossService.getSignedUrl("models/tile_001.glb");
        assertTrue(url.contains("kawuxing-assets"));
    }

    @Test
    void getSignedUrl_containsEndpoint() {
        String url = ossService.getSignedUrl("models/tile_001.glb");
        assertTrue(url.contains("oss-cn-hangzhou.aliyuncs.com"));
    }

    @Test
    void getSignedUrl_containsObjectKey() {
        String url = ossService.getSignedUrl("models/tile_001.glb");
        assertTrue(url.contains("models/tile_001.glb"));
    }

    @Test
    void getSignedUrl_usesHttps() {
        String url = ossService.getSignedUrl("models/tile_001.glb");
        assertTrue(url.startsWith("https://"));
    }

    @Test
    void getSignedUrl_differentKeys_returnDifferentUrls() {
        String url1 = ossService.getSignedUrl("models/tile_001.glb");
        String url2 = ossService.getSignedUrl("sounds/discard.mp3");
        assertNotEquals(url1, url2);
    }

    @Test
    void uploadFile_doesNotThrow() {
        assertDoesNotThrow(() -> {
            ossService.uploadFile("test.txt", new byte[]{1, 2, 3});
        });
    }

    @Test
    void getSignedUrl_formatsCorrectly() {
        String url = ossService.getSignedUrl("textures/tile_wan_1.png");
        String expected = "https://kawuxing-assets.oss-cn-hangzhou.aliyuncs.com/textures/tile_wan_1.png";
        assertEquals(expected, url);
    }
}
