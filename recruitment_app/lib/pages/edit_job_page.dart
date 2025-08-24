import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/services/api_user_service.dart';
import 'package:recruitment_app/services/api_recruiter_service.dart';
import 'package:recruitment_app/services/api_job_service.dart';
import 'package:recruitment_app/services/api_level_service.dart';
import 'package:recruitment_app/services/api_job_type_service.dart';
import 'package:recruitment_app/services/api_industry_service.dart';

class EditJobPage extends StatefulWidget {
  const EditJobPage({super.key});

  @override
  State<EditJobPage> createState() => _EditJobPageState();
}

class _EditJobPageState extends State<EditJobPage> {
  final _formKey = GlobalKey<FormState>();
  final _jobService = JobService(client: http.Client());

  bool _isFetching = true;
  bool _isSaving = false;

  int? _jobId;
  int? _userId;
  int? _recruiterLocationId;

  // refs
  List<Map<String, dynamic>> _levels = [];
  List<Map<String, dynamic>> _jobTypes = [];
  List<Map<String, dynamic>> _industries = [];

  // form fields
  String _title = '';
  String _description = '';
  String? _salary;
  String? _quantity = '1';
  bool _isActive = true;
  bool _isFeatured = false;
  int? _levelId;
  int? _jobTypeId;
  int? _industryId;
  final TextEditingController _expiredCtrl = TextEditingController();
  DateTime? _expiredDate;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final args = ModalRoute.of(context)?.settings.arguments;
      _jobId = (args is Map && args['jobId'] != null)
          ? int.tryParse(args['jobId'].toString())
          : null;
      _bootstrap();
    });
  }

  Future<void> _bootstrap() async {
    setState(() {
      _isFetching = true;
    });
    try {
      // current user
      final currentUser = await ApiUserService.getCurrentUser();
      final userIdRaw = currentUser['userId'];
      _userId = userIdRaw is int
          ? userIdRaw
          : int.tryParse(userIdRaw?.toString() ?? '');

      if (_jobId == null || _userId == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Thiếu thông tin để chỉnh sửa')),
          );
          Navigator.of(context).maybePop();
        }
        return;
      }

      // fetch job details (ownership)
      final job = await _jobService.getJobDetailsByRecruiter(_userId!, _jobId!);
      final ownerId = job['user']?['userId'];
      final ownerMatches = ownerId?.toString() == _userId!.toString();
      if (!ownerMatches) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Bạn không có quyền chỉnh sửa công việc này!')),
          );
          Navigator.of(context).maybePop();
        }
        return;
      }

      // prefill
      _title = (job['title'] ?? '').toString();
      _description = (job['description'] ?? '').toString();
      _salary = job['salary']?.toString();
      _quantity = (job['quantity'] ?? 1).toString();
      _isActive = job['isActive'] == null ? true : (job['isActive'] == true);
      _isFeatured = job['isFeatured'] == true;
      final level = job['level'];
      final jobType = job['jobType'];
      final industry = job['industry'];
      final location = job['location'];
      _levelId = (level?['levelId'] ?? level?['id']) is int
          ? (level?['levelId'] ?? level?['id']) as int
          : int.tryParse((level?['levelId'] ?? level?['id'] ?? '').toString());
      _jobTypeId = (jobType?['jobTypeId'] ?? jobType?['id']) is int
          ? (jobType?['jobTypeId'] ?? jobType?['id']) as int
          : int.tryParse(
              (jobType?['jobTypeId'] ?? jobType?['id'] ?? '').toString());
      _industryId = (industry?['industryId'] ?? industry?['id']) is int
          ? (industry?['industryId'] ?? industry?['id']) as int
          : int.tryParse(
              (industry?['industryId'] ?? industry?['id'] ?? '').toString());
      final expiredAtStr = job['expiredAt']?.toString();
      if (expiredAtStr != null && expiredAtStr.isNotEmpty) {
        final d = DateTime.tryParse(expiredAtStr);
        if (d != null) {
          _expiredDate = d;
          _expiredCtrl.text =
              '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
        }
      }

      // set locationId from job if present
      final jobLocId = location?['locationId'];
      if (jobLocId is int) _recruiterLocationId = jobLocId;
      if (_recruiterLocationId == null) {
        _recruiterLocationId = int.tryParse((jobLocId ?? '').toString());
      }

      // if still null, fetch recruiter details for locationId
      if (_recruiterLocationId == null && _userId != null) {
        try {
          final r = await ApiRecruiterService.getRecruiterDetails(_userId!);
          final locId = r['location']?['locationId'];
          if (locId is int) _recruiterLocationId = locId;
          if (_recruiterLocationId == null) {
            final parsed = int.tryParse((locId ?? '').toString());
            _recruiterLocationId = parsed;
          }
        } catch (_) {}
      }

      // fetch refs
      final results = await Future.wait([
        ApiLevelService.fetchLevelsList(),
        ApiJobTypeService.fetchJobTypesList(),
        ApiIndustryService.fetchIndustriesList(),
      ]);
      _levels = (results[0] as List<Map<String, dynamic>>);
      _jobTypes = (results[1] as List<Map<String, dynamic>>);
      _industries = (results[2] as List<Map<String, dynamic>>);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Không thể tải dữ liệu: $e')),
        );
        Navigator.of(context).maybePop();
      }
    } finally {
      if (mounted) {
        setState(() {
          _isFetching = false;
        });
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_jobId == null || _userId == null) return;

    setState(() => _isSaving = true);
    try {
      final jobData = <String, dynamic>{
        'title': _title.trim(),
        'description': _description.trim(),
        'expiredAt': _expiredDate?.toIso8601String(),
        'salary': (_salary == null || _salary!.isEmpty)
            ? null
            : int.tryParse(_salary!),
        'quantity': int.tryParse(_quantity ?? '1') ?? 1,
        'isActive': _isActive,
        'isFeatured': _isFeatured,
        'levelId': _levelId,
        'jobTypeId': _jobTypeId,
        'industryId': _industryId,
        'userId': _userId,
        'locationId': _recruiterLocationId,
      };

      await _jobService.updateJob(_jobId!, jobData);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cập nhật tin tuyển dụng thành công!')),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Cập nhật tin tuyển dụng thất bại: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Chỉnh sửa công việc')),
      body: _isFetching
          ? const Center(child: CircularProgressIndicator())
          : LayoutBuilder(
              builder: (context, constraints) {
                final maxWidth = constraints.maxWidth > 720
                    ? 680.0
                    : constraints.maxWidth - 32;
                return Center(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(maxWidth: maxWidth),
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16)),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Form(
                            key: _formKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: const [
                                    Icon(Icons.work_outline, size: 20),
                                    SizedBox(width: 8),
                                    Text('Thông tin công việc',
                                        style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w700)),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                TextFormField(
                                  initialValue: _title,
                                  decoration: const InputDecoration(
                                    labelText: 'Tiêu đề',
                                    prefixIcon: Icon(Icons.title_outlined),
                                  ),
                                  onChanged: (v) => _title = v,
                                  validator: (v) =>
                                      (v == null || v.trim().isEmpty)
                                          ? 'Bắt buộc'
                                          : null,
                                ),
                                const SizedBox(height: 12),
                                TextFormField(
                                  initialValue: _description,
                                  decoration: const InputDecoration(
                                    labelText: 'Mô tả',
                                    alignLabelWithHint: true,
                                    prefixIcon: Icon(Icons.notes_outlined),
                                  ),
                                  maxLines: 5,
                                  onChanged: (v) => _description = v,
                                  validator: (v) =>
                                      (v == null || v.trim().isEmpty)
                                          ? 'Bắt buộc'
                                          : null,
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  children: const [
                                    Icon(Icons.tune, size: 20),
                                    SizedBox(width: 8),
                                    Text('Thiết lập',
                                        style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w700)),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextFormField(
                                        initialValue: _salary ?? '',
                                        decoration: const InputDecoration(
                                          labelText: 'Mức lương (VNĐ)',
                                          prefixIcon:
                                              Icon(Icons.payments_outlined),
                                        ),
                                        keyboardType: TextInputType.number,
                                        onChanged: (v) => _salary = v,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: TextFormField(
                                        initialValue: _quantity,
                                        decoration: const InputDecoration(
                                          labelText: 'Số lượng',
                                          prefixIcon: Icon(Icons.onetwothree),
                                        ),
                                        keyboardType: TextInputType.number,
                                        onChanged: (v) => _quantity = v,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                TextFormField(
                                  controller: _expiredCtrl,
                                  readOnly: true,
                                  decoration: const InputDecoration(
                                    labelText: 'Ngày hết hạn',
                                    hintText: 'Chọn ngày hết hạn',
                                    prefixIcon: Icon(Icons.event_outlined),
                                    suffixIcon: Icon(Icons.calendar_today),
                                  ),
                                  onTap: () async {
                                    final now = DateTime.now();
                                    final init = _expiredDate ?? now;
                                    final picked = await showDatePicker(
                                      context: context,
                                      initialDate:
                                          init.isBefore(now) ? now : init,
                                      firstDate: now,
                                      lastDate: DateTime(now.year + 5),
                                    );
                                    if (picked != null) {
                                      setState(() {
                                        _expiredDate = picked;
                                        _expiredCtrl.text =
                                            '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
                                      });
                                    }
                                  },
                                ),
                                const SizedBox(height: 12),
                                SwitchListTile(
                                  value: _isActive,
                                  onChanged: (v) =>
                                      setState(() => _isActive = v),
                                  title: const Text('Kích hoạt'),
                                  contentPadding: EdgeInsets.zero,
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: const [
                                    Icon(Icons.category_outlined, size: 20),
                                    SizedBox(width: 8),
                                    Text('Phân loại',
                                        style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w700)),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                DropdownButtonFormField<int>(
                                  value: _levelId,
                                  items: _levels
                                      .map((e) => DropdownMenuItem<int>(
                                            value: (e['levelId'] ?? e['id'])
                                                as int?,
                                            child: Text((e['name'] ??
                                                    e['levelName'] ??
                                                    '')
                                                .toString()),
                                          ))
                                      .toList(),
                                  onChanged: (v) =>
                                      setState(() => _levelId = v),
                                  decoration: const InputDecoration(
                                    labelText: 'Cấp độ',
                                    prefixIcon: Icon(Icons.stairs_outlined),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                DropdownButtonFormField<int>(
                                  value: _jobTypeId,
                                  items: _jobTypes
                                      .map((e) => DropdownMenuItem<int>(
                                            value: (e['jobTypeId'] ?? e['id'])
                                                as int?,
                                            child: Text((e['name'] ??
                                                    e['jobTypeName'] ??
                                                    '')
                                                .toString()),
                                          ))
                                      .toList(),
                                  onChanged: (v) =>
                                      setState(() => _jobTypeId = v),
                                  decoration: const InputDecoration(
                                    labelText: 'Loại công việc',
                                    prefixIcon: Icon(Icons.workspaces_outline),
                                  ),
                                ),
                                const SizedBox(height: 12),
                                DropdownButtonFormField<int>(
                                  value: _industryId,
                                  items: _industries
                                      .map((e) => DropdownMenuItem<int>(
                                            value: (e['industryId'] ?? e['id'])
                                                as int?,
                                            child: Text((e['name'] ??
                                                    e['industryName'] ??
                                                    '')
                                                .toString()),
                                          ))
                                      .toList(),
                                  onChanged: (v) =>
                                      setState(() => _industryId = v),
                                  decoration: const InputDecoration(
                                    labelText: 'Ngành nghề',
                                    prefixIcon:
                                        Icon(Icons.business_center_outlined),
                                  ),
                                ),
                                const SizedBox(height: 20),
                                Row(
                                  children: [
                                    Expanded(
                                      child: OutlinedButton(
                                        onPressed: _isSaving
                                            ? null
                                            : () => Navigator.of(context)
                                                .maybePop(),
                                        child: const Text('Hủy'),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: FilledButton(
                                        onPressed: _isSaving ? null : _submit,
                                        child: _isSaving
                                            ? Row(
                                                mainAxisAlignment:
                                                    MainAxisAlignment.center,
                                                children: const [
                                                  SizedBox(
                                                    width: 18,
                                                    height: 18,
                                                    child:
                                                        CircularProgressIndicator(
                                                            strokeWidth: 2,
                                                            color:
                                                                Colors.white),
                                                  ),
                                                  SizedBox(width: 8),
                                                  Text('Đang lưu...'),
                                                ],
                                              )
                                            : const Text('Cập nhật'),
                                      ),
                                    ),
                                  ],
                                )
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
    );
  }

  @override
  void dispose() {
    _expiredCtrl.dispose();
    super.dispose();
  }
}
