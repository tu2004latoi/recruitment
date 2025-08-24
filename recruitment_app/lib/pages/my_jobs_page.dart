import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/services/api_user_service.dart';
import 'package:recruitment_app/services/api_job_service.dart';
import 'package:recruitment_app/models/job_model.dart';

class MyJobsPage extends StatefulWidget {
  const MyJobsPage({super.key});

  @override
  State<MyJobsPage> createState() => _MyJobsPageState();
}

class _MyJobsPageState extends State<MyJobsPage> {
  final _jobService = JobService(client: http.Client());
  bool _loading = true;
  List<JobModel> _jobs = [];
  int? _deletingId;

  @override
  void initState() {
    super.initState();
    _fetchJobs();
  }

  Future<void> _fetchJobs() async {
    setState(() => _loading = true);
    try {
      final cu = await ApiUserService.getCurrentUser();
      final recruiterIdRaw = cu['userId'];
      final recruiterId = recruiterIdRaw is int
          ? recruiterIdRaw
          : int.tryParse(recruiterIdRaw?.toString() ?? '');
      if (recruiterId == null)
        throw Exception('Không xác định được người dùng');

      // Gọi duy nhất 1 API để lấy job của recruiter hiện tại (giống web)
      final jobs = await _jobService.getJobsByRecruiter(recruiterId);
      setState(() => _jobs = jobs);
    } catch (e) {
      if (mounted) {
        debugPrint('Lỗi khi tải dữ liệu: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Tải dữ liệu thất bại: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _deleteJob(int jobId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xác nhận'),
        content: const Text('Bạn có chắc chắn muốn xóa công việc này?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.of(ctx).pop(false),
              child: const Text('Hủy')),
          FilledButton(
              onPressed: () => Navigator.of(ctx).pop(true),
              child: const Text('Xóa')),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() => _deletingId = jobId);
    try {
      await _jobService.deleteJob(jobId);
      setState(() => _jobs = _jobs.where((j) => j.jobId != jobId).toList());
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Xóa công việc thành công!')));
      }
    } catch (e) {
      if (mounted) {
        debugPrint('Lỗi khi xóa công việc: $e');
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Xóa công việc thất bại: $e')));
      }
    } finally {
      if (mounted) setState(() => _deletingId = null);
    }
  }

  String _formatDate(DateTime? dt) {
    if (dt == null) return 'N/A';
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
  }

  String _formatSalary(int? salary) {
    if (salary == null) return 'Thỏa thuận';
    return '${salary.toString()} VNĐ';
  }

  Widget _statusBadge(bool isActive, bool isFeatured) {
    if (!isActive) {
      return const _Badge(
          text: 'Không hoạt động',
          bg: Color(0xFFFEE2E2),
          fg: Color(0xFF991B1B));
    }
    if (isFeatured) {
      return const _Badge(
          text: 'Nổi bật', bg: Color(0xFFFDE68A), fg: Color(0xFF92400E));
    }
    return const _Badge(
        text: 'Hoạt động', bg: Color(0xFFD1FAE5), fg: Color(0xFF065F46));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Công việc của tôi')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final created = await Navigator.of(context).pushNamed('/addJob');
          if (created == true) {
            _fetchJobs();
          }
        },
        icon: const Icon(Icons.add),
        label: const Text('Thêm công việc'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchJobs,
              child: _jobs.isEmpty
                  ? ListView(children: const [
                      SizedBox(height: 200),
                      Center(child: Text('Chưa có tin tuyển dụng'))
                    ])
                  : ListView.builder(
                      padding: const EdgeInsets.all(12),
                      itemCount: _jobs.length,
                      itemBuilder: (context, index) {
                        final job = _jobs[index];
                        return Card(
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16)),
                          elevation: 1,
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(job.title,
                                              style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w700)),
                                          const SizedBox(height: 4),
                                          Text('Ngày tạo: ' +
                                              _formatDate(job.createdAt)),
                                          if (job.salary != null) ...[
                                            const SizedBox(height: 2),
                                            Text('Mức lương: ' +
                                                _formatSalary(job.salary)),
                                          ],
                                        ],
                                      ),
                                    ),
                                    _statusBadge(job.isActive, job.isFeatured),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    OutlinedButton.icon(
                                      onPressed: () {
                                        Navigator.of(context).pushNamed(
                                          '/editJob',
                                          arguments: {'jobId': job.jobId},
                                        );
                                      },
                                      icon: const Icon(Icons.edit_outlined),
                                      label: const Text('Sửa'),
                                    ),
                                    const SizedBox(width: 8),
                                    OutlinedButton.icon(
                                      onPressed: _deletingId == job.jobId
                                          ? null
                                          : () => _deleteJob(job.jobId),
                                      icon: const Icon(Icons.delete_outline),
                                      label: Text(_deletingId == job.jobId
                                          ? 'Đang xóa...'
                                          : 'Xóa'),
                                    ),
                                  ],
                                )
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

class _Badge extends StatelessWidget {
  final String text;
  final Color bg;
  final Color fg;
  const _Badge({required this.text, required this.bg, required this.fg});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration:
          BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child:
          Text(text, style: TextStyle(color: fg, fontWeight: FontWeight.w600)),
    );
  }
}
