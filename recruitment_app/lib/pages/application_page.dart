import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/services/api_application_service.dart';
import 'package:recruitment_app/services/api_user_service.dart';
import 'package:recruitment_app/services/api_job_service.dart';
import 'package:recruitment_app/services/api_recruiter_service.dart';
// import 'package:recruitment_app/models/job_model.dart'; // no longer needed here

class ApplicationPage extends StatefulWidget {
  const ApplicationPage({super.key});

  @override
  State<ApplicationPage> createState() => _ApplicationPageState();
}

class _ApplicationPageState extends State<ApplicationPage> {
  final jobService = JobService(client: http.Client());
  bool isLoading = true;
  bool isError = false;
  List<Map<String, dynamic>> applications = [];
  Map<String, dynamic>? selectedApplication;
  bool showDetailModal = false;
  int? deletingId;

  @override
  void initState() {
    super.initState();
    _guardAndFetch();
  }

  Future<void> _guardAndFetch() async {
    setState(() {
      isLoading = true;
      isError = false;
    });
    try {
      await ApiUserService.getCurrentUser(); // guard đăng nhập
      await _fetchApplications();
    } catch (_) {
      setState(() => isError = true);
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  Future<void> _fetchApplications() async {
    final raw = await ApiApplicationService.getMyApplications();
    // Bổ sung chi tiết job cho từng application (logic như web)
    final Map<int, Map<String, dynamic>> recruiterCache = {};
    final detailed = await Future.wait(raw.map((app) async {
      try {
        final jobId = app['jobId'] ?? app['job']?['jobId'];
        Map<String, dynamic>? jobJson;
        if (jobId is int) {
          // Use raw to keep nested user for recruiter enrichment
          jobJson = await jobService.getJobDetailsRaw(jobId);
        }
        // Giống web: lấy recruiter theo nested user.userId
        if (jobJson != null) {
          final userId = jobJson['user']?['userId'];
          if (userId is int) {
            try {
              Map<String, dynamic>? recruiter = recruiterCache[userId];
              recruiter ??= await ApiRecruiterService.getRecruiterDetails(userId);
              recruiterCache[userId] = recruiter;
              jobJson = {
                ...jobJson,
                'recruiter': recruiter,
              };
            } catch (_) {
              // ignore recruiter fetch error
            }
          }
        }
        return {
          ...app,
          if (jobJson != null) 'job': jobJson,
        };
      } catch (_) {
        return app;
      }
    }));
    if (!mounted) return;
    setState(() => applications = detailed);
  }

  Future<void> _onRefresh() => _guardAndFetch();

  String _formatDate(String? dt) {
    if (dt == null || dt.isEmpty) return 'N/A';
    try {
      final d = DateTime.parse(dt);
      return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';
    } catch (_) {
      return dt;
    }
  }

  String _companyNameFromJob(Map<String, dynamic>? job) {
    if (job == null) return 'Công ty không xác định';
    final recruiter = job['recruiter'];
    Map<String, dynamic>? rMap;
    if (recruiter is Map<String, dynamic>) {
      // Some APIs wrap payloads, e.g., { data: { companyName: ... } }
      if (recruiter['data'] is Map<String, dynamic>) {
        rMap = recruiter['data'] as Map<String, dynamic>;
      } else {
        rMap = recruiter;
      }
    }
    String? _pickCompany(Map<String, dynamic>? m) {
      if (m == null) return null;
      final keys = ['companyName', 'company', 'company_name'];
      for (final k in keys) {
        final v = m[k]?.toString().trim();
        if (v != null && v.isNotEmpty) return v;
      }
      return null;
    }

    final candidates = <dynamic>[
      _pickCompany(rMap),
      // Fallbacks from job payload
      job['companyName'],
      job['recruiterName'],
      (job['user'] is Map<String, dynamic>) ? job['user']['fullName'] : null,
    ];
    for (final c in candidates) {
      final s = c?.toString().trim();
      if (s != null && s.isNotEmpty) return s;
    }
    return 'Công ty không xác định';
  }

  String _formatSalary(dynamic salary) {
    if (salary == null) return 'Thỏa thuận';
    try {
      final num s = (salary is num) ? salary : num.parse(salary.toString());
      final str = s.toStringAsFixed(0).replaceAllMapped(RegExp(r"\B(?=(\d{3})+(?!\d))"), (m) => '.');
      return '$str VNĐ';
    } catch (_) {
      return salary.toString();
    }
  }

  Widget _statusBadge(String? status) {
    final s = (status ?? 'PENDING').toUpperCase();
    Color bg, fg;
    IconData icon;
    String text;
    switch (s) {
      case 'ACCEPTED':
        bg = const Color(0xFFD1FAE5); fg = const Color(0xFF065F46); icon = Icons.check_circle; text = 'Đã chấp nhận';
        break;
      case 'REJECTED':
        bg = const Color(0xFFFEE2E2); fg = const Color(0xFF991B1B); icon = Icons.cancel; text = 'Đã từ chối';
        break;
      case 'INTERVIEW':
        bg = const Color(0xFFDBEAFE); fg = const Color(0xFF1E3A8A); icon = Icons.person; text = 'Phỏng vấn';
        break;
      default:
        bg = const Color(0xFFFDE68A); fg = const Color(0xFF92400E); icon = Icons.access_time; text = 'Chờ xử lý';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 16, color: fg),
        const SizedBox(width: 6),
        Text(text, style: TextStyle(color: fg, fontWeight: FontWeight.w600)),
      ]),
    );
  }

  Future<void> _handleViewDetail(Map<String, dynamic> app) async {
    Map<String, dynamic> toShow = Map<String, dynamic>.from(app);
    try {
      final jobId = app['jobId'] ?? app['job']?['jobId'];
      if (jobId is int) {
        // Use raw to keep nested user for recruiter enrichment
        Map<String, dynamic> jobJson = await jobService.getJobDetailsRaw(jobId);
        // Giống web: lấy recruiter theo nested user.userId
        final userId = jobJson['user']?['userId'];
        if (userId is int) {
          try {
            final recruiter = await ApiRecruiterService.getRecruiterDetails(userId);
            jobJson = {
              ...jobJson,
              'recruiter': recruiter,
            };
          } catch (_) {
            // ignore recruiter fetch error
          }
        }
        toShow['job'] = jobJson;
      }
    } catch (_) {}
    if (!mounted) return;
    setState(() {
      selectedApplication = toShow;
      showDetailModal = true;
    });
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        final app = selectedApplication ?? {};
        final job = app['job'] as Map<String, dynamic>?;
        final title = job?['title'] ?? 'Chi tiết đơn ứng tuyển';
        final companyName = _companyNameFromJob(job);
        final jobLocation = job?['location'];
        String locationText = '';
        if (jobLocation is Map<String, dynamic>) {
          final province = jobLocation['province'];
          final district = jobLocation['district'];
          if (province != null && district != null) {
            locationText = '$province, $district';
          } else {
            locationText = (jobLocation['name'] ?? jobLocation['address'] ?? '').toString();
          }
        } else if (jobLocation != null) {
          locationText = jobLocation.toString();
        }
        final salary = job?['salary'];
        final appliedAt = (app['appliedAt'] ?? '').toString();
        final status = (app['status'] ?? 'PENDING').toString();
        final appId = app['applicationId'];
        final coverLetter = app['coverLetter']?.toString();
        final cv = app['cv']?.toString();

        return SafeArea(
          child: Padding(
            padding: EdgeInsets.only(
              left: 16,
              right: 16,
              top: 16,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
            ),
            child: SingleChildScrollView(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF059669)]),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.description_outlined, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 6),
                        _statusBadge(status),
                      ]),
                    ),
                    IconButton(onPressed: () => Navigator.of(ctx).pop(), icon: const Icon(Icons.close))
                  ],
                ),
                const SizedBox(height: 16),
                // Job Information
                Container(
                  decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(10)),
                  padding: const EdgeInsets.all(12),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Thông tin công việc', style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Wrap(spacing: 16, runSpacing: 10, children: [
                      Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.work_outline, size: 18, color: Colors.black54),
                        const SizedBox(width: 6),
                        Text('Vị trí: ${job?['title'] ?? '-'}'),
                      ]),
                      Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.apartment, size: 18, color: Colors.black54),
                        const SizedBox(width: 6),
                        Text('Công ty: $companyName'),
                      ]),
                      if (locationText.isNotEmpty)
                        Row(mainAxisSize: MainAxisSize.min, children: [
                          const Icon(Icons.place_outlined, size: 18, color: Colors.black54),
                          const SizedBox(width: 6),
                          Text('Địa điểm: $locationText'),
                        ]),
                      Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.attach_money, size: 18, color: Colors.black54),
                        const SizedBox(width: 6),
                        Text('Lương: ${_formatSalary(salary)}'),
                      ]),
                    ]),
                  ]),
                ),
                const SizedBox(height: 12),
                // Application Information
                Container(
                  decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(10)),
                  padding: const EdgeInsets.all(12),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Thông tin đơn ứng tuyển', style: TextStyle(fontWeight: FontWeight.w600)),
                    const SizedBox(height: 8),
                    Wrap(spacing: 16, runSpacing: 10, children: [
                      Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.tag, size: 18, color: Colors.black54),
                        const SizedBox(width: 6),
                        Text('ID đơn: #${appId ?? '-'}'),
                      ]),
                      Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.calendar_today, size: 18, color: Colors.black54),
                        const SizedBox(width: 6),
                        Text('Ngày ứng tuyển: ${_formatDate(appliedAt)}'),
                      ]),
                      Row(mainAxisSize: MainAxisSize.min, children: [
                        const Icon(Icons.info_outline, size: 18, color: Colors.black54),
                        const SizedBox(width: 6),
                        _statusBadge(status),
                      ]),
                    ]),
                  ]),
                ),
                if (coverLetter != null && coverLetter.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.all(12),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Thư xin việc', style: TextStyle(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Text(coverLetter),
                    ]),
                  ),
                ],
                if (cv != null && cv.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.all(12),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('CV/Resume', style: TextStyle(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Text(cv, style: const TextStyle(color: Colors.blue)),
                    ]),
                  ),
                ],
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => Navigator.of(ctx).pop(),
                    child: const Text('Đóng'),
                  ),
                ),
              ]),
            ),
          ),
        );
      },
    );
    if (!mounted) return;
    setState(() {
      showDetailModal = false;
      selectedApplication = null;
    });
  }

  Future<void> _handleDelete(Map<String, dynamic> app) async {
    if ((app['status'] ?? '').toString().toUpperCase() == 'ACCEPTED') {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đơn ứng tuyển đã được chấp nhận và không thể xóa.')));
      return;
    }
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xác nhận'),
        content: const Text('Bạn có chắc chắn muốn xóa đơn ứng tuyển này?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Hủy')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Xóa')),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() => deletingId = app['applicationId'] as int?);
    try {
      final id = app['applicationId'];
      if (id is int) {
        await ApiApplicationService.deleteApplication(id);
        if (!mounted) return;
        setState(() {
          applications = applications.where((a) => a['applicationId'] != id).toList();
        });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đã xóa đơn ứng tuyển thành công!')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Xóa đơn ứng tuyển thất bại: $e')));
    } finally {
      if (mounted) setState(() => deletingId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Công việc đã ứng tuyển')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }
    if (isError) {
      return Scaffold(
        appBar: AppBar(title: const Text('Công việc đã ứng tuyển')),
        body: Center(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Text('Không thể tải danh sách đơn ứng tuyển'),
            const SizedBox(height: 8),
            ElevatedButton(onPressed: _guardAndFetch, child: const Text('Thử lại')),
          ]),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Công việc đã ứng tuyển')),
      body: RefreshIndicator(
        onRefresh: _onRefresh,
        child: applications.isEmpty
            ? ListView(children: const [
                SizedBox(height: 80),
                Center(child: Text('Chưa có đơn ứng tuyển nào')),
              ])
            : ListView.separated(
                padding: const EdgeInsets.all(12),
                itemCount: applications.length,
                separatorBuilder: (_, __) => const SizedBox(height: 10),
                itemBuilder: (ctx, i) {
                  final app = applications[i];
                  final job = app['job'] as Map<String, dynamic>?;
                  final title = job?['title'] ?? app['jobTitle'] ?? 'Không rõ';
                  final appliedAt = (app['appliedAt'] ?? '').toString();
                  final status = (app['status'] ?? 'PENDING').toString().toUpperCase();
                  final appId = app['applicationId'] as int?;
                  final companyName = _companyNameFromJob(job);
                  final jobLocation = job?['location'];
                  String locationText = '';
                  if (jobLocation is Map<String, dynamic>) {
                    final province = jobLocation['province'];
                    final district = jobLocation['district'];
                    if (province != null && district != null) {
                      locationText = '$province, $district';
                    } else {
                      locationText = (jobLocation['name'] ?? jobLocation['address'] ?? '').toString();
                    }
                  } else if (jobLocation != null) {
                    locationText = jobLocation.toString();
                  }
                  final salary = job?['salary'];
                  final coverLetter = app['coverLetter']?.toString();
                  final cv = app['cv']?.toString();

                  return Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Container(
                                      width: 44,
                                      height: 44,
                                      decoration: BoxDecoration(
                                        gradient: const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF4F46E5)]),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: const Icon(Icons.work_outline, color: Colors.white),
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(title, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                                          const SizedBox(height: 4),
                                          Row(children: [
                                            const Icon(Icons.apartment, size: 16, color: Colors.blue),
                                            const SizedBox(width: 6),
                                            Expanded(
                                              child: Text(
                                                companyName,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ]),
                                          if (locationText.isNotEmpty)
                                            Padding(
                                              padding: const EdgeInsets.only(top: 4),
                                              child: Row(children: [
                                                const Icon(Icons.place_outlined, size: 16, color: Colors.redAccent),
                                                const SizedBox(width: 6),
                                                Expanded(
                                                  child: Text(
                                                    locationText,
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ),
                                              ]),
                                            ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Wrap(spacing: 16, runSpacing: 8, children: [
                                  Row(mainAxisSize: MainAxisSize.min, children: [
                                    const Icon(Icons.calendar_month, size: 16, color: Colors.blue),
                                    const SizedBox(width: 6),
                                    Text('Ứng tuyển: ${_formatDate(appliedAt)}'),
                                  ]),
                                  if (salary != null)
                                    Row(mainAxisSize: MainAxisSize.min, children: [
                                      const Icon(Icons.attach_money, size: 16, color: Colors.green),
                                      const SizedBox(width: 6),
                                      Text('Lương: ${_formatSalary(salary)}'),
                                    ]),
                                  Row(mainAxisSize: MainAxisSize.min, children: [
                                    const Icon(Icons.tag, size: 16, color: Colors.purple),
                                    const SizedBox(width: 6),
                                    Text('ID: #${appId ?? '-'}'),
                                  ]),
                                ]),
                                if (coverLetter != null && coverLetter.isNotEmpty) ...[
                                  const SizedBox(height: 10),
                                  Text('Thư xin việc:', style: TextStyle(color: Colors.grey[700], fontWeight: FontWeight.w600)),
                                  const SizedBox(height: 4),
                                  Text(coverLetter, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.black87)),
                                ],
                                if (cv != null && cv.isNotEmpty) ...[
                                  const SizedBox(height: 10),
                                  Row(children: [
                                    const Icon(Icons.description_outlined, size: 16, color: Colors.blue),
                                    const SizedBox(width: 6),
                                    Expanded(child: Text('CV/Resume: $cv', maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.blue))),
                                  ]),
                                ],
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              _statusBadge(status),
                              const SizedBox(height: 8),
                              TextButton.icon(
                                onPressed: () => _handleViewDetail(app),
                                icon: const Icon(Icons.remove_red_eye, size: 18, color: Colors.blue),
                                label: const Text('Xem chi tiết', style: TextStyle(color: Colors.blue)),
                              ),
                              TextButton.icon(
                                onPressed: (status == 'ACCEPTED' || appId == null || deletingId == appId)
                                    ? null
                                    : () => _handleDelete(app),
                                icon: deletingId == appId
                                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                                    : const Icon(Icons.delete_forever, size: 18, color: Colors.red),
                                label: Text(
                                  deletingId == appId ? 'Đang xóa...' : 'Xóa đơn',
                                  style: TextStyle(color: (status == 'ACCEPTED' || appId == null || deletingId == appId) ? Colors.grey : Colors.red),
                                ),
                              ),
                            ],
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