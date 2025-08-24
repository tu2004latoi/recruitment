import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/services/api_user_service.dart';
import 'package:recruitment_app/services/api_recruiter_service.dart';
import 'package:recruitment_app/services/api_job_service.dart';
import 'package:recruitment_app/services/api_level_service.dart';
import 'package:recruitment_app/services/api_job_type_service.dart';
import 'package:recruitment_app/services/api_industry_service.dart';

class AddJobPage extends StatefulWidget {
  const AddJobPage({super.key});

  @override
  State<AddJobPage> createState() => _AddJobPageState();
}

class _AddJobPageState extends State<AddJobPage> {
  final _formKey = GlobalKey<FormState>();
  final _jobService = JobService(client: http.Client());

  bool _loading = false;
  List<Map<String, dynamic>> _levels = [];
  List<Map<String, dynamic>> _jobTypes = [];
  List<Map<String, dynamic>> _industries = [];

  int? _userId;
  int? _recruiterLocationId;

  // form fields
  String _title = '';
  String _description = '';
  String? _salary;
  String? _quantity = '1';
  bool _isActive = true;
  int? _levelId;
  int? _jobTypeId;
  int? _industryId;
  final TextEditingController _expiredCtrl = TextEditingController();
  DateTime? _expiredDate;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    setState(() => _loading = true);
    try {
      // Fetch refs
      final results = await Future.wait([
        ApiLevelService.fetchLevelsList(),
        ApiJobTypeService.fetchJobTypesList(),
        ApiIndustryService.fetchIndustriesList(),
        ApiUserService.getCurrentUser(),
      ]);

      final currentUser = results[3] as Map<String, dynamic>;
      final userIdRaw = currentUser['userId'];
      _userId = userIdRaw is int ? userIdRaw : int.tryParse(userIdRaw?.toString() ?? '');

      // Fetch recruiter details for locationId
      if (_userId != null) {
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

      setState(() {
        _levels = (results[0] as List<Map<String, dynamic>>);
        _jobTypes = (results[1] as List<Map<String, dynamic>>);
        _industries = (results[2] as List<Map<String, dynamic>>);
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Tải dữ liệu thất bại: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Không xác định được người dùng')), 
      );
      return;
    }

    setState(() => _loading = true);
    try {
      final jobData = <String, dynamic>{
        'title': _title.trim(),
        'description': _description.trim(),
        'expiredAt': _expiredDate?.toIso8601String(),
        'salary': (_salary == null || _salary!.isEmpty) ? null : int.tryParse(_salary!),
        'quantity': int.tryParse(_quantity ?? '1') ?? 1,
        'isActive': _isActive,
        'levelId': _levelId,
        'jobTypeId': _jobTypeId,
        'industryId': _industryId,
        'userId': _userId,
        'locationId': _recruiterLocationId,
      };

      await _jobService.createJob(jobData);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tạo công việc thành công')), 
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Tạo công việc thất bại: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thêm công việc')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : LayoutBuilder(
              builder: (context, constraints) {
                final maxWidth = constraints.maxWidth > 720 ? 680.0 : constraints.maxWidth - 32;
                return Center(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(maxWidth: maxWidth),
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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
                                    Text('Thông tin công việc', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                TextFormField(
                                  decoration: const InputDecoration(
                                    labelText: 'Tiêu đề',
                                    prefixIcon: Icon(Icons.title_outlined),
                                  ),
                                  onChanged: (v) => _title = v,
                                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Bắt buộc' : null,
                                ),
                                const SizedBox(height: 12),
                                TextFormField(
                                  decoration: const InputDecoration(
                                    labelText: 'Mô tả',
                                    alignLabelWithHint: true,
                                    prefixIcon: Icon(Icons.notes_outlined),
                                  ),
                                  maxLines: 5,
                                  onChanged: (v) => _description = v,
                                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Bắt buộc' : null,
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  children: const [
                                    Icon(Icons.tune, size: 20),
                                    SizedBox(width: 8),
                                    Text('Thiết lập', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(
                                      child: TextFormField(
                                        decoration: const InputDecoration(
                                          labelText: 'Mức lương (VNĐ)',
                                          prefixIcon: Icon(Icons.payments_outlined),
                                        ),
                                        keyboardType: TextInputType.number,
                                        onChanged: (v) => _salary = v,
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: TextFormField(
                                        decoration: const InputDecoration(
                                          labelText: 'Số lượng',
                                          prefixIcon: Icon(Icons.onetwothree),
                                        ),
                                        keyboardType: TextInputType.number,
                                        initialValue: _quantity,
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
                                    final picked = await showDatePicker(
                                      context: context,
                                      initialDate: _expiredDate ?? now,
                                      firstDate: now,
                                      lastDate: DateTime(now.year + 5),
                                    );
                                    if (picked != null) {
                                      setState(() {
                                        _expiredDate = picked;
                                        _expiredCtrl.text = '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}';
                                      });
                                    }
                                  },
                                ),
                                const SizedBox(height: 12),
                                SwitchListTile(
                                  value: _isActive,
                                  onChanged: (v) => setState(() => _isActive = v),
                                  title: const Text('Kích hoạt'),
                                  contentPadding: EdgeInsets.zero,
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: const [
                                    Icon(Icons.category_outlined, size: 20),
                                    SizedBox(width: 8),
                                    Text('Phân loại', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                DropdownButtonFormField<int>(
                                  value: _levelId,
                                  items: _levels
                                      .map((e) => DropdownMenuItem<int>(
                                            value: (e['levelId'] ?? e['id']) as int?,
                                            child: Text((e['name'] ?? e['levelName'] ?? '').toString()),
                                          ))
                                      .toList(),
                                  onChanged: (v) => setState(() => _levelId = v),
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
                                            value: (e['jobTypeId'] ?? e['id']) as int?,
                                            child: Text((e['name'] ?? e['jobTypeName'] ?? '').toString()),
                                          ))
                                      .toList(),
                                  onChanged: (v) => setState(() => _jobTypeId = v),
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
                                            value: (e['industryId'] ?? e['id']) as int?,
                                            child: Text((e['name'] ?? e['industryName'] ?? '').toString()),
                                          ))
                                      .toList(),
                                  onChanged: (v) => setState(() => _industryId = v),
                                  decoration: const InputDecoration(
                                    labelText: 'Ngành nghề',
                                    prefixIcon: Icon(Icons.business_center_outlined),
                                  ),
                                ),
                                const SizedBox(height: 20),
                                Row(
                                  children: [
                                    Expanded(
                                      child: OutlinedButton(
                                        onPressed: _loading ? null : () => Navigator.of(context).maybePop(),
                                        child: const Text('Hủy'),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: FilledButton(
                                        onPressed: _loading ? null : _submit,
                                        child: _loading
                                            ? Row(
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                children: const [
                                                  SizedBox(
                                                    width: 18,
                                                    height: 18,
                                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                                  ),
                                                  SizedBox(width: 8),
                                                  Text('Đang lưu...'),
                                                ],
                                              )
                                            : const Text('Tạo công việc'),
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
