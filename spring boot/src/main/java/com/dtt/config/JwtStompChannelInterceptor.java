package com.dtt.config;

import com.dtt.utils.JwtUtils;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JwtStompChannelInterceptor implements ChannelInterceptor {

    private final UserDetailsService userDetailsService;

    public JwtStompChannelInterceptor(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> auth = accessor.getNativeHeader("Authorization");
            if (auth != null && !auth.isEmpty() && auth.get(0).startsWith("Bearer ")) {
                String token = auth.get(0).substring(7);
                try {
                    String username = JwtUtils.validateTokenAndGetUsername(token);
                    if (username != null) {
                        UserDetails ud = userDetailsService.loadUserByUsername(username);
                        Authentication authentication = new UsernamePasswordAuthenticationToken(
                                ud.getUsername(), null, ud.getAuthorities()
                        );
                        accessor.setUser(authentication); // Principal.getName() = username
                        System.out.println("[WS] CONNECT as user: " + username);
                    }
                    else {
                        System.out.println("[WS] CONNECT no username from token!");
                    }
                } catch (Exception e) {
                    // log lỗi, có thể từ chối kết nối nếu cần
                }
            }
        }
        return message;
    }
}