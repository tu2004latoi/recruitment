import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../configs/app_configs.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiJobTypeService {
  static const _storage = FlutterSecureStorage();
  static Future<Map<String, String>> _headers() async {
    final token = await _storage.read(key: 'token');
    return {
      HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer ' + token,
    };
  }
  static Future<dynamic> fetchJobTypes() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.jobTypesEndpoint}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    } else {
      throw Exception("Lỗi API: ${res.statusCode}");
    }
  }

  static Future<List<Map<String, dynamic>>> fetchJobTypesList() async {
    final data = await fetchJobTypes();
    final list = data is List ? data : (data['content'] ?? []);
    return list.map<Map<String, dynamic>>((e) {
      if (e is Map<String, dynamic>) return e;
      return Map<String, dynamic>.from(e as Map);
    }).toList();
  }
  static Future<Map<String, dynamic>> fetchJobTypeDetails(int id) async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.jobTypeDetailsEndpoint(id)}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    } else {
      throw Exception("Lỗi API: ${res.statusCode}");
    }
  }
}