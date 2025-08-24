import 'package:flutter/material.dart';
import 'dart:async';
import 'package:recruitment_app/services/api_chat_service.dart';
import 'package:recruitment_app/services/api_user_service.dart';
import 'package:recruitment_app/configs/app_configs.dart';
import 'dart:convert';
import 'package:stomp_dart_client/stomp.dart';
import 'package:stomp_dart_client/stomp_config.dart';
import 'package:stomp_dart_client/stomp_frame.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:recruitment_app/configs/i18n.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> with WidgetsBindingObserver {
  int? myUserId;
  List<Map<String, dynamic>> partners = [];
  int? selectedPartnerUserId;
  bool loadingPartners = true;
  bool loadingMessages = false;
  List<Map<String, dynamic>> messages = [];
  final TextEditingController msgCtrl = TextEditingController();
  StompClient? _stomp;
  bool _connected = false;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  final ScrollController _scrollCtrl = ScrollController();
  Timer? _partnersTimer;
  Timer? _messagesTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is Map && args['partnerUserId'] is int) {
        selectedPartnerUserId = args['partnerUserId'] as int;
      }
      _bootstrap();
    });
    // Refresh UI when text changes to toggle send button state
    msgCtrl.addListener(() => setState(() {}));
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Reconnect WS and trigger immediate polls when app comes to foreground
      if ((_stomp?.connected ?? false) == false) {
        _connectWs();
      }
      _triggerImmediatePolls();
    }
  }

  Future<void> _bootstrap() async {
    try {
      final me = await ApiUserService.getCurrentUser();
      myUserId = me['userId'] as int?;
      if (myUserId != null) {
        await _loadPartners();
        if (selectedPartnerUserId != null) {
          await _selectPartner(selectedPartnerUserId!);
        }
        await _connectWs();
        _startPolling();
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${tr('error_loading_messages')}: $e')),
      );
    }
  }

  void _startPolling() {
    _partnersTimer?.cancel();
    _messagesTimer?.cancel();
    // Poll partners every 15s to update unread and latest threads
    _partnersTimer = Timer.periodic(const Duration(seconds: 15), (_) async {
      if (!mounted || myUserId == null) return;
      try {
        final list = await ApiChatService.getPartners(myUserId!);
        if (!mounted) return;
        setState(() => partners = list);
      } catch (_) {}
    });
    // Poll messages of the selected partner every 5s
    _messagesTimer = Timer.periodic(const Duration(seconds: 5), (_) async {
      if (!mounted) return;
      final pid = selectedPartnerUserId;
      if (pid == null) return;
      try {
        final list = await ApiChatService.getMessages(pid);
        if (!mounted) return;
        if (list.length != messages.length) {
          setState(() => messages = list);
          _scrollToBottom();
        }
      } catch (_) {}
    });
  }

  void _stopPolling() {
    _partnersTimer?.cancel();
    _messagesTimer?.cancel();
    _partnersTimer = null;
    _messagesTimer = null;
  }

  void _triggerImmediatePolls() {
    // Fire-and-forget single refreshes
    if (myUserId != null) {
      _loadPartners();
    }
    final pid = selectedPartnerUserId;
    if (pid != null) {
      _refreshMessagesFor(pid);
    }
  }

  Future<void> _refreshMessagesFor(int partnerUserId) async {
    try {
      final list = await ApiChatService.getMessages(partnerUserId);
      if (!mounted) return;
      if (list.length != messages.length) {
        setState(() => messages = list);
        _scrollToBottom();
      }
    } catch (_) {}
  }

  Future<void> _connectWs() async {
    // Derive WS base by stripping '/api' from http base
    final httpBase = AppConfig.apiBaseUrl; // e.g., http://10.0.2.2:8080/api
    final wsHttp = httpBase.replaceFirst('/api', ''); // http://10.0.2.2:8080
    final url = "$wsHttp/ws"; // SockJS endpoint
    final token = await _storage.read(key: 'token');

    _stomp = StompClient(
      config: StompConfig.SockJS(
        url: url,
        webSocketConnectHeaders:
            token != null ? {'Authorization': 'Bearer $token'} : const {},
        stompConnectHeaders:
            token != null ? {'Authorization': 'Bearer $token'} : const {},
        onConnect: (StompFrame frame) {
          if (!mounted) return;
          setState(() => _connected = true);
          _stomp?.subscribe(
            destination: '/user/queue/messages',
            callback: (StompFrame f) {
              try {
                final body = f.body;
                if (body == null) return;
                final Map<String, dynamic> msg = jsonDecode(body);
                final senderId = msg['sender']?['userId'] ?? msg['senderId'];
                final receiverId =
                    msg['receiver']?['userId'] ?? msg['receiverId'];
                final partnerId = senderId == myUserId ? receiverId : senderId;
                if (partnerId == null) return;

                if (selectedPartnerUserId != null &&
                    partnerId.toString() == selectedPartnerUserId.toString()) {
                  // Append to current thread
                  if (!mounted) return;
                  setState(() {
                    messages = [...messages, Map<String, dynamic>.from(msg)];
                  });
                  _scrollToBottom();
                } else {
                  // Optionally update unread count in partners list
                  setState(() {
                    partners = partners.map((p) {
                      final pid = p['userId'] ?? p['id'] ?? p['partnerUserId'];
                      if (pid?.toString() == partnerId.toString()) {
                        final unread = (p['unreadCount'] ?? 0) + 1;
                        return {
                          ...p,
                          'unreadCount': unread,
                          'lastMessage': msg['content']
                        };
                      }
                      return p;
                    }).toList();
                  });
                }
              } catch (_) {}
            },
          );
        },
        onWebSocketError: (dynamic e) {
          if (!mounted) return;
          setState(() => _connected = false);
        },
        onStompError: (StompFrame f) {
          if (!mounted) return;
          setState(() => _connected = false);
        },
        onDisconnect: (StompFrame f) {
          if (!mounted) return;
          setState(() => _connected = false);
        },
        reconnectDelay: const Duration(seconds: 5),
        heartbeatOutgoing: const Duration(seconds: 10),
        heartbeatIncoming: const Duration(seconds: 10),
      ),
    );
    _stomp?.activate();
  }

  Future<void> _loadPartners() async {
    if (myUserId == null) return;
    setState(() => loadingPartners = true);
    try {
      final list = await ApiChatService.getPartners(myUserId!);
      if (!mounted) return;
      setState(() => partners = list);
    } finally {
      if (mounted) setState(() => loadingPartners = false);
    }
  }

  Future<void> _selectPartner(int partnerUserId) async {
    setState(() {
      selectedPartnerUserId = partnerUserId;
      loadingMessages = true;
      messages = [];
    });
    try {
      final list = await ApiChatService.getMessages(partnerUserId);
      if (!mounted) return;
      setState(() => messages = list);
      // reset unread for this partner locally
      setState(() {
        partners = partners.map((p) {
          final pid = p['userId'] ?? p['id'] ?? p['partnerUserId'];
          if (pid?.toString() == partnerUserId.toString()) {
            return {...p, 'unreadCount': 0};
          }
          return p;
        }).toList();
      });
      _scrollToBottom();
      // ensure message polling follows the newly selected partner
      _messagesTimer?.cancel();
      _messagesTimer = Timer.periodic(const Duration(seconds: 5), (_) async {
        if (!mounted) return;
        try {
          final list = await ApiChatService.getMessages(partnerUserId);
          if (!mounted) return;
          if (list.length != messages.length) {
            setState(() => messages = list);
            _scrollToBottom();
          }
        } catch (_) {}
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${tr('cannot_load_conversation')}: $e')),
      );
    } finally {
      if (mounted) setState(() => loadingMessages = false);
    }
  }

  void _sendMessage() {
    final text = msgCtrl.text.trim();
    final partnerId = selectedPartnerUserId;
    if (!_connected || text.isEmpty || partnerId == null || myUserId == null)
      return;

    // Optimistic UI append
    final optimistic = <String, dynamic>{
      'messageId': 'tmp-${DateTime.now().millisecondsSinceEpoch}',
      'senderId': myUserId,
      'receiverId': partnerId,
      'content': text,
      'createdAt': DateTime.now().toIso8601String(),
      'status': 'SENT',
    };
    setState(() {
      messages = [...messages, optimistic];
      msgCtrl.clear();
    });

    final dto = jsonEncode({
      'senderId': myUserId,
      'receiverId': partnerId,
      'content': text,
    });
    try {
      _stomp?.send(destination: '/app/chat.sendMessage', body: dto);
    } catch (_) {}
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.jumpTo(_scrollCtrl.position.maxScrollExtent);
      }
    });
  }

  String _partnerName() {
    final id = selectedPartnerUserId;
    if (id == null) return tr('messages');
    final p = partners.firstWhere(
      (e) =>
          (e['userId'] ?? e['id'] ?? e['partnerUserId'])?.toString() ==
          id.toString(),
      orElse: () => const {},
    );
    debugPrint(p.toString());
    final name = p['firstName'] ?? p['lastName'];
    if (name != null && name.toString().trim().isNotEmpty)
      return name.toString();
    return '#$id';
  }

  @override
  void dispose() {
    try {
      _stomp?.deactivate();
    } catch (_) {}
    _stopPolling();
    WidgetsBinding.instance.removeObserver(this);
    msgCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(selectedPartnerUserId == null ? tr('messages') : _partnerName()),
        actions: [
          IconButton(
            tooltip: tr('refresh'),
            onPressed: _loadPartners,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      drawer: Drawer(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Text(tr('chat_partners'),
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              ),
              Expanded(
                child: loadingPartners
                    ? const Center(child: CircularProgressIndicator())
                    : ListView.separated(
                        itemCount: partners.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (ctx, i) {
                          final p = partners[i];
                          final uid =
                              p['userId'] ?? p['id'] ?? p['partnerUserId'];
                          final name = p['firstName'] ?? p['lastName'] ?? '#$uid';
                          final selected = uid?.toString() ==
                              selectedPartnerUserId?.toString();
                          final unread = p['unreadCount'] ?? 0;
                          return ListTile(
                            selected: selected,
                            leading: CircleAvatar(
                                child: Text(name.toString().isNotEmpty
                                    ? name.toString()[0].toUpperCase()
                                    : '?')),
                            title: Text(name.toString(),
                                overflow: TextOverflow.ellipsis),
                            trailing: unread > 0
                                ? CircleAvatar(
                                    radius: 10,
                                    backgroundColor: Colors.red,
                                    child: Text('$unread',
                                        style: const TextStyle(
                                            color: Colors.white, fontSize: 12)))
                                : null,
                            onTap: () {
                              Navigator.of(context).maybePop();
                              if (uid is int)
                                _selectPartner(uid);
                              else {
                                final parsed =
                                    int.tryParse(uid?.toString() ?? '');
                                if (parsed != null) _selectPartner(parsed);
                              }
                            },
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: loadingMessages
                ? const Center(child: CircularProgressIndicator())
                : messages.isEmpty
                    ? Center(child: Text(tr('no_messages_yet')))
                    : ListView.builder(
                        controller: _scrollCtrl,
                        padding: const EdgeInsets.all(12),
                        itemCount: messages.length,
                        itemBuilder: (ctx, i) {
                          final m = messages[i];
                          final senderId = m['senderId'] ??
                              m['from'] ??
                              m['sender']?['userId'];
                          final isMine = myUserId != null &&
                              senderId?.toString() == myUserId.toString();
                          final text = m['content'] ?? m['text'] ?? '';
                          return Align(
                            alignment: isMine
                                ? Alignment.centerRight
                                : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.symmetric(vertical: 4),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 10),
                              constraints: BoxConstraints(
                                  maxWidth:
                                      MediaQuery.of(context).size.width * 0.7),
                              decoration: BoxDecoration(
                                color: isMine
                                    ? Colors.blue.shade600
                                    : Colors.grey.shade200,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                text.toString(),
                                style: TextStyle(
                                    color: isMine ? Colors.white : Colors.black,
                                    fontSize: 16),
                              ),
                            ),
                          );
                        },
                      ),
          ),
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: msgCtrl,
                      enabled: _connected && selectedPartnerUserId != null,
                      decoration: InputDecoration(
                        hintText: tr('enter_message'),
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: Colors.grey.shade100,
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: (_connected &&
                            selectedPartnerUserId != null &&
                            msgCtrl.text.trim().isNotEmpty)
                        ? Colors.blue
                        : Colors.grey,
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white),
                      onPressed: (_connected &&
                              selectedPartnerUserId != null &&
                              msgCtrl.text.trim().isNotEmpty)
                          ? _sendMessage
                          : null,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
