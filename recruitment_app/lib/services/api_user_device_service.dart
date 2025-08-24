import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../configs/app_configs.dart';
import '../services/api_user_service.dart';

Future<void> registerDevice(String fcmToken, int userId) async {
  final url = Uri.parse("${AppConfig.apiBaseUrl}${AppConfig.registerDevice}");
  final response = await http.post(
    url,
    headers: await ApiUserService.headers(),
    body: json.encode(
        {"userId": userId, "fcmToken": fcmToken, "deviceType": "ANDROID"}),
  );

  if (response.statusCode == 200) {
    debugPrint("✅ Đăng ký device thành công");
  } else {
    debugPrint("❌ Lỗi đăng ký: ${response.body}");
  }
}
