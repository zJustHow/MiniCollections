package com.zjusthow.minicollections.service.sms;

import com.zjusthow.minicollections.exception.ServiceNotConfiguredException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class SmsSenderTest {

    @Mock AliyunSmsService aliyun;
    @Mock TwilioSmsService twilio;

    @InjectMocks SmsSender smsSender;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(smsSender, "aliyun", aliyun);
        ReflectionTestUtils.setField(smsSender, "twilio", twilio);
    }

    @Test
    void send_routesChinaNumbersToAliyun() {
        smsSender.send("+8613800138000", "123456");

        verify(aliyun).sendCode("+8613800138000", "123456");
    }

    @Test
    void send_routesInternationalNumbersToTwilio() {
        smsSender.send("+14155552671", "654321");

        verify(twilio).sendCode("+14155552671", "654321");
    }

    @Test
    void send_throwsWhenAliyunNotConfigured() {
        ReflectionTestUtils.setField(smsSender, "aliyun", null);

        assertThrows(ServiceNotConfiguredException.class,
                () -> smsSender.send("13800138000", "123456"));
    }

    @Test
    void send_throwsWhenTwilioNotConfigured() {
        ReflectionTestUtils.setField(smsSender, "twilio", null);

        assertThrows(ServiceNotConfiguredException.class,
                () -> smsSender.send("+14155552671", "654321"));
    }
}
