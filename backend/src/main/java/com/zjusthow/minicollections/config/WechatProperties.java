package com.zjusthow.minicollections.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "wechat")
public class WechatProperties {

    /** 开放平台 AppID（PC 扫码登录） */
    private String appid;
    private String secret;
    private String redirectUri;

    /** 公众号 AppID（手机微信内网页授权），未配置时回退到 appid */
    private String mpAppid;
    private String mpSecret;
    /** 公众号回调地址，未配置时回退到 redirectUri */
    private String mpRedirectUri;

    public String getAppid() { return appid; }
    public void setAppid(String appid) { this.appid = appid; }

    public String getSecret() { return secret; }
    public void setSecret(String secret) { this.secret = secret; }

    public String getRedirectUri() { return redirectUri; }
    public void setRedirectUri(String redirectUri) { this.redirectUri = redirectUri; }

    public String getMpAppid() { return mpAppid != null && !mpAppid.isBlank() ? mpAppid : appid; }
    public void setMpAppid(String mpAppid) { this.mpAppid = mpAppid; }

    public String getMpSecret() { return mpSecret != null && !mpSecret.isBlank() ? mpSecret : secret; }
    public void setMpSecret(String mpSecret) { this.mpSecret = mpSecret; }

    public String getMpRedirectUri() { return mpRedirectUri != null && !mpRedirectUri.isBlank() ? mpRedirectUri : redirectUri; }
    public void setMpRedirectUri(String mpRedirectUri) { this.mpRedirectUri = mpRedirectUri; }
}
