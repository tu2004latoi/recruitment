import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../configs/app_configs.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiLocationService {
  static const _storage = FlutterSecureStorage();
  static Future<Map<String, String>> _headers() async {
    final token = await _storage.read(key: 'token');
    return {
      HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer ' + token,
    };
  }
  static Future<dynamic> fetchLocations() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.locationsEndpoint}"),
      headers: await _headers(),
    );

    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    } else {
      throw Exception("Lỗi API: ${res.statusCode}");
    }
  }

  static Future<List<Map<String, dynamic>>> fetchLocationsList() async {
    final data = await fetchLocations();
    final list = data is List ? data : (data['content'] ?? []);
    return list.map<Map<String, dynamic>>((e) {
      if (e is Map<String, dynamic>) return e;
      return Map<String, dynamic>.from(e as Map);
    }).toList();
  }
  static Future<Map<String, dynamic>> fetchLocationDetails(int id) async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.locationDetailsEndpoint(id)}"),
      headers: await _headers(),
    );

    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    } else {
      throw Exception("Lỗi API: ${res.statusCode}");
    }
  }

  static Future<Map<String, dynamic>> updateLocation(int id, Map<String, dynamic> data) async {
    final res = await http.patch(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.updateLocationEndpoint(id)}"),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    // Treat 200 OK, 201 Created, and 204 No Content as success
    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    } else if (res.statusCode == 204) {
      // No response body
      return <String, dynamic>{};
    } else {
      throw Exception("Cập nhật địa chỉ thất bại: ${res.statusCode} - ${res.body}");
    }
  }

  static Future<Map<String, dynamic>> createLocation(Map<String, dynamic> data) async {
    final res = await http.post(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.addLocationEndpoint}"),
      headers: await _headers(),
      body: jsonEncode(data),
    );
    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body);
    } else {
      throw Exception("Tạo địa chỉ thất bại: ${res.statusCode} - ${res.body}");
    }
  }
}