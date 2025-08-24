class JobModel {
  final int jobId;
  final String title;
  final String description;
  final String? locationName;
  final String? levelName;
  final int? salary;
  final int viewsCount;
  final int applicationCount;
  final int quantity;
  final String? jobTypeName;
  final String? industryName;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final DateTime? expiredAt;
  final String status;
  final bool isFeatured;
  final bool isActive;
  final String? recruiterName;
  final int? recruiterUserId;

  JobModel({
    required this.jobId,
    required this.title,
    required this.description,
    this.locationName,
    this.levelName,
    this.salary,
    required this.viewsCount,
    required this.applicationCount,
    required this.quantity,
    this.jobTypeName,
    this.industryName,
    this.createdAt,
    this.updatedAt,
    this.expiredAt,
    required this.status,
    required this.isFeatured,
    required this.isActive,
    this.recruiterName,
    this.recruiterUserId,
  });

  factory JobModel.fromJson(Map<String, dynamic> json) {
    // Build location string from API fields: province, district, address
    String? _buildLocation(Map<String, dynamic>? loc) {
      if (loc == null) return null;
      final address = (loc['address'] ?? '').toString().trim();
      final district = (loc['district'] ?? '').toString().trim();
      final province = (loc['province'] ?? '').toString().trim();
      final parts = <String>[];
      if (address.isNotEmpty) parts.add(address);
      if (district.isNotEmpty) parts.add(district);
      if (province.isNotEmpty) parts.add(province);
      if (parts.isEmpty) return null;
      return parts.join(', ');
    }

    return JobModel(
      jobId: json['jobId'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      locationName: _buildLocation(json['location'] as Map<String, dynamic>?),
      levelName: json['level']?['name'],
      salary: json['salary'],
      viewsCount: json['viewsCount'] ?? 0,
      applicationCount: json['applicationCount'] ?? 0,
      quantity: json['quantity'] ?? 1,
      jobTypeName: json['jobType']?['name'],
      industryName: json['industry']?['name'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : null,
      expiredAt: json['expiredAt'] != null
          ? DateTime.parse(json['expiredAt'])
          : null,
      status: json['status'] ?? 'PENDING',
      isFeatured: json['isFeatured'] ?? false,
      isActive: json['isActive'] ?? true,
      recruiterName: json['user']?['fullName'],
      recruiterUserId: json['user']?['userId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'jobId': jobId,
      'title': title,
      'description': description,
      'locationName': locationName,
      'levelName': levelName,
      'salary': salary,
      'viewsCount': viewsCount,
      'applicationCount': applicationCount,
      'quantity': quantity,
      'jobTypeName': jobTypeName,
      'industryName': industryName,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
      'expiredAt': expiredAt?.toIso8601String(),
      'status': status,
      'isFeatured': isFeatured,
      'isActive': isActive,
      'recruiterName': recruiterName,
      'recruiterUserId': recruiterUserId,
    };
  }
}
