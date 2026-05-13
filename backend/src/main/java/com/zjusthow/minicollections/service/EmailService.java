package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.exception.ServiceNotConfiguredException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    public void sendCode(String to, String code) {
        if (mailSender == null) throw new ServiceNotConfiguredException("Email service is not configured");
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject("MiniCollections Verification Code");
        msg.setText("Your verification code is: " + code + "\n\nValid for 5 minutes. Do not share it with anyone.");
        mailSender.send(msg);
    }
}
