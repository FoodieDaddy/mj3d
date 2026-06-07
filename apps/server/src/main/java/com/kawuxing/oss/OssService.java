package com.kawuxing.oss;

import com.kawuxing.config.OssConfig;
import org.springframework.stereotype.Service;

@Service
public class OssService {

    private final OssConfig ossConfig;

    public OssService(OssConfig ossConfig) {
        this.ossConfig = ossConfig;
    }

    public String getSignedUrl(String objectKey) {
        // Placeholder - in production, generate signed URL using Aliyun OSS SDK
        return "https://" + ossConfig.getBucketName() + "." + ossConfig.getEndpoint() + "/" + objectKey;
    }

    public void uploadFile(String objectKey, byte[] data) {
        // Placeholder - in production, upload using Aliyun OSS SDK
    }
}
