package com.zjusthow.minicollections.service.sms;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "twilio.sms", name = "account-sid")
public class TwilioSmsService implements SmsService {

    @Value("${twilio.sms.account-sid}")
    private String accountSid;

    @Value("${twilio.sms.auth-token}")
    private String authToken;

    @Value("${twilio.sms.from-number}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    @Override
    public void sendCode(String phone, String code) {
        Message.creator(
                new PhoneNumber(phone),
                new PhoneNumber(fromNumber),
                "Your MiniCollections verification code is: " + code + ". Valid for 5 minutes."
        ).create();
    }
}
