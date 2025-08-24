package com.dtt.service;

import com.dtt.model.Message;
import com.dtt.model.User;
import com.dtt.repository.MessageRepository;
import com.dtt.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MessageService {
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageService(MessageRepository messageRepository, UserRepository userRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Message saveMessage(Message message) {
        Message saved = messageRepository.save(message);

        if (saved.getReceiver() != null) {
            messagingTemplate.convertAndSendToUser(
                    saved.getReceiver().getUsername(),
                    "/queue/messages",
                    saved
            );
        }

        if (saved.getSender() != null) {
            messagingTemplate.convertAndSendToUser(
                    saved.getSender().getUsername(),
                    "/queue/messages",
                    saved
            );
        }

        return saved;
    }

    public List<Message> getConversation(int user1Id, int user2Id) {
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("User not found: " + user1Id));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("User not found: " + user2Id));

        return messageRepository.findBySenderAndReceiverOrSenderAndReceiverOrderByCreatedAtAsc(
                user1, user2, user2, user1
        );
    }

    public List<User> getConversationPartners(int userId) {
        Set<User> partners = new HashSet<>();
        partners.addAll(messageRepository.findReceivers(userId));
        partners.addAll(messageRepository.findSenders(userId));
        return new ArrayList<>(partners);
    }

    public List<Message> getMessagesBetween(int user1Id, int user2Id) {
        return getConversation(user1Id, user2Id);
    }
}
