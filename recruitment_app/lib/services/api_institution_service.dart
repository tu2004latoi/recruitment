import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../configs/app_configs.dart';

class ApiInstitutionService {
  static const _storage = FlutterSecureStorage();

  static Future<Map<String, String>> _headers({bool json = true}) async {
    final token = await _storage.read(key: 'token');
    return {
      if (json) HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer ' + token,
    };
  }

  static Future<dynamic> fetchInstitutions() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.institutionsEndpoint}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Lỗi API: ${res.statusCode} - ${res.body}");
  }

  static Future<List<Map<String, dynamic>>> fetchInstitutionsList() async {
    final data = await fetchInstitutions();
    final list = data is List ? data : (data['content'] ?? []);
    return list.map<Map<String, dynamic>>((e) {
      if (e is Map<String, dynamic>) return e;
      return Map<String, dynamic>.from(e as Map);
    }).toList();
  }

  static Future<Map<String, dynamic>> createInstitution(Map<String, dynamic> payload) async {
    final res = await http.post(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.addInstitutionEndpoint}"),
      headers: await _headers(),
      body: jsonEncode(payload),
    );
    if (res.statusCode == 200 || res.statusCode == 201) {
      final data = jsonDecode(res.body);
      if (data is Map<String, dynamic>) return data;
      return Map<String, dynamic>.from(data as Map);
    }
    throw Exception("Tạo trường học thất bại: ${res.statusCode} - ${res.body}");
  }

  // Public dataset of world universities used by the app for suggestions
  static Future<List<Map<String, dynamic>>> fetchUniversitiesFromGitHub() async {
    final candidates = <String>[
      // Fast CDN mirror
      'https://cdn.jsdelivr.net/gh/Hipo/university-domains-list@master/world_universities_and_domains.json',
      // Raw GitHub fallback
      'https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json',
    ];

    Exception? lastError;
    for (final url in candidates) {
      try {
        final res = await http
            .get(Uri.parse(url))
            .timeout(const Duration(seconds: 12));
        if (res.statusCode == 200) {
          final data = jsonDecode(res.body);
          if (data is List) {
            return data
                .map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e))
                .toList();
          }
          return [];
        }
      } on Exception catch (e) {
        lastError = e;
        continue;
      }
    }
    throw Exception('Lỗi tải danh sách trường từ GitHub/CDN: ${lastError?.toString() ?? 'unknown error'}');
  }
}
