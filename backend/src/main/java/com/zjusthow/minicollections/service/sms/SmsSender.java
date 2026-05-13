package com.zjusthow.minicollections.service.sms;

import com.zjusthow.minicollections.exception.ServiceNotConfiguredException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SmsSender {

    @Autowired(required = false)
    private AliyunSmsService aliyun;

    @Autowired(required = false)
    private TwilioSmsService twilio;

    public void send(String phone, String code) {
        if (phone.startsWith("+86") || !phone.startsWith("+")) {
            if (aliyun == null) throw new ServiceNotConfiguredException("Aliyun SMS is not configured");
            aliyun.sendCode(phone, code);
        } else {
            if (twilio == null) throw new ServiceNotConfiguredException("Twilio SMS is not configured");
            twilio.sendCode(phone, code);
        }
    }
}
