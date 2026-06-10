package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.exception.ServiceNotConfiguredException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock JavaMailSender mailSender;

    @InjectMocks EmailService emailService;

    @Test
    void sendCode_throwsWhenMailSenderNotConfigured() {
        ReflectionTestUtils.setField(emailService, "mailSender", null);

        assertThrows(ServiceNotConfiguredException.class,
                () -> emailService.sendCode("user@example.com", "123456"));
    }

    @Test
    void sendCode_sendsVerificationEmail() {
        ReflectionTestUtils.setField(emailService, "from", "noreply@example.com");

        emailService.sendCode("user@example.com", "654321");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());
        SimpleMailMessage message = captor.getValue();
        assertEquals("noreply@example.com", message.getFrom());
        assertEquals("user@example.com", message.getTo()[0]);
        assertEquals("MiniCollections Verification Code", message.getSubject());
        assertEquals(true, message.getText().contains("654321"));
    }
}
