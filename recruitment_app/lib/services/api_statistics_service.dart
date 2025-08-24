import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/configs/app_configs.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StatisticsService {
  final http.Client client;
  StatisticsService({required this.client});

  static const _storage = FlutterSecureStorage();
  static Future<Map<String, String>> _authHeaders() async {
    final token = await _storage.read(key: 'token');
    return {
      HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer ' + token,
    };
  }

  Future<Map<String, dynamic>> fetchRecruiterJobStats() async {
    final uri = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.recruiterStatisticJobEndpoint}",
    );
    final res = await client.get(uri, headers: await _authHeaders());
    if (res.statusCode == 200) {
      final decoded = jsonDecode(res.body);
      return decoded is Map<String, dynamic> ? decoded : <String, dynamic>{};
    }
    throw Exception('Failed to load recruiter job stats: ${res.statusCode} - ${res.body}');
  }

  Future<Map<String, dynamic>> fetchRecruiterApplicationStats() async {
    final uri = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.recruiterStatisticApplicationEndpoint}",
    );
    final res = await client.get(uri, headers: await _authHeaders());
    if (res.statusCode == 200) {
      final decoded = jsonDecode(res.body);
      return decoded is Map<String, dynamic> ? decoded : <String, dynamic>{};
    }
    throw Exception('Failed to load recruiter application stats: ${res.statusCode} - ${res.body}');
  }
}
