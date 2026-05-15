package com.zjusthow.minicollections.service;

import com.zjusthow.minicollections.config.WechatProperties;
import com.zjusthow.minicollections.exception.ValidationException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@Service
public class WechatService {

    private static final String STATE_PREFIX = "wechat_state:";
    private static final Duration STATE_TTL = Duration.ofMinutes(10);

    // PC 网站扫码登录 URL
    private static final String PC_AUTH_BASE = "https://open.weixin.qq.com/connect/qrconnect";
    // 手机微信内（公众号网页授权）URL
    private static final String MP_AUTH_BASE = "https://open.weixin.qq.com/connect/oauth2/authorize";

    private static final String TOKEN_URL = "https://api.weixin.qq.com/sns/oauth2/access_token";
    private static final String USERINFO_URL = "https://api.weixin.qq.com/sns/userinfo";

    private final WechatProperties props;
    private final StringRedisTemplate redis;
    private final RestClient restClient;

    public WechatService(WechatProperties props, StringRedisTemplate redis, RestClient.Builder restClientBuilder) {
        this.props = props;
        this.redis = redis;
        this.restClient = restClientBuilder.build();
    }

    public record WechatUrlResult(String url, String state) {}

    public record WechatUserInfo(String openid, String unionid, String nickname, String headimgurl) {}

    /**
     * 生成 OAuth 授权 URL，并把 state 存入 Redis 防 CSRF。
     * platform: "pc" 或 "mp"（公众号）
     */
    public WechatUrlResult generateAuthUrl(String platform) {
        String state = UUID.randomUUID().toString().replace("-", "");
        // 把 platform 存进 Redis，exchange 时用于选择正确的 appid/secret
        redis.opsForValue().set(STATE_PREFIX + state, platform, STATE_TTL);

        boolean isMp = "mp".equalsIgnoreCase(platform);
        String baseUrl = isMp ? MP_AUTH_BASE : PC_AUTH_BASE;
        String appid = isMp ? props.getMpAppid() : props.getAppid();
        String redirectUri = isMp ? props.getMpRedirectUri() : props.getRedirectUri();
        // PC 用 snsapi_login（获取头像昵称），MP 用 snsapi_userinfo
        String scope = isMp ? "snsapi_userinfo" : "snsapi_login";

        String url = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("appid", appid)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", scope)
                .queryParam("state", state)
                .toUriString() + "#wechat_redirect";

        return new WechatUrlResult(url, state);
    }

    /**
     * 校验 state，用 code 换 openid/unionid/userinfo。
     */
    @SuppressWarnings("unchecked")
    public WechatUserInfo exchangeCode(String code, String state) {
        String stateKey = STATE_PREFIX + state;
        String platform = redis.opsForValue().get(stateKey);
        if (platform == null) {
            throw new ValidationException("error.wechat_invalid_state");
        }
        redis.delete(stateKey);

        boolean isMp = "mp".equalsIgnoreCase(platform);
        String appid = isMp ? props.getMpAppid() : props.getAppid();
        String secret = isMp ? props.getMpSecret() : props.getSecret();

        // 换 access_token + openid
        Map<String, Object> tokenResp = restClient.get()
                .uri(TOKEN_URL + "?appid={appid}&secret={secret}&code={code}&grant_type=authorization_code",
                        appid, secret, code)
                .retrieve()
                .body(Map.class);

        if (tokenResp == null || tokenResp.containsKey("errcode")) {
            throw new ValidationException("error.wechat_exchange_failed");
        }

        String accessToken = (String) tokenResp.get("access_token");
        String openid = (String) tokenResp.get("openid");
        String unionid = (String) tokenResp.get("unionid"); // 可能为 null

        // 拉取用户信息（头像、昵称）
        Map<String, Object> userResp = restClient.get()
                .uri(USERINFO_URL + "?access_token={token}&openid={openid}&lang=zh_CN",
                        accessToken, openid)
                .retrieve()
                .body(Map.class);

        String nickname = null;
        String headimgurl = null;
        if (userResp != null && !userResp.containsKey("errcode")) {
            nickname = (String) userResp.get("nickname");
            headimgurl = (String) userResp.get("headimgurl");
            if (unionid == null) {
                unionid = (String) userResp.get("unionid");
            }
        }

        return new WechatUserInfo(openid, unionid, nickname, headimgurl);
    }
}
