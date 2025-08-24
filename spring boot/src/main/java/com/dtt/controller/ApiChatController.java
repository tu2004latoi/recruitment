package com.dtt.controller;

import com.dtt.dto.ChatPartnerDTO;
import com.dtt.dto.MessageDTO;
import com.dtt.dto.UserDTO;
import com.dtt.model.User;
import com.dtt.service.MessageService;
import com.dtt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ApiChatController {
    private final MessageService messageService;

    @Autowired
    private UserService userService;

    public ApiChatController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/partners/{userId}")
    public List<ChatPartnerDTO> getConversationPartners(@PathVariable int userId) {
        List<User> partners = messageService.getConversationPartners(userId);
        return partners.stream()
                .map(user -> new ChatPartnerDTO(
                        user.getUserId(),
                        user.getUsername(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getAvatar()
                ))
                .toList();
    }

    @GetMapping("/messages/{partnerId}")
    public List<MessageDTO> getMessagesWithPartner(
            Principal principal,
            @PathVariable int partnerId
    ) {
        User user = this.userService.getUserByUsername(principal.getName());
        int currentUserId = user.getUserId();
        return messageService.getMessagesBetween(currentUserId, partnerId)
                .stream().map(MessageDTO::fromEntity).toList();
    }

}
