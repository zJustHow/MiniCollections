package com.zjusthow.minicollections.service.sms;

import com.aliyun.dysmsapi20170525.Client;
import com.aliyun.dysmsapi20170525.models.SendSmsRequest;
import com.aliyun.teaopenapi.models.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "aliyun.sms", name = "access-key-id")
public class AliyunSmsService implements SmsService {

    @Value("${aliyun.sms.access-key-id}")
    private String accessKeyId;

    @Value("${aliyun.sms.access-key-secret}")
    private String accessKeySecret;

    @Value("${aliyun.sms.sign-name}")
    private String signName;

    @Value("${aliyun.sms.template-code}")
    private String templateCode;

    @Override
    public void sendCode(String phone, String code) {
        try {
            Config config = new Config()
                    .setAccessKeyId(accessKeyId)
                    .setAccessKeySecret(accessKeySecret);
            config.endpoint = "dysmsapi.aliyuncs.com";
            Client client = new Client(config);

            SendSmsRequest request = new SendSmsRequest()
                    .setSignName(signName)
                    .setTemplateCode(templateCode)
                    .setPhoneNumbers(phone)
                    .setTemplateParam("{\"code\":\"" + code + "\"}");

            client.sendSms(request);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send SMS via Aliyun: " + e.getMessage(), e);
        }
    }
}
