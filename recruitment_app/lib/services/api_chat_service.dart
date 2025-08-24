import 'dart:convert';
import 'dart:io';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/configs/app_configs.dart';

class ApiChatService {
  static const _storage = FlutterSecureStorage();

  static Future<Map<String, String>> _headers({bool json = true}) async {
    final token = await _storage.read(key: 'token');
    return {
      if (json) HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer $token',
    };
  }

  static Future<List<Map<String, dynamic>>> getPartners(int userId) async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.messagesPartnersEndpoint(userId)}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data is List) {
        return data
            .map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e))
            .toList();
      }
      return List<Map<String, dynamic>>.from(data['content'] ?? []);
    }
    throw Exception("Lỗi API: ${res.statusCode} - ${res.body}");
  }

  static Future<List<Map<String, dynamic>>> getMessages(int partnerUserId) async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.messagesByPartnerEndpoint(partnerUserId)}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data is List) {
        return data
            .map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e))
            .toList();
      }
      return List<Map<String, dynamic>>.from(data['content'] ?? []);
    }
    throw Exception("Lỗi API: ${res.statusCode} - ${res.body}");
  }
}
