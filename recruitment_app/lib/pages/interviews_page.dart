import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/services/api_interview_service.dart';
import 'package:recruitment_app/services/api_user_service.dart';
import 'package:recruitment_app/services/api_job_service.dart';
import 'package:recruitment_app/services/api_location_service.dart';
import 'package:recruitment_app/models/job_model.dart';

class InterviewsPage extends StatefulWidget {
  const InterviewsPage({super.key});

  @override
  State<InterviewsPage> createState() => _InterviewsPageState();
}

class _InterviewsPageState extends State<InterviewsPage> {
  final jobService = JobService(client: http.Client());
  bool isLoading = true;
  String? error;
  List<Map<String, dynamic>> interviews = [];
  int? deletingId;

  @override
  void initState() {
    super.initState();
    _guardAndFetch();
  }

  Future<void> _guardAndFetch() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    try {
      await ApiUserService.getCurrentUser();
      await _fetchInterviews();
    } catch (e) {
      error = "Không thể tải lịch phỏng vấn!";
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  Future<void> _fetchInterviews() async {
    final raw = await ApiInterviewService.getMyInterviews();
    final detailed = await Future.wait(raw.map((iv) async {
      final out = Map<String, dynamic>.from(iv);
      try {
        final jobId = iv['jobId'];
        if (jobId is int) {
          final job = await jobService.getJobDetails(jobId);
          out['job'] = job.toJson();
        }
      } catch (_) {}
      try {
        final locId = iv['locationId'];
        if (locId is int) {
          final loc = await ApiLocationService.fetchLocationDetails(locId);
          out['location'] = loc;
        }
      } catch (_) {}
      return out;
    }));
    if (!mounted) return;
    setState(() => interviews = detailed);
  }

  Future<void> _onRefresh() => _guardAndFetch();

  String _formatDateTime(dynamic value) {
    if (value == null) return 'N/A';
    try {
      final dt = DateTime.parse(value.toString());
      final d = '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
      final t = '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
      // Match web display: "HH:mm, DD/MM/YYYY"
      return '$t, $d';
    } catch (_) {
      return value.toString();
    }
  }

  Future<void> _deleteInterview(Map<String, dynamic> iv) async {
    final id = iv['interviewId'] ?? iv['id'];
    if (id is! int) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xác nhận'),
        content: const Text('Bạn có chắc chắn muốn xóa lịch phỏng vấn này?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Xóa')),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() => deletingId = id);
    try {
      await ApiInterviewService.deleteInterview(id);
      if (!mounted) return;
      setState(() {
        interviews = interviews.where((e) => (e['interviewId'] ?? e['id']) != id).toList();
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã xóa lịch phỏng vấn!')));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Xóa thất bại: $e')));
    } finally {
      if (mounted) setState(() => deletingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Lịch phỏng vấn')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    if (error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Lịch phỏng vấn')),
        body: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(error!),
            const SizedBox(height: 8),
            ElevatedButton(onPressed: _guardAndFetch, child: const Text('Thử lại')),
          ]),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Lịch phỏng vấn')),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: interviews.isEmpty
            ? ListView(children: const [
                SizedBox(height: 80),
                Center(child: Text('Bạn chưa có lịch phỏng vấn nào.')),
              ])
            : ListView.separated(
                padding: const EdgeInsets.all(12),
                itemCount: interviews.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (ctx, i) {
                  final iv = interviews[i];
                  final job = iv['job'] as Map<String, dynamic>?;
                  final location = iv['location'] as Map<String, dynamic>?;
                  final title = job?['title'] ?? iv['jobTitle'] ?? 'Phỏng vấn';
                  final when = _formatDateTime(iv['scheduledAt'] ?? iv['interviewTime'] ?? iv['time'] ?? iv['schedule']);
                  String place;
                  if (location != null) {
                    final address = location['address'];
                    final district = location['district'];
                    final province = location['province'];
                    if (address != null && district != null && province != null) {
                      place = '$address, $district, $province';
                    } else {
                      place = location['name'] ?? address ?? 'Địa điểm: cập nhật sau';
                    }
                  } else {
                    place = 'Địa điểm: cập nhật sau';
                  }
                  final notes = iv['notes'] ?? '-';
                  final status = iv['status']?.toString();
                  final id = iv['interviewId'] ?? iv['id'];

                  return Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                                ),
                                const SizedBox(height: 6),
                                Row(children: [
                                  const Icon(Icons.calendar_today, size: 16, color: Colors.indigo),
                                  const SizedBox(width: 6),
                                  Text(when),
                                ]),
                                const SizedBox(height: 6),
                                Row(children: [
                                  const Icon(Icons.place_outlined, size: 16, color: Colors.indigo),
                                  const SizedBox(width: 6),
                                  Expanded(child: Text(place, maxLines: 2, overflow: TextOverflow.ellipsis)),
                                ]),
                                const SizedBox(height: 6),
                                Row(children: [
                                  const Icon(Icons.note_alt_outlined, size: 16, color: Colors.indigo),
                                  const SizedBox(width: 6),
                                  Expanded(child: Text('Ghi chú: $notes', maxLines: 2, overflow: TextOverflow.ellipsis)),
                                ]),
                                if (status != null) ...[
                                  const SizedBox(height: 6),
                                  Row(children: [
                                    const Icon(Icons.checklist_rtl, size: 16, color: Colors.indigo),
                                    const SizedBox(width: 6),
                                    Text('Trạng thái: ', style: const TextStyle(color: Colors.black54)),
                                    Text(status, style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.indigo)),
                                  ]),
                                ],
                              ],
                            ),
                          ),
                          IconButton(
                            tooltip: 'Xóa',
                            onPressed: (deletingId == id) ? null : () => _deleteInterview(iv),
                            icon: deletingId == id
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                                : const Icon(Icons.delete_forever),
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