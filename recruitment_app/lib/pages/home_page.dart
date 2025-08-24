import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:recruitment_app/configs/app_configs.dart';
import 'package:recruitment_app/models/job_model.dart';
import 'package:recruitment_app/services/api_applicant_service.dart';
import 'package:recruitment_app/services/api_job_service.dart';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/services/api_industry_service.dart';
import 'package:recruitment_app/services/api_job_type_service.dart';
import 'package:recruitment_app/services/api_level_service.dart';
import 'package:recruitment_app/services/api_location_service.dart';
import 'package:recruitment_app/services/api_user_service.dart';
import 'package:recruitment_app/configs/i18n.dart';

class HomePage extends StatefulWidget {
  final bool myLevelOnly;
  final String? userLevelId;

  const HomePage({super.key, this.myLevelOnly = false, this.userLevelId});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final storage = const FlutterSecureStorage();
  late final JobService jobService;

  List<JobModel> jobs = [];
  bool isLoading = true;
  String searchTitle = "";
  String? selectedCategory;
  String? selectedJobType;
  String? selectedLevel;
  String? selectedLocation;
  List<Map<String, dynamic>> industries = [];
  List<Map<String, dynamic>> jobTypes = [];
  List<Map<String, dynamic>> levels = [];
  List<Map<String, dynamic>> locations = [];
  int? selectedSalary;
  bool isFeatured = false;
  String sortBy = "";
  final String sortDirection = "desc";
  bool myLevelOnly = false;
  int page = 0;
  int totalPages = 1;
  String? _userLevelId;

  @override
  void initState() {
    super.initState();
    jobService = JobService(client: http.Client());
    myLevelOnly = widget.myLevelOnly;
    _userLevelId = widget.userLevelId;
    _loadFilters();
    _ensureUserLevel();
    fetchJobs();
  }

  Future<void> _loadFilters() async {
    try {
      final results = await Future.wait<List<Map<String, dynamic>>>([
        ApiIndustryService.fetchIndustriesList(),
        ApiJobTypeService.fetchJobTypesList(),
        ApiLevelService.fetchLevelsList(),
        ApiLocationService.fetchLocationsList(),
      ]);
      if (!mounted) return;
      setState(() {
        industries = results[0];
        jobTypes = results[1];
        levels = results[2];
        locations = results[3];
      });
    } catch (e) {
      if (AppConfig.isDebug) {
        print("Lỗi load filters: $e");
      }
    }
  }

  Future<void> _ensureUserLevel() async {
    if (_userLevelId != null) return;
    try {
      final educations = await ApiApplicantService.getEducations();
      String? derivedLevelId;
      for (final e in educations) {
        dynamic lid;
        final lvl = e['level'];
        if (lvl is Map) {
          lid = lvl['levelId'] ?? lvl['id'];
        }
        lid ??= e['levelId'];
        if (lid == null) continue;
        final s = lid.toString();
        if (derivedLevelId == null) {
          derivedLevelId = s;
        } else {
          final a = int.tryParse(derivedLevelId);
          final b = int.tryParse(s);
          if (a == null || (b != null && b > a)) {
            derivedLevelId = s;
          }
        }
      }

      if (derivedLevelId != null) {
        setState(() {
          _userLevelId = derivedLevelId;
        });
        if (myLevelOnly) {
          page = 0;
          await fetchJobs();
        }
        return;
      }

      final me = await ApiApplicantService.getProfile();
      dynamic levelId;
      if (me.containsKey('levelId')) {
        levelId = me['levelId'];
      } else if (me['level'] is Map && (me['level'] as Map).containsKey('levelId')) {
        levelId = me['level']['levelId'];
      }
      if (levelId != null) {
        setState(() {
          _userLevelId = levelId.toString();
        });
        if (myLevelOnly) {
          page = 0;
          await fetchJobs();
        }
      }
    } catch (e) {
      if (AppConfig.isDebug) {
        print('Không thể lấy trình độ người dùng: $e');
      }
    }
  }

  Future<void> fetchJobs() async {
    setState(() => isLoading = true);
    try {
      List<JobModel> jobList = [];
      int size = 6;

      // If user toggled myLevelOnly but we still don't have a level, notify and fallback
      if (myLevelOnly && _userLevelId == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Vui lòng cập nhật trình độ trong hồ sơ để sử dụng tính năng này.',
              ),
              duration: Duration(seconds: 2),
            ),
          );
        }
        setState(() {
          myLevelOnly = false;
        });
      }

      if (myLevelOnly && _userLevelId != null) {
        final result = await jobService.getSuitableJobs(
          levelId: _userLevelId!,
          page: page,
          size: size,
        );
        jobList = List<JobModel>.from(result['jobs'] as List);
        totalPages =
            (result['totalPages'] as int?) ?? (jobList.length / size).ceil();
      } else {
        final result = await jobService.searchJobs(
          title: searchTitle.isNotEmpty ? searchTitle : null,
          industryId:
              selectedCategory != null ? int.parse(selectedCategory!) : null,
          jobTypeId:
              selectedJobType != null ? int.parse(selectedJobType!) : null,
          levelId: selectedLevel != null ? int.parse(selectedLevel!) : null,
          salary: selectedSalary,
          isFeatured: isFeatured ? true : null,
          sortBy: sortBy.isNotEmpty ? sortBy : null,
          sortDirection: sortDirection,
          page: page,
          size: size,
        );
        jobList = List<JobModel>.from(result['jobs'] as List);
        totalPages = (result['totalPages'] as int?) ?? 1;
      }

      setState(() {
        jobs = jobList;
      });
    } catch (e) {
      print("Lỗi fetchJobs: $e");
    } finally {
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          tr('latest_jobs'),
          style: const TextStyle(fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        backgroundColor: Colors.white,
        actions: [
          IconButton(
            tooltip: tr('messages'),
            onPressed: () {
              Navigator.pushNamed(context, '/chat');
            },
            icon: const Icon(Icons.chat_bubble_outline),
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(10),
        child: Column(
          children: [
            // Search Box
            Material(
              elevation: 2,
              borderRadius: BorderRadius.circular(12),
              child: TextField(
                decoration: InputDecoration(
                  hintText: tr('search_jobs_placeholder'),
                  prefixIcon: const Icon(Icons.search),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                ),
                onSubmitted: (val) {
                  searchTitle = val;
                  page = 0;
                  fetchJobs();
                },
              ),
            ),
            const SizedBox(height: 12),

            // Filter Section
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 1,
              child: ExpansionTile(
                leading: const Icon(Icons.filter_alt, color: Colors.indigo),
                title: Text(
                  tr('advanced_filters'),
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                subtitle: myLevelOnly
                    ? Text(
                        tr('filtering_by_my_level'),
                        style: const TextStyle(color: Colors.indigo),
                      )
                    : null,
                initiallyExpanded: true,
                childrenPadding: const EdgeInsets.all(12),
                children: [
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      FilterChip(
                        label: Text(tr('filter_by_my_level')),
                        selected: myLevelOnly,
                        selectedColor: Colors.indigo.withOpacity(0.2),
                        onSelected: (v) async {
                          if (_userLevelId == null) {
                            await _ensureUserLevel();
                          }
                          if (_userLevelId == null && v) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(tr('update_level_notice')),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                            return;
                          }
                          setState(() {
                            myLevelOnly = v;
                            if (v) {
                              // Tránh lọc trùng cấp bậc khi dùng gợi ý theo cấp độ cá nhân
                              selectedLevel = null;
                            }
                          });
                          page = 0;
                          fetchJobs();
                        },
                      ),
                      _buildDropdown(tr('industry'), industries, selectedCategory,
                          (val) {
                        setState(() => selectedCategory = val);
                        page = 0;
                        fetchJobs();
                      }),
                      _buildDropdown(
                          tr('job_type'), jobTypes, selectedJobType,
                          (val) {
                        setState(() => selectedJobType = val);
                        page = 0;
                        fetchJobs();
                      }),
                      IgnorePointer(
                        ignoring: myLevelOnly,
                        child: Opacity(
                          opacity: myLevelOnly ? 0.5 : 1.0,
                          child: _buildDropdown(tr('level'), levels, selectedLevel, (val) {
                            setState(() => selectedLevel = val);
                            page = 0;
                            fetchJobs();
                          }),
                        ),
                      ),
                      SizedBox(
                        width: 200,
                        child: TextFormField(
                          initialValue: selectedSalary?.toString() ?? '',
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            labelText: tr('min_salary'),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          onFieldSubmitted: (val) {
                            setState(() {
                              selectedSalary = int.tryParse(val);
                            });
                            page = 0;
                            fetchJobs();
                          },
                        ),
                      ),
                      FilterChip(
                        label: Text(tr('featured')),
                        selected: isFeatured,
                        selectedColor: Colors.orange.withOpacity(0.2),
                        onSelected: (v) {
                          setState(() => isFeatured = v);
                          page = 0;
                          fetchJobs();
                        },
                      ),
                      _buildSortDropdown(),
                      ElevatedButton.icon(
                        icon: const Icon(Icons.filter_alt_off),
                        label: Text(tr('clear_filters')),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.grey[300],
                          foregroundColor: Colors.black87,
                        ),
                        onPressed: () {
                          setState(() {
                            selectedCategory = null;
                            selectedJobType = null;
                            selectedLevel = null;
                            selectedLocation = null;
                            selectedSalary = null;
                            isFeatured = false;
                            sortBy = "";
                            myLevelOnly = false;
                          });
                          page = 0;
                          fetchJobs();
                        },
                      ),
                    ],
                  )
                  ,
                  if (myLevelOnly)
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Row(
                        children: const [
                          Icon(Icons.info_outline, size: 16, color: Colors.indigo),
                          SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              'Đang hiển thị công việc phù hợp với cấp độ của bạn.',
                              style: TextStyle(color: Colors.indigo),
                            ),
                          ),
                        ],
                      ),
                    )
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Job List
            Expanded(
              child: isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : jobs.isEmpty
                      ? Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.search_off,
                                size: 56, color: Colors.grey.shade400),
                            const SizedBox(height: 8),
                            Text(
                              tr('no_jobs_found'),
                              style: const TextStyle(fontWeight: FontWeight.w600),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              tr('try_clear_filters'),
                              style: TextStyle(color: Colors.grey.shade600),
                            ),
                            const SizedBox(height: 12),
                            OutlinedButton.icon(
                              icon: const Icon(Icons.filter_alt_off),
                              label: Text(tr('clear_all_filters')),
                              onPressed: () {
                                setState(() {
                                  selectedCategory = null;
                                  selectedJobType = null;
                                  selectedLevel = null;
                                  selectedLocation = null;
                                  selectedSalary = null;
                                  isFeatured = false;
                                  sortBy = "";
                                  myLevelOnly = false;
                                });
                                page = 0;
                                fetchJobs();
                              },
                            )
                          ],
                        )
                      : RefreshIndicator(
                          onRefresh: () async {
                            page = 0;
                            await fetchJobs();
                          },
                          child: ListView.builder(
                            padding: const EdgeInsets.only(top: 4),
                            itemCount: jobs.length,
                            itemBuilder: (context, index) {
                              final job = jobs[index];
                              final salaryText = _formatSalary(job.salary);
                              final timeAgoText = _timeAgo(job.createdAt);
                              return _JobCard(
                                job: job,
                                salaryText: salaryText,
                                timeAgoText: timeAgoText,
                                onTap: () {
                                  Navigator.pushNamed(
                                    context,
                                    "/jobDetail",
                                    arguments: job.jobId,
                                  );
                                },
                              );
                            },
                          ),
                        ),
            ),

            // Pagination
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton.icon(
                  icon: const Icon(Icons.chevron_left),
                  label: Text(tr('prev')),
                  onPressed: page > 0
                      ? () {
                          setState(() => page--);
                          fetchJobs();
                        }
                      : null,
                ),
                const SizedBox(width: 10),
                Text("${page + 1} / $totalPages"),
                const SizedBox(width: 10),
                ElevatedButton.icon(
                  icon: const Icon(Icons.chevron_right),
                  label: Text(tr('next')),
                  onPressed: page < totalPages - 1
                      ? () {
                          setState(() => page++);
                          fetchJobs();
                        }
                      : null,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatSalary(int? salary) {
    if (salary == null) return 'Thỏa thuận';
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
    final diffDays = now.difference(dt).inDays.abs();
    if (diffDays == 0) return 'Hôm nay';
    if (diffDays <= 7) return '$diffDays ngày trước';
    if (diffDays <= 30) return '${(diffDays / 7).floor()} tuần trước';
    return '${(diffDays / 30).floor()} tháng trước';
  }

  Widget _buildDropdown(String label, List<Map<String, dynamic>> items,
      String? selectedValue, Function(String?) onChanged) {
    return SizedBox(
      width: 200,
      child: DropdownButtonFormField<String?>(
        value: selectedValue,
        isExpanded: true,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        items: [
          DropdownMenuItem<String?>(
            value: null,
            child: Text("Tất cả $label"),
          ),
          ...items.map((e) => DropdownMenuItem<String?>(
                value: (e['id'] ??
                        e['industryId'] ??
                        e['jobTypeId'] ??
                        e['levelId'])
                    .toString(),
                child: Text(
                    e['name'] ??
                        e['industryName'] ??
                        e['jobTypeName'] ??
                        e['levelName'] ??
                        '',
                    overflow: TextOverflow.ellipsis),
              )),
        ],
        onChanged: onChanged,
      ),
    );
  }

  Widget _buildSortDropdown() {
    return SizedBox(
      width: 200,
      child: DropdownButtonFormField<String>(
        value: sortBy.isEmpty ? null : sortBy,
        isExpanded: true,
        decoration: InputDecoration(
          labelText: "Sắp xếp",
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        items: const [
          DropdownMenuItem<String>(
            value: 'viewsCount',
            child: Text('Lượt xem (giảm dần)'),
          ),
          DropdownMenuItem<String>(
            value: 'applicationCount',
            child: Text('Lượt ứng tuyển (giảm dần)'),
          ),
        ],
        onChanged: (val) {
          setState(() => sortBy = val ?? "");
          page = 0;
          fetchJobs();
        },
      ),
    );
  }
}

class _JobCard extends StatelessWidget {
  final JobModel job;
  final String salaryText;
  final String timeAgoText;
  final VoidCallback onTap;

  const _JobCard({
    required this.job,
    required this.salaryText,
    required this.timeAgoText,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: Colors.indigo.shade100,
                child: const Icon(Icons.work, color: Colors.indigo),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        if (job.isFeatured)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                            margin: const EdgeInsets.only(right: 8),
                            decoration: BoxDecoration(
                              color: Colors.orange.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text(
                              'Nổi bật',
                              style: TextStyle(
                                  color: Colors.orange,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600),
                            ),
                          ),
                        Expanded(
                          child: Text(
                            job.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                                fontSize: 16, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 10,
                      runSpacing: 8,
                      children: [
                        _iconText(Icons.business,
                            job.recruiterName ?? 'Nhà tuyển dụng'),
                        _iconText(Icons.place, job.locationName ?? 'Không rõ'),
                        _iconText(Icons.stacked_bar_chart,
                            job.levelName ?? 'Không rõ'),
                        _iconText(
                            Icons.category, job.jobTypeName ?? 'Không rõ'),
                        _iconText(Icons.workspaces_outline,
                            job.industryName ?? 'Không rõ'),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            salaryText,
                            style: const TextStyle(
                                color: Colors.green,
                                fontWeight: FontWeight.w600),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Icon(Icons.schedule,
                            size: 16, color: Colors.grey.shade600),
                        const SizedBox(width: 4),
                        Text(timeAgoText,
                            style: TextStyle(color: Colors.grey.shade700)),
                        const Spacer(),
                        Row(
                          children: [
                            Icon(Icons.remove_red_eye,
                                size: 16, color: Colors.grey.shade600),
                            const SizedBox(width: 4),
                            Text('${job.viewsCount}',
                                style: TextStyle(color: Colors.grey.shade700)),
                            const SizedBox(width: 12),
                            Icon(Icons.how_to_reg,
                                size: 16, color: Colors.grey.shade600),
                            const SizedBox(width: 4),
                            Text('${job.applicationCount}',
                                style: TextStyle(color: Colors.grey.shade700)),
                            const SizedBox(width: 6),
                            const Icon(Icons.arrow_forward_ios_rounded,
                                size: 14, color: Colors.indigo),
                          ],
                        )
                      ],
                    )
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _iconText(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: Colors.grey.shade700),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(color: Colors.grey.shade800),
          overflow: TextOverflow.ellipsis,
        )
      ],
    );
  }
}
