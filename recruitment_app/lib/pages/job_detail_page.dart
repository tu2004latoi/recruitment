import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/models/job_model.dart';
import 'package:recruitment_app/services/api_job_service.dart';
import 'package:recruitment_app/services/api_favorite_service.dart';
import 'package:recruitment_app/services/api_application_service.dart';
import 'package:recruitment_app/services/api_user_service.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:recruitment_app/configs/app_configs.dart';
import 'package:http_parser/http_parser.dart';
import 'package:recruitment_app/configs/i18n.dart';
import 'package:recruitment_app/configs/locale_controller.dart';

class JobDetailPage extends StatefulWidget {
  const JobDetailPage({super.key});

  @override
  State<JobDetailPage> createState() => _JobDetailPageState();
}

class _JobDetailPageState extends State<JobDetailPage> {
  late final JobService jobService;
  JobModel? job;
  bool isLoading = true;
  bool isError = false;
  bool isFavorited = false;
  int? favoriteId;
  bool hasApplied = false;

  @override
  void initState() {
    super.initState();
    jobService = JobService(client: http.Client());
    // Delay reading arguments until first frame to ensure context is ready
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is int) {
        _fetchDetails(args);
      } else {
        setState(() {
          isError = true;
          isLoading = false;
        });
      }
    });
  }

  void _showApplySheet() {
    final coverCtrl = TextEditingController();
    PlatformFile? picked;
    bool submitting = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(tr('apply'),
                      style: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  TextField(
                    controller: coverCtrl,
                    maxLines: 5,
                    decoration: InputDecoration(
                      labelText: tr('cover_letter'),
                      hintText: tr('cover_letter_hint'),
                      border: const OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          picked?.name ?? tr('no_cv_selected'),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      OutlinedButton.icon(
                        onPressed: submitting
                            ? null
                            : () async {
                                final res = await FilePicker.platform.pickFiles(
                                  type: FileType.custom,
                                  allowedExtensions: ['pdf', 'doc', 'docx'],
                                  withData: true,
                                );
                                if (res != null && res.files.isNotEmpty) {
                                  setSheetState(() {
                                    picked = res.files.first;
                                  });
                                }
                              },
                        icon: const Icon(Icons.attach_file),
                        label: Text(tr('choose_cv')),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      onPressed: submitting
                          ? null
                          : () async {
                              if (job == null) return;
                              setSheetState(() => submitting = true);
                              try {
                                final user =
                                    await ApiUserService.getCurrentUser();
                                final storage = const FlutterSecureStorage();
                                final token = await storage.read(key: 'token');

                                final uri = Uri.parse(
                                    '${AppConfig.apiBaseUrl}${AppConfig.addApplicationEndpoint}');
                                final req = http.MultipartRequest('POST', uri);
                                if (token != null && token.isNotEmpty) {
                                  req.headers['Authorization'] =
                                      'Bearer $token';
                                }

                                // Fields
                                req.fields['userId'] =
                                    (user['userId'] as int).toString();
                                req.fields['jobId'] = job!.jobId.toString();
                                req.fields['appliedAt'] =
                                    _formatLocalDateTime(DateTime.now());
                                req.fields['status'] = 'PENDING';
                                final cover = coverCtrl.text.trim();
                                if (cover.isNotEmpty)
                                  req.fields['coverLetter'] = cover;

                                // File
                                if (picked?.bytes != null &&
                                    picked!.bytes!.isNotEmpty &&
                                    picked!.name.isNotEmpty) {
                                  // Determine MIME type from extension
                                  final ext = (picked!.extension ??
                                          picked!.name.split('.').last)
                                      .toLowerCase();
                                  String mime;
                                  switch (ext) {
                                    case 'pdf':
                                      mime = 'application/pdf';
                                      break;
                                    case 'doc':
                                      mime = 'application/msword';
                                      break;
                                    case 'docx':
                                      mime =
                                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                                      break;
                                    default:
                                      mime = 'application/octet-stream';
                                  }

                                  req.files.add(http.MultipartFile.fromBytes(
                                    'file',
                                    picked!.bytes!,
                                    filename: picked!.name,
                                    contentType: MediaType.parse(mime),
                                  ));
                                }

                                final streamed = await req.send();
                                final res =
                                    await http.Response.fromStream(streamed);

                                if (res.statusCode == 200 ||
                                    res.statusCode == 201) {
                                  // Tăng lượt ứng tuyển (fire-and-forget)
                                  try {
                                    await jobService
                                        .incrementJobApplications(job!.jobId);
                                  } catch (_) {}
                                  // Làm mới chi tiết công việc trong nền để cập nhật applicationCount
                                  // nhưng không chặn UX
                                  // ignore: unawaited_futures
                                  _fetchDetails(job!.jobId);
                                  if (mounted) {
                                    // Đánh dấu đã ứng tuyển để vô hiệu hóa nút
                                    setState(() => hasApplied = true);
                                  }
                                  if (mounted) {
                                    Navigator.of(ctx).pop();
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(tr('submit_application_success'))),
                                    );
                                  }
                                } else {
                                  throw Exception(
                                      'HTTP ${res.statusCode}: ${res.body}');
                                }
                              } catch (e) {
                                if (mounted) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text('${tr('apply_failed')}: $e')),
                                  );
                                }
                              } finally {
                                if (mounted)
                                  setSheetState(() => submitting = false);
                              }
                            },
                      icon: submitting
                          ? const SizedBox(
                              height: 16,
                              width: 16,
                              child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.send),
                      label: Text(tr('submit')),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  String _formatLocalDateTime(DateTime dt) {
    String two(int v) => v.toString().padLeft(2, '0');
    return '${dt.year}-${two(dt.month)}-${two(dt.day)}T${two(dt.hour)}:${two(dt.minute)}:${two(dt.second)}';
  }

  Future<void> _fetchDetails(int jobId) async {
    setState(() {
      isLoading = true;
      isError = false;
    });
    try {
      final data = await jobService.getJobDetails(jobId);
      if (!mounted) return;
      setState(() {
        job = data;
      });
      await jobService.incrementJobViews(jobId);
      // After loading, check favorite status (non-blocking)
      _loadFavoriteStatus(jobId);
      // Also check application status (non-blocking)
      _checkAppliedStatus(jobId);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        isError = true;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(tr('job_detail_load_error'))),
      );
    } finally {
      if (!mounted) return;
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _checkAppliedStatus(int jobId) async {
    try {
      final user = await ApiUserService.getCurrentUser();
      final role = (user['role'] ?? '').toString().toUpperCase();
      if (role != 'APPLICANT') {
        if (!mounted) return;
        setState(() => hasApplied = false);
        return;
      }
      final apps = await ApiApplicationService.getMyApplications();
      for (final a in apps) {
        final jidRaw = a['jobId'] ?? a['job']?['jobId'];
        final jid = jidRaw is int ? jidRaw : int.tryParse(jidRaw?.toString() ?? '');
        if (jid == jobId) {
          if (!mounted) return;
          setState(() => hasApplied = true);
          return;
        }
      }
      if (!mounted) return;
      setState(() => hasApplied = false);
    } catch (_) {
      if (!mounted) return;
      setState(() => hasApplied = false);
    }
  }

  Future<void> _loadFavoriteStatus(int jobId) async {
    try {
      final user = await ApiUserService.getCurrentUser();
      final role = (user['role'] ?? '').toString().toUpperCase();
      if (role != 'APPLICANT') return;
      final favs = await ApiFavoriteService.getMyFavorites();
      for (final f in favs) {
        final jidRaw = f['jobId'] ?? f['job']?['jobId'];
        final jid =
            jidRaw is int ? jidRaw : int.tryParse(jidRaw?.toString() ?? '');
        if (jid == jobId) {
          if (!mounted) return;
          setState(() {
            isFavorited = true;
            final idRaw = f['favoriteJobId'] ?? f['id'];
            favoriteId =
                idRaw is int ? idRaw : int.tryParse(idRaw?.toString() ?? '');
          });
          return;
        }
      }
      if (!mounted) return;
      setState(() {
        isFavorited = false;
        favoriteId = null;
      });
    } catch (_) {
      // ignore favorite status errors
    }
  }

  Future<void> _toggleFavorite() async {
    if (job == null) return;
    final current = isFavorited;
    setState(() => isFavorited = !current);
    try {
      if (!current) {
        final user = await ApiUserService.getCurrentUser();
        final created = await ApiFavoriteService.addFavorite(
            {'jobId': job!.jobId, 'userId': user['userId']});
        final idRaw = created['favoriteJobId'] ?? created['id'];
        setState(() {
          favoriteId =
              idRaw is int ? idRaw : int.tryParse(idRaw?.toString() ?? '');
        });
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(tr('saved_job'))),
          );
        }
      } else {
        final fid = favoriteId;
        if (fid != null) {
          await ApiFavoriteService.deleteFavorite(fid);
        } else {
          // fallback: reload status to find id then delete
          await _loadFavoriteStatus(job!.jobId);
          if (favoriteId != null) {
            await ApiFavoriteService.deleteFavorite(favoriteId!);
          }
        }
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(tr('unsaved_job'))),
          );
        }
      }
    } catch (e) {
      // revert state on error
      if (mounted) setState(() => isFavorited = current);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${tr('action_failed')}: $e')),
        );
      }
    }
  }

  String _formatDate(DateTime? dt) {
    if (dt == null) return tr('unknown');
    return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
  }

  String _formatSalary(int? salary) {
    if (salary == null) return tr('negotiable');
    return '${_formatNumber(salary)} VND';
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
    if (diff == 0) return tr('today');
    if (diff <= 7) return tr('days_ago').replaceFirst('{n}', '$diff');
    if (diff <= 30) return tr('weeks_ago').replaceFirst('{n}', '${(diff / 7).floor()}');
    return tr('months_ago').replaceFirst('{n}', '${(diff / 30).floor()}');
  }

  void _onApply() {
    if (hasApplied) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(tr('already_applied_msg'))),
      );
      return;
    }
    _showApplySheet();
  }

  void _onShare() {
    // TODO: Tích hợp chia sẻ (Share Plus) nếu cần
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(tr('share_link_copied'))),
      );
  }

  Future<void> _onChat() async {
    if (job == null) return;
    try {
      // Lấy chi tiết job dạng raw để có nested user (recruiter)
      final raw = await jobService.getJobDetailsRaw(job!.jobId);
      final recruiterId = raw['user']?['userId'];
      if (recruiterId is int) {
        if (!mounted) return;
        Navigator.pushNamed(context, '/chat', arguments: {
          'partnerUserId': recruiterId,
        });
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(tr('recruiter_not_found_for_chat'))),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${tr('cannot_open_chat')}: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)?.settings.arguments;
    final jobId = args is int ? args : null;

    return Scaffold(
      appBar: AppBar(
        title: AnimatedBuilder(
          animation: LocaleController.instance,
          builder: (context, _) => Text(tr('job_detail_title')),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : isError || job == null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(tr('error_occurred')),
                      const SizedBox(height: 8),
                      ElevatedButton(
                        onPressed:
                            jobId != null ? () => _fetchDetails(jobId) : null,
                        child: Text(tr('retry')),
                      )
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: () => _fetchDetails(job!.jobId),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header
                        Text(
                          job!.title,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.business, size: 18),
                            const SizedBox(width: 6),
                            Text(job!.recruiterName ?? tr('recruiter')),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.schedule, size: 18),
                            const SizedBox(width: 6),
                            Text(_timeAgo(job!.createdAt) +
                                (job!.expiredAt != null
                                    ? ' • ${tr('expired_prefix')}: ${_formatDate(job!.expiredAt)}'
                                    : '')),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 12,
                          runSpacing: 8,
                          children: [
                            _InfoChip(
                                icon: Icons.place,
                                label: job!.locationName ?? tr('unknown')),
                            _InfoChip(
                                icon: Icons.stacked_bar_chart,
                                label: job!.levelName ?? tr('unknown')),
                            _InfoChip(
                                icon: Icons.category,
                                label: job!.jobTypeName ?? tr('unknown')),
                            _InfoChip(
                                icon: Icons.workspaces_outline,
                                label: job!.industryName ?? tr('unknown')),
                            _InfoChip(
                                icon: Icons.attach_money,
                                label: _formatSalary(job!.salary)),
                            _InfoChip(
                                icon: Icons.remove_red_eye,
                                label: '${tr('views')}: ${job!.viewsCount}'),
                            _InfoChip(
                                icon: Icons.how_to_reg,
                                label: '${tr('applications')}: ${job!.applicationCount}'),
                            _InfoChip(
                                icon: Icons.groups,
                                label: '${tr('quantity')}: ${job!.quantity}'),
                          ],
                        ),
                        const SizedBox(height: 16),

                        // Actions
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: hasApplied ? null : _onApply,
                                icon: const Icon(Icons.send),
                                label: Text(hasApplied ? tr('applied') : tr('apply')),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: _onChat,
                                icon: const Icon(Icons.chat_bubble_outline),
                                label: Text(tr('chat')),
                              ),
                            ),
                            const SizedBox(width: 10),
                            IconButton(
                              tooltip: isFavorited ? tr('unsave') : tr('save'),
                              onPressed: _toggleFavorite,
                              icon: Icon(isFavorited
                                  ? Icons.bookmark
                                  : Icons.bookmark_border),
                            ),
                            IconButton(
                              tooltip: tr('share'),
                              onPressed: _onShare,
                              icon: const Icon(Icons.share),
                            ),
                          ],
                        ),

                        const SizedBox(height: 24),
                        Text(
                          tr('job_description'),
                          style: const TextStyle(
                              fontSize: 18, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 8),
                        Text(job!.description),
                      ],
                    ),
                  ),
                ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Chip(
      avatar: Icon(icon, size: 16),
      label: Text(label),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
    );
  }
}
