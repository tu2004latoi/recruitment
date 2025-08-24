import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../configs/app_configs.dart';

class ApiProfileService {
  static const _storage = FlutterSecureStorage();

  static Future<Map<String, String>> _headers({bool json = true}) async {
    final token = await _storage.read(key: 'token');
    return {
      if (json) HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer ' + token,
    };
  }

  // Current user basic profile
  static Future<Map<String, dynamic>> getCurrentUser() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.currentUserEndpoint}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Lỗi API: ${res.statusCode}");
  }

  // Applicant
  static Future<Map<String, dynamic>> getApplicantProfile() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.applicantProfileEndpoint}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Lỗi API: ${res.statusCode}");
  }

  static Future<Map<String, dynamic>> updateApplicantProfile(Map<String, dynamic> data) async {
    final res = await http.patch(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.updateApplicantProfileEndpoint}"),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Lỗi API: ${res.statusCode} - ${res.body}");
  }

  static Future<List<Map<String, dynamic>>> getApplicantEducations() async {
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

  // Recruiter
  static Future<Map<String, dynamic>> getRecruiterProfile() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.recruiterProfileEndpoint}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Lỗi API: ${res.statusCode}");
  }

  static Future<Map<String, dynamic>> updateRecruiterProfile(Map<String, dynamic> data) async {
    final res = await http.patch(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.updateRecruiterProfileEndpoint}"),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Lỗi API: ${res.statusCode} - ${res.body}");
  }

  // Institutions
  static Future<List<Map<String, dynamic>>> getInstitutions() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.institutionsEndpoint}"),
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

  static Future<Map<String, dynamic>> addInstitution(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.addInstitutionEndpoint}"),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Thêm trường thất bại: ${res.statusCode} - ${res.body}");
  }

  // Location
  static Future<Map<String, dynamic>> getLocationDetails(int id) async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.locationDetailsEndpoint(id)}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Lỗi API: ${res.statusCode}");
  }

  static Future<Map<String, dynamic>> updateLocation(int id, Map<String, dynamic> data) async {
    final res = await http.patch(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.updateLocationEndpoint(id)}"),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode == 200) return jsonDecode(res.body);
    throw Exception("Cập nhật địa chỉ thất bại: ${res.statusCode} - ${res.body}");
  }
}
