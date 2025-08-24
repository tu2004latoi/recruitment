import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../configs/app_configs.dart';

class ApiFavoriteService {
  static const _storage = FlutterSecureStorage();

  static Future<Map<String, String>> _headers({bool json = true}) async {
    final token = await _storage.read(key: 'token');
    return {
      if (json) HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer ' + token,
    };
  }

  static Future<List<Map<String, dynamic>>> getMyFavorites() async {
    final res = await http.get(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.myFavoritesEndpoint()}"),
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

  static Future<void> deleteFavorite(int favoriteId) async {
    final res = await http.delete(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.deleteFavoriteEndpoint(favoriteId)}"),
      headers: await _headers(),
    );
    if (res.statusCode != 200) {
      throw Exception("Xóa yêu thích thất bại: ${res.statusCode} - ${res.body}");
    }
  }

  static Future<Map<String, dynamic>> addFavorite(Map<String, dynamic> payload) async {
    final res = await http.post(
      Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.addFavoriteEndpoint}"),
      headers: await _headers(),
      body: jsonEncode(payload),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body);
    }
    throw Exception("Thêm yêu thích thất bại: ${res.statusCode} - ${res.body}");
  }
}
