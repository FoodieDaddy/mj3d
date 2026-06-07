package com.kawuxing.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OssConfig {

    @Value("${oss.endpoint:}")
    private String endpoint;

    @Value("${oss.access-key-id:}")
    private String accessKeyId;

    @Value("${oss.access-key-secret:}")
    private String accessKeySecret;

    @Value("${oss.bucket-name:}")
    private String bucketName;

    public String getEndpoint() { return endpoint; }
    public String getAccessKeyId() { return accessKeyId; }
    public String getAccessKeySecret() { return accessKeySecret; }
    public String getBucketName() { return bucketName; }
}
