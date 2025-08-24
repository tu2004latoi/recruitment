import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../configs/app_configs.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiUserService {
  static const _storage = FlutterSecureStorage();

  static Future<Map<String, String>> _headers({bool json = true}) async {
    final token = await _storage.read(key: 'token');
    return {
      if (json) HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer ' + token,
    };
  }

  // Public wrapper so other services can access auth headers
  static Future<Map<String, String>> headers({bool json = true}) {
    return _headers(json: json);
  }

  static Future<Map<String, dynamic>> getPublicUserDetails(int userId) async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.publicUserDetails(userId)}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    } else {
      throw Exception("Lỗi API: ${res.statusCode} - ${res.body}");
    }
  }

  static Future<Map<String, dynamic>> loginUser(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.loginEndpoint}"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode(data),
    );

    if (res.statusCode == 200) {
      return jsonDecode(res.body); // body sẽ chứa token
    } else {
      throw Exception("Lỗi API: ${res.statusCode}");
    }
  }

  static Future<Map<String, dynamic>> registerUserWithFile({
    required Map<String, String> fields,
    File? file,
  }) async {
    var uri = Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.registerApplicantEndpoint}");
    var request = http.MultipartRequest('POST', uri);

    // Thêm các trường text
    request.fields.addAll(fields);

    // Thêm file nếu có
    if (file != null) {
      request.files.add(
        await http.MultipartFile.fromPath(
          'file',
          file.path,
          filename: (file.path),
        ),
      );
    }

    var response = await request.send();
    var responseBody = await response.stream.bytesToString();

    if (response.statusCode == 200) {
      return jsonDecode(responseBody);
    } else {
      throw Exception("Đăng ký thất bại: $responseBody");
    }
  }

  static Future<Map<String, dynamic>> registerRecruiterWithFile({
    required Map<String, String> fields,
    File? file,
  }) async {
    var uri = Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.registerRecruiterEndpoint}");
    var request = http.MultipartRequest('POST', uri);

    // Thêm các trường text
    request.fields.addAll(fields);

    // Thêm file nếu có
    if (file != null) {
      request.files.add(
        await http.MultipartFile.fromPath(
          'file',
          file.path,
          filename: (file.path),
        ),
      );
    }

    var response = await request.send();
    var responseBody = await response.stream.bytesToString();

    if (response.statusCode == 200) {
      return jsonDecode(responseBody);
    } else {
      throw Exception("Đăng ký thất bại: $responseBody");
    }
  }

  static Future<Map<String, dynamic>> getCurrentUser() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.currentUserEndpoint}"),
      headers: await _headers(),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    } else {
      throw Exception("Lỗi API: ${res.statusCode}");
    }
  }

  static Future<void> logout() async {
    // Clear stored token (and any related keys if needed later)
    await _storage.delete(key: 'token');
  }
}
