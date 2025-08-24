import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/configs/app_configs.dart';
import 'package:recruitment_app/models/job_model.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class JobService {
  final http.Client client;
  JobService({required this.client});

  // For authorized requests (e.g., delete)
  static const _storage = FlutterSecureStorage();
  static Future<Map<String, String>> _authHeaders() async {
    final token = await _storage.read(key: 'token');
    return {
      HttpHeaders.contentTypeHeader: 'application/json',
      if (token != null && token.isNotEmpty)
        HttpHeaders.authorizationHeader: 'Bearer ' + token,
    };
  }

  // Lấy chi tiết công việc theo recruiter (cần quyền) để xác thực quyền chỉnh sửa
  Future<Map<String, dynamic>> getJobDetailsByRecruiter(
      int userId, int jobId) async {
    final url = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.getJobDetailsByRecruiter(userId, jobId)}",
    );
    final res = await http.get(url, headers: await _authHeaders());
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception(
        "Failed to load job details for recruiter: ${res.statusCode} - ${res.body}");
  }

  // Cập nhật công việc (cần quyền)
  Future<Map<String, dynamic>> updateJob(
      int id, Map<String, dynamic> jobData) async {
    final url = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.updateJobEndpoint(id)}",
    );
    final res = await http.patch(
      url,
      headers: await _authHeaders(),
      body: jsonEncode(jobData),
    );
    if (res.statusCode == 200) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception(
        "Cập nhật công việc thất bại: ${res.statusCode} - ${res.body}");
  }

  // Tạo công việc mới (cần quyền)
  Future<Map<String, dynamic>> createJob(Map<String, dynamic> jobData) async {
    final url = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.addJobEndpoint}",
    );
    final res = await http.post(
      url,
      headers: await _authHeaders(),
      body: jsonEncode(jobData),
    );
    if (res.statusCode == 200 || res.statusCode == 201) {
      return jsonDecode(res.body) as Map<String, dynamic>;
    }
    throw Exception("Tạo công việc thất bại: ${res.statusCode} - ${res.body}");
  }

  // Lấy danh sách công việc (có phân trang)
  Future<List<JobModel>> getJobs({int page = 0, int size = 10}) async {
    final url = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.jobsEndpoint}?page=$page&size=$size",
    );
    final response = await client.get(url);

    if (response.statusCode == 200) {
      final List<dynamic> jsonData = jsonDecode(response.body)['content'] ?? [];
      return jsonData.map((e) => JobModel.fromJson(e)).toList();
    } else {
      throw Exception("Failed to load jobs");
    }
  }

  // Lấy danh sách công việc theo recruiter
  Future<List<JobModel>> getJobsByRecruiter(int recruiterUserId) async {
    final url = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.getJobsByRecruiter(recruiterUserId)}",
    );
    final response = await client.get(url, headers: await _authHeaders());
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      final List<dynamic> list =
          decoded is List ? decoded : (decoded['content'] ?? []);
      return list.map((e) => JobModel.fromJson(e)).toList();
    } else {
      throw Exception(
          "Failed to load recruiter's jobs: ${response.statusCode}");
    }
  }

  // Xóa công việc (cần quyền)
  Future<void> deleteJob(int id) async {
    final url = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.deleteJobEndpoint(id)}",
    );
    final res = await http.delete(url, headers: await _authHeaders());
    if (res.statusCode != 200 && res.statusCode != 204) {
      throw Exception(
          "Xóa công việc thất bại: ${res.statusCode} - ${res.body}");
    }
  }

  // Tìm kiếm + lọc công việc
  Future<Map<String, dynamic>> searchJobs({
    String? title,
    int? levelId,
    int? jobTypeId,
    int? industryId,
    int? locationId,
    int? salary,
    bool? isFeatured,
    String? sortBy, // e.g. 'viewsCount' | 'applicationCount'
    String? sortDirection, // 'asc' | 'desc'
    int page = 0,
    int size = 10,
  }) async {
    final Map<String, String> queryParams = {
      'page': page.toString(),
      'size': size.toString(),
    };
    if (title != null && title.isNotEmpty) queryParams['title'] = title;
    if (levelId != null) queryParams['levelId'] = levelId.toString();
    if (jobTypeId != null) queryParams['jobTypeId'] = jobTypeId.toString();
    if (industryId != null) queryParams['industryId'] = industryId.toString();
    if (locationId != null) queryParams['locationId'] = locationId.toString();
    if (salary != null) queryParams['salary'] = salary.toString();
    if (isFeatured == true) queryParams['isFeatured'] = 'true';
    if (sortBy != null && sortBy.isNotEmpty) queryParams['sortBy'] = sortBy;
    if (sortDirection != null && sortDirection.isNotEmpty) {
      queryParams['sortDirection'] = sortDirection;
    }

    final uri = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.jobSerchEndpoint}",
    ).replace(queryParameters: queryParams);

    final response = await client.get(uri);

    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      final List<dynamic> jsonData = decoded['content'] ?? [];
      final jobs = jsonData.map((e) => JobModel.fromJson(e)).toList();
      final totalPages = decoded['totalPages'] ?? 1;
      return {
        'jobs': jobs,
        'totalPages': totalPages,
      };
    } else {
      throw Exception("Failed to search jobs");
    }
  }

  // Lấy chi tiết công việc
  Future<JobModel> getJobDetails(int id) async {
    final url = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.jobDetailsEndpoint(id)}",
    );
    final response = await client.get(url);

    if (response.statusCode == 200) {
      return JobModel.fromJson(jsonDecode(response.body));
    } else {
      throw Exception("Failed to load job details");
    }
  }

  // Lấy chi tiết công việc (raw JSON) để giữ nguyên cấu trúc như web, bao gồm nested 'user'
  Future<Map<String, dynamic>> getJobDetailsRaw(int id) async {
    final url = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.jobDetailsEndpoint(id)}",
    );
    final response = await client.get(url);
    if (response.statusCode == 200) {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) return decoded;
      throw Exception("Unexpected job details format");
    } else {
      throw Exception("Failed to load job details");
    }
  }

  // Tăng lượt xem cho công việc (fire-and-forget)
  Future<void> incrementJobViews(int id) async {
    final url = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.incrementViewCountJobEndpoint(id)}",
    );
    try {
      final res = await client.patch(url);
      // Accept 200 or 204 as success; ignore other statuses silently
      if (res.statusCode == 200 || res.statusCode == 204) {
        return;
      }
    } catch (_) {
      // ignore errors to avoid impacting UX
    }
  }

  // Tăng lượt ứng tuyển cho công việc (fire-and-forget)
  Future<void> incrementJobApplications(int id) async {
    final url = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.incrementViewCountApplicationEndpoint(id)}",
    );
    try {
      final res = await client.patch(url);
      // Accept 200 or 204 as success; ignore other statuses silently
      if (res.statusCode == 200 || res.statusCode == 204) {
        return;
      }
    } catch (_) {
      // ignore errors to avoid impacting UX
    }
  }

  // Lấy công việc phù hợp theo level của user (có phân trang) và totalPages
  Future<Map<String, dynamic>> getSuitableJobs({
    required String levelId,
    int page = 0,
    int size = 10,
  }) async {
    final uri = Uri.parse(
      "${AppConfig.apiBaseUrl}${AppConfig.jobSuitableEndpoint}/$levelId",
    ).replace(queryParameters: {
      "page": page.toString(),
      "size": size.toString(),
    });

    final res = await client.get(uri);
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      final List<dynamic> content = data["content"] ?? [];
      final jobs = content.map((e) => JobModel.fromJson(e)).toList();
      final totalPages = data["totalPages"] ?? 1;
      return {
        'jobs': jobs,
        'totalPages': totalPages,
      };
    } else {
      throw Exception("Failed to load suitable jobs");
    }
  }
}
