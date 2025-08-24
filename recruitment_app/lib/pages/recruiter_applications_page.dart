import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/services/api_user_service.dart';
import 'package:recruitment_app/services/api_application_service.dart';
import 'package:recruitment_app/services/api_location_service.dart';
import 'package:recruitment_app/services/api_interview_service.dart';
import 'package:recruitment_app/services/api_job_service.dart';
import 'package:intl/intl.dart';
import 'package:recruitment_app/services/api_notification_service.dart';

class RecruiterApplicationsPage extends StatefulWidget {
  const RecruiterApplicationsPage({super.key});

  @override
  State<RecruiterApplicationsPage> createState() => _RecruiterApplicationsPageState();
}

class _RecruiterApplicationsPageState extends State<RecruiterApplicationsPage> {
  bool _loading = true;
  List<Map<String, dynamic>> _applications = [];
  int? _processingId;
  final _jobService = JobService(client: http.Client());

  @override
  void initState() {
    super.initState();
    _fetchApplications();
  }

  Future<void> _fetchApplications() async {
    setState(() => _loading = true);
    try {
      final cu = await ApiUserService.getCurrentUser();
      final uidRaw = cu['userId'];
      final uid = uidRaw is int ? uidRaw : int.tryParse(uidRaw?.toString() ?? '');
      if (uid == null) throw Exception('Không xác định được người dùng.');

      final rawApps = await ApiApplicationService.getApplicationsByRecruiter(uid);

      final enriched = <Map<String, dynamic>>[];
      for (final a in rawApps) {
        Map<String, dynamic>? userDetails;
        Map<String, dynamic>? jobDetails;
        try {
          final uidAp = a['userId'] is int ? a['userId'] : int.tryParse(a['userId'].toString());
          if (uidAp != null) {
            userDetails = await ApiUserService.getPublicUserDetails(uidAp);
          }
        } catch (_) {}
        try {
          final jid = a['jobId'] is int ? a['jobId'] : int.tryParse(a['jobId'].toString());
          if (jid != null) {
            final job = await _jobService.getJobDetails(jid);
            jobDetails = job.toJson();
          }
        } catch (_) {}
        enriched.add({
          ...a,
          'userDetails': userDetails,
          'jobDetails': jobDetails,
        });
      }

      setState(() => _applications = enriched);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Tải danh sách thất bại: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _formatDate(String? date) {
    if (date == null || date.isEmpty) return 'Không rõ';
    try {
      final d = DateTime.tryParse(date);
      if (d == null) return date;
      return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
    } catch (_) {
      return date;
    }
  }

  String _formatSalary(dynamic salary) {
    if (salary == null) return 'Thỏa thuận';
    try {
      final n = salary is num ? salary : num.parse(salary.toString());
      return '${n.toStringAsFixed(0)} VND';
    } catch (_) {
      return 'Thỏa thuận';
    }
  }

  Widget _statusBadge(String? status) {
    final s = (status ?? 'PENDING').toUpperCase();
    Color bg;
    Color fg;
    String text;
    switch (s) {
      case 'ACCEPTED':
        bg = const Color(0xFFD1FAE5); // green-100
        fg = const Color(0xFF065F46); // green-800
        text = 'Đã duyệt';
        break;
      case 'REJECTED':
        bg = const Color(0xFFFEE2E2); // red-100
        fg = const Color(0xFF991B1B); // red-800
        text = 'Từ chối';
        break;
      case 'INTERVIEW':
        bg = const Color(0xFFDBEAFE); // blue-100
        fg = const Color(0xFF1E40AF); // blue-800
        text = 'Phỏng vấn';
        break;
      default:
        bg = const Color(0xFFFDE68A); // yellow-300
        fg = const Color(0xFF92400E); // yellow-800
        text = 'Chờ duyệt';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Text(text, style: TextStyle(color: fg, fontWeight: FontWeight.w600)),
    );
  }

  Future<void> _accept(Map<String, dynamic> app) async {
    final isRejected = (app['status']?.toString().toUpperCase() == 'REJECTED');
    final confirm = await _confirmDialog(isRejected ? 'Xác nhận duyệt lại đơn đã từ chối?' : 'Xác nhận duyệt đơn này?');
    if (confirm != true) return;
    setState(() => _processingId = app['applicationId']);
    try {
      final id = app['applicationId'] is int ? app['applicationId'] : int.tryParse(app['applicationId'].toString()) ?? 0;
      await ApiApplicationService.acceptApplication(id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(isRejected ? 'Đã duyệt lại thành công' : 'Duyệt thành công')));
      }
      await _fetchApplications();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Lỗi khi duyệt: $e')));
      }
    } finally {
      if (mounted) setState(() => _processingId = null);
    }
  }

  Future<void> _reject(Map<String, dynamic> app) async {
    final isAccepted = (app['status']?.toString().toUpperCase() == 'ACCEPTED');
    final confirm = await _confirmDialog(isAccepted ? 'Xác nhận từ chối lại đơn đã duyệt?' : 'Xác nhận từ chối đơn này?');
    if (confirm != true) return;
    setState(() => _processingId = app['applicationId']);
    try {
      final id = app['applicationId'] is int ? app['applicationId'] : int.tryParse(app['applicationId'].toString()) ?? 0;
      await ApiApplicationService.rejectApplication(id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(isAccepted ? 'Đã từ chối lại thành công' : 'Từ chối thành công')));
      }
      await _fetchApplications();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Lỗi khi từ chối: $e')));
      }
    } finally {
      if (mounted) setState(() => _processingId = null);
    }
  }

  Future<void> _scheduleInterview(Map<String, dynamic> app) async {
    final jobId = app['jobId'] is int ? app['jobId'] : int.tryParse(app['jobId'].toString());
    final userId = app['userId'] is int ? app['userId'] : int.tryParse(app['userId'].toString());
    final applicationId = app['applicationId'] is int ? app['applicationId'] : int.tryParse(app['applicationId'].toString());
    if (jobId == null || userId == null || applicationId == null) return;

    final res = await showDialog<_InterviewPayload>(
      context: context,
      builder: (_) => _InterviewDialog(),
    );
    if (res == null) return;
    setState(() => _processingId = applicationId);
    try {
      final loc = await ApiLocationService.createLocation({
        'province': res.province,
        'district': res.district,
        'address': res.address,
        'notes': res.notes,
      });
      final locationId = loc['locationId'] ?? loc['id'];
      await ApiInterviewService.addInterview({
        'userId': userId,
        'jobId': jobId,
        'locationId': locationId,
        'scheduledAt': res.scheduledAt,
        'notes': res.notes,
        'status': 'SCHEDULED',
      });

      try {
        final dt = DateTime.tryParse(res.scheduledAt);
        final formatted = (dt != null) ? DateFormat('dd/MM/yyyy HH:mm').format(dt) : res.scheduledAt;
        await ApiNotificationService.sendUserNotification(
          title: 'Bạn đã nhận được lịch phỏng vấn từ nhà tuyển dụng',
          body: 'Phỏng vấn đã được đặt vào ngày $formatted, vui lòng vào hệ thống để xem chi tiết',
          userId: userId,
        );
      } catch (_) {
        // ignore notification errors to not block flow
      }
      await ApiApplicationService.markSentInterview(applicationId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Gửi lịch phỏng vấn thành công')));
      }
      await _fetchApplications();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gửi lịch phỏng vấn thất bại: $e')));
      }
    } finally {
      if (mounted) setState(() => _processingId = null);
    }
  }

  Future<bool?> _confirmDialog(String message) async {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xác nhận'),
        content: Text(message),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Hủy')),
          FilledButton(onPressed: () => Navigator.of(ctx).pop(true), child: const Text('Đồng ý')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Quản lý đơn ứng tuyển')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Quản lý đơn ứng tuyển')),
      body: RefreshIndicator(
        onRefresh: _fetchApplications,
        child: ListView.builder(
          padding: const EdgeInsets.all(12),
          itemCount: _applications.length,
          itemBuilder: (context, index) {
            final a = _applications[index];
            final user = a['userDetails'] as Map<String, dynamic>?;
            final job = a['jobDetails'] as Map<String, dynamic>?;
            return Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 1,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            job?['title']?.toString() ?? 'Công việc',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                          ),
                        ),
                        _statusBadge(a['status']?.toString()),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text('Ứng viên: ' + ((user != null) ? '${user['firstName'] ?? ''} ${user['lastName'] ?? ''}'.trim() : 'Không rõ')),
                    const SizedBox(height: 4),
                    Text('Ngày ứng tuyển: ' + _formatDate(a['createdAt']?.toString())),
                    if (job != null && job['salary'] != null) ...[
                      const SizedBox(height: 4),
                      Text('Mức lương: ' + _formatSalary(job['salary'])),
                    ],
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: FilledButton.icon(
                            onPressed: _processingId == a['applicationId'] ? null : () => _accept(a),
                            icon: const Icon(Icons.check_circle_outline),
                            label: Text(_processingId == a['applicationId'] ? 'Đang xử lý...' : 'Duyệt'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _processingId == a['applicationId'] ? null : () => _reject(a),
                            icon: const Icon(Icons.cancel_outlined),
                            label: const Text('Từ chối'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: TextButton.icon(
                        onPressed: _processingId == a['applicationId'] ? null : () => _scheduleInterview(a),
                        icon: const Icon(Icons.event_note),
                        label: const Text('Gửi lịch phỏng vấn'),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _InterviewPayload {
  final String province;
  final String district;
  final String address;
  final String notes;
  final String scheduledAt; // ISO string
  _InterviewPayload({
    required this.province,
    required this.district,
    required this.address,
    required this.notes,
    required this.scheduledAt,
  });
}

class _InterviewDialog extends StatefulWidget {
  @override
  State<_InterviewDialog> createState() => _InterviewDialogState();
}

class _InterviewDialogState extends State<_InterviewDialog> {
  final _province = TextEditingController();
  final _district = TextEditingController();
  final _address = TextEditingController();
  final _notes = TextEditingController();
  DateTime? _scheduledAt;
  bool _submitting = false;

  @override
  void dispose() {
    _province.dispose();
    _district.dispose();
    _address.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _pickDateTime() async {
    final now = DateTime.now();
    final date = await showDatePicker(
      context: context,
      initialDate: now.add(const Duration(days: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 365)),
    );
    if (date == null) return;
    final time = await showTimePicker(context: context, initialTime: TimeOfDay(hour: 9, minute: 0));
    if (time == null) return;
    setState(() {
      _scheduledAt = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    });
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Gửi lịch phỏng vấn'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: _province, decoration: const InputDecoration(labelText: 'Tỉnh/Thành phố'),),
            TextField(controller: _district, decoration: const InputDecoration(labelText: 'Quận/Huyện'),),
            TextField(controller: _address, decoration: const InputDecoration(labelText: 'Địa chỉ'),),
            TextField(controller: _notes, decoration: const InputDecoration(labelText: 'Ghi chú'),),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(child: Text(_scheduledAt == null ? 'Chưa chọn thời gian' : _scheduledAt.toString())),
                TextButton.icon(onPressed: _pickDateTime, icon: const Icon(Icons.schedule), label: const Text('Chọn thời gian')),
              ],
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: _submitting ? null : () => Navigator.of(context).pop(), child: const Text('Hủy')),
        FilledButton(
          onPressed: _submitting
              ? null
              : () async {
                  if (_province.text.isEmpty || _district.text.isEmpty || _address.text.isEmpty || _scheduledAt == null) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Vui lòng nhập đủ thông tin')));
                    return;
                  }
                  setState(() => _submitting = true);
                  try {
                    final payload = _InterviewPayload(
                      province: _province.text,
                      district: _district.text,
                      address: _address.text,
                      notes: _notes.text,
                      scheduledAt: _scheduledAt!.toIso8601String(),
                    );
                    if (context.mounted) Navigator.of(context).pop(payload);
                  } finally {
                    if (mounted) setState(() => _submitting = false);
                  }
                },
          child: const Text('Gửi'),
        )
      ],
    );
  }
}
