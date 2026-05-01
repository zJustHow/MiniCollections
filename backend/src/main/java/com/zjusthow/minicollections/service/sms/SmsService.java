package com.zjusthow.minicollections.service.sms;

public interface SmsService {
    void sendCode(String phone, String code);
}
