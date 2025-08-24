import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:recruitment_app/configs/app_configs.dart';

class ApiInterviewService {
  static const _storage = FlutterSecureStorage();

  static Future<Map<String, String>> _headers({bool json = true}) async {
    final token = await _storage.read(key: 'token');
    return {
      if (json) HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer $token',
    };
  }

  static Future<List<Map<String, dynamic>>> getMyInterviews() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.myInterviewEndpoint}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data is List) {
        return data.map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e)).toList();
      }
      return List<Map<String, dynamic>>.from(data['content'] ?? []);
    }
    throw Exception("Lỗi API: ${res.statusCode} - ${res.body}");
  }

  static Future<Map<String, dynamic>> addInterview(Map<String, dynamic> payload) async {
    final res = await http.post(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.addInterviewEndpoint}"),
      headers: await _headers(),
      body: jsonEncode(payload),
    );
    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    }
    throw Exception("Tạo lịch phỏng vấn thất bại: ${res.statusCode} - ${res.body}");
  }

  static Future<void> deleteInterview(int id) async {
    final res = await http.delete(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.deleteInterviewEndpoint(id)}"),
      headers: await _headers(),
    );
    if (res.statusCode != 200 && res.statusCode != 204) {
      throw Exception("Xóa lịch phỏng vấn thất bại: ${res.statusCode} - ${res.body}");
    }
  }
}