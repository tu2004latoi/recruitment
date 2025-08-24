import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/pages/login_page.dart';
import 'package:recruitment_app/services/api_favorite_service.dart';
import 'package:recruitment_app/services/api_user_service.dart';
import 'package:recruitment_app/services/api_job_service.dart';
import 'package:recruitment_app/models/job_model.dart';

class FavoritesPage extends StatefulWidget {
  const FavoritesPage({super.key});

  @override
  State<FavoritesPage> createState() => _FavoritesPageState();
}

class _FavoritesPageState extends State<FavoritesPage> {
  bool _isLoading = true;
  bool _isRemoving = false;
  Map<String, dynamic>? _currentUser;
  List<Map<String, dynamic>> _favoriteJobs = [];
  late final JobService _jobService;

  @override
  void initState() {
    super.initState();
    _jobService = JobService(client: http.Client());
    _fetchFavorites();
  }

  Future<void> _fetchFavorites() async {
    setState(() => _isLoading = true);
    try {
      final user = await ApiUserService.getCurrentUser();
      setState(() => _currentUser = user);

      final role = (user['role'] ?? '').toString().toUpperCase();
      if (role != 'APPLICANT') {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Chỉ ứng viên mới có thể xem job yêu thích!')),
        );
        Navigator.of(context).maybePop();
        return;
      }

      final favs = await ApiFavoriteService.getMyFavorites();
      // hydrate with job details
      final hydrated = <Map<String, dynamic>>[];
      for (final f in favs) {
        final jobIdRaw = f['jobId'] ?? f['job']?['jobId'];
        final jobId = jobIdRaw is int ? jobIdRaw : int.tryParse(jobIdRaw?.toString() ?? '');
        JobModel? job;
        if (jobId != null) {
          try {
            job = await _jobService.getJobDetails(jobId);
          } catch (_) {
            job = null; // job may be deleted
          }
        }
        hydrated.add({
          ...f,
          'job': job,
        });
      }
      if (!mounted) return;
      setState(() => _favoriteJobs = hydrated);
    } catch (e) {
      if (!mounted) return;
      final msg = e.toString();
      if (msg.contains('401')) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Vui lòng đăng nhập để xem job yêu thích!')),
        );
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const LoginPage()),
          (route) => false,
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không thể tải danh sách job yêu thích!')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _formatDate(DateTime? dt) {
    if (dt == null) return 'N/A';
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
  }

  String _formatSalary(int? salary) {
    if (salary == null) return 'Thỏa thuận';
    return '${_formatNumber(salary)} VNĐ';
  }

  String _formatNumber(int number) {
    final str = number.toString();
    final buf = StringBuffer();
    for (int i = 0; i < str.length; i++) {
      final idxFromEnd = str.length - i;
      buf.write(str[i]);
      if (idxFromEnd > 1 && idxFromEnd % 3 == 1) buf.write(',');
    }
    return buf.toString();
  }

  String _timeAgo(DateTime? dt) {
    if (dt == null) return '';
    final now = DateTime.now();
    final diff = now.difference(dt).inDays.abs();
    if (diff == 0) return 'Hôm nay';
    if (diff <= 7) return '$diff ngày trước';
    if (diff <= 30) return '${(diff / 7).floor()} tuần trước';
    return '${(diff / 30).floor()} tháng trước';
  }

  Future<void> _removeFavorite(Map<String, dynamic> fav) async {
    final favIdRaw = fav['favoriteJobId'] ?? fav['id'];
    final favId = favIdRaw is int ? favIdRaw : int.tryParse(favIdRaw?.toString() ?? '');
    if (favId == null) return;

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xác nhận'),
        content: const Text('Bạn có chắc muốn bỏ lưu công việc này?'),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Hủy')),
          FilledButton(onPressed: () => Navigator.of(ctx).pop(true), child: const Text('Bỏ lưu')),
        ],
      ),
    );
    if (ok != true) return;

    setState(() => _isRemoving = true);
    try {
      await ApiFavoriteService.deleteFavorite(favId);
      if (!mounted) return;
      setState(() {
        _favoriteJobs.removeWhere((e) {
          final idRaw = e['favoriteJobId'] ?? e['id'];
          final id = idRaw is int ? idRaw : int.tryParse(idRaw?.toString() ?? '');
          return id == favId;
        });
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Đã bỏ lưu công việc!')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Có lỗi xảy ra khi bỏ lưu công việc!')),
      );
    } finally {
      if (mounted) setState(() => _isRemoving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Công việc yêu thích'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _favoriteJobs.isEmpty
              ? const Center(child: Text('Chưa có công việc yêu thích nào.'))
              : RefreshIndicator(
                  onRefresh: _fetchFavorites,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(12),
                    itemCount: _favoriteJobs.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final fav = _favoriteJobs[index];
                      final job = fav['job'] as JobModel?;

                      return Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.blueGrey.shade50),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: job == null
                                ? null
                                : () {
                                    Navigator.of(context).pushNamed(
                                      '/jobDetail',
                                      arguments: job.jobId,
                                    );
                                  },
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(
                                      color: Colors.indigo.shade50,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Icon(Icons.work_outline, color: Colors.indigo),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          job?.title ?? 'Công việc không khả dụng',
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Wrap(
                                          spacing: 8,
                                          runSpacing: 6,
                                          children: [
                                            if (job != null)
                                              _chip(Icons.place, job.locationName ?? 'Không rõ'),
                                            if (job != null)
                                              _chip(Icons.category, job.jobTypeName ?? 'Không rõ'),
                                            if (job != null)
                                              _chip(Icons.attach_money, _formatSalary(job.salary)),
                                          ],
                                        ),
                                        const SizedBox(height: 8),
                                        if (job != null)
                                          Row(
                                            children: [
                                              const Icon(Icons.schedule, size: 16, color: Colors.grey),
                                              const SizedBox(width: 4),
                                              Expanded(
                                                child: Text(
                                                  _timeAgo(job.createdAt) +
                                                      (job.expiredAt != null
                                                          ? ' • Hết hạn: ${_formatDate(job.expiredAt)}'
                                                          : ''),
                                                  style: const TextStyle(color: Colors.black54),
                                                  maxLines: 1,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              )
                                            ],
                                          ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.favorite, color: Colors.redAccent),
                                        tooltip: 'Bỏ lưu',
                                        onPressed: _isRemoving ? null : () => _removeFavorite(fav),
                                      ),
                                    ],
                                  )
                                ],
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Widget _chip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.black54),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(fontSize: 12, color: Colors.black87),
          ),
        ],
      ),
    );
  }
}
