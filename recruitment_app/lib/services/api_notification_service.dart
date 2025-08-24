import 'dart:convert';
import 'package:http/http.dart' as http;
import '../configs/app_configs.dart';
import '../services/api_user_service.dart';

class ApiNotificationService {
  /// Send a notification to a specific user (applicant) by userId
  /// Requires authenticated request (Bearer token is added via ApiUserService.headers)
  static Future<void> sendUserNotification({
    required String title,
    required String body,
    required int userId,
  }) async {
    final url = Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.sendUserNotification}");
    final res = await http.post(
      url,
      headers: await ApiUserService.headers(),
      body: jsonEncode(<String, dynamic>{
        'title': title,
        'body': body,
        'userId': userId,
      }),
    );

    if (res.statusCode != 200) {
      throw Exception('Gửi thông báo thất bại: ${res.statusCode} - ${res.body}');
    }
  }

  /// Optional: broadcast notification to all (if your backend supports it)
  static Future<void> sendNotification({
    required String title,
    required String body,
  }) async {
    final url = Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.sendNotification}");
    final res = await http.post(
      url,
      headers: await ApiUserService.headers(),
      body: jsonEncode(<String, dynamic>{
        'title': title,
        'body': body,
      }),
    );

    if (res.statusCode != 200) {
      throw Exception('Gửi thông báo chung thất bại: ${res.statusCode} - ${res.body}');
    }
  }
}
