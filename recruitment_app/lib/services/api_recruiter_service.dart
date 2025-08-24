import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../configs/app_configs.dart';

class ApiRecruiterService {
  static const _storage = FlutterSecureStorage();

  static Future<Map<String, String>> _headers({bool json = true}) async {
    final token = await _storage.read(key: 'token');
    return {
      if (json) HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer ' + token,
    };
  }

  static Future<Map<String, dynamic>> getProfile() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.recruiterProfileEndpoint}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Lỗi API: ${res.statusCode}");
  }

  static Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final res = await http.patch(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.updateRecruiterProfileEndpoint}"),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Lỗi API: ${res.statusCode} - ${res.body}");
  }

  static Future<Map<String, dynamic>> getRecruiterDetails(int userId) async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.getRecruiterDetails(userId)}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Lỗi API: ${res.statusCode} - ${res.body}");
  }
}
