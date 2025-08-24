import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:recruitment_app/configs/app_configs.dart';

class ApiApplicationService {
  static const _storage = FlutterSecureStorage();

  static Future<Map<String, String>> _headers({bool json = true}) async {
    final token = await _storage.read(key: 'token');
    return {
      if (json) HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer $token',
    };
  }

  // Recruiter: get applications for jobs posted by a recruiter (by userId)
  static Future<List<Map<String, dynamic>>> getApplicationsByRecruiter(int recruiterUserId) async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.getApplicationRecruiter(recruiterUserId)}"),
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

  // Recruiter: accept application
  static Future<void> acceptApplication(int applicationId) async {
    final res = await http.patch(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.acceptedApplications(applicationId)}"),
      headers: await _headers(),
    );
    if (res.statusCode != 200 && res.statusCode != 204) {
      throw Exception("Duyệt đơn thất bại: ${res.statusCode} - ${res.body}");
    }
  }

  // Recruiter: reject application
  static Future<void> rejectApplication(int applicationId) async {
    final res = await http.patch(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.rejectedApplications(applicationId)}"),
      headers: await _headers(),
    );
    if (res.statusCode != 200 && res.statusCode != 204) {
      throw Exception("Từ chối đơn thất bại: ${res.statusCode} - ${res.body}");
    }
  }

  // Recruiter: mark application as sent interview
  static Future<void> markSentInterview(int applicationId) async {
    final res = await http.patch(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.sentInterviewEndpoint(applicationId)}"),
      headers: await _headers(),
    );
    if (res.statusCode != 200 && res.statusCode != 204) {
      throw Exception("Cập nhật trạng thái phỏng vấn thất bại: ${res.statusCode} - ${res.body}");
    }
  }

  static Future<List<Map<String, dynamic>>> getMyApplications() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.myApplicationsEndpoint}"),
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

  static Future<void> deleteApplication(int applicationId) async {
    final res = await http.delete(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.deleteApplicationEndpoint(applicationId)}"),
      headers: await _headers(),
    );
    if (res.statusCode != 200 && res.statusCode != 204) {
      throw Exception("Xóa đơn ứng tuyển thất bại: ${res.statusCode} - ${res.body}");
    }
  }
}