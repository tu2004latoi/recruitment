package com.dtt.controller;

import com.dtt.dto.MessageRequestDTO;
import com.dtt.model.Message;
import com.dtt.model.User;
import com.dtt.service.MessageService;
import com.dtt.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserService userService;

    @Autowired
    public ChatController(MessageService messageService, SimpMessagingTemplate messagingTemplate, UserService userService) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
        this.userService = userService;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(MessageRequestDTO dto) {
        User sender = userService.getUserById(dto.getSenderId());
        User receiver = userService.getUserById(dto.getReceiverId());

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(dto.getContent());
        message.setStatus(Message.Status.SENT);

        Message saved = messageService.saveMessage(message);

        messagingTemplate.convertAndSendToUser(
                String.valueOf(saved.getReceiver().getUserId()),
                "/queue/messages",
                saved
        );
    }
}
