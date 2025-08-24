import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../configs/app_configs.dart';

class ApiApplicantService {
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
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.applicantProfileEndpoint}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Lỗi API: ${res.statusCode}");
  }

  static Future<Map<String, dynamic>> updateProfile(Map<String, dynamic> data) async {
    final res = await http.patch(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.updateApplicantProfileEndpoint}"),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Lỗi API: ${res.statusCode} - ${res.body}");
  }

  static Future<List<Map<String, dynamic>>> getEducations() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.educationApplicantEndpoint}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      if (data is List) {
        return data.map<Map<String, dynamic>>((e) => Map<String, dynamic>.from(e)).toList();
      }
      return List<Map<String, dynamic>>.from(data['content'] ?? []);
    }
    throw Exception("Lỗi API: ${res.statusCode}");
  }

  static Future<void> addEducations(List<Map<String, dynamic>> educations) async {
    final res = await http.post(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.addEducationEndpoint}"),
      headers: await _headers(),
      body: jsonEncode(educations),
    );
    if (res.statusCode != 200) {
      throw Exception("Thêm học vấn thất bại: ${res.statusCode} - ${res.body}");
    }
  }

  static Future<void> updateEducation(int id, Map<String, dynamic> data) async {
    final res = await http.patch(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.updateEducationEndpoint(id)}"),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode != 200) {
      throw Exception("Cập nhật học vấn thất bại: ${res.statusCode} - ${res.body}");
    }
  }

  static Future<void> deleteEducation(int id) async {
    final res = await http.delete(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.deleteEducationEndpoint(id)}"),
      headers: await _headers(),
    );
    if (res.statusCode != 200) {
      throw Exception("Xóa học vấn thất bại: ${res.statusCode} - ${res.body}");
    }
  }
}
