import 'package:flutter/material.dart';
import 'dart:async';
import 'package:intl/intl.dart';
import '../services/api_user_service.dart';
import '../services/api_applicant_service.dart';
import '../services/api_recruiter_service.dart';
import '../services/api_location_service.dart';
import '../services/api_level_service.dart';
import '../services/api_institution_service.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  bool _loading = true;
  String? _error;

  Map<String, dynamic>?
      _currentUser; // contains role, userId, email, firstName, lastName, phone, avatar

  // Applicant
  Map<String, dynamic> _applicant = {
    'dob': '',
    'gender': 'MALE',
    'experienceYears': 0,
    'skills': '',
    'jobTitle': '',
    'bio': '',
    'locationId': null,
  };
  Map<String, dynamic> _applicantLocation = {
    'locationId': null,
    'province': '',
    'district': '',
    'address': '',
    'notes': '',
  };
  List<Map<String, dynamic>> _educations = [];
  // Institutions cache
  List<Map<String, dynamic>> _institutions = [];
  Map<int, String> _institutionMap = {};
  // Universities dataset from GitHub for suggestions
  List<Map<String, dynamic>> _webInstitutions = [];
  final List<int> _deletedEducationIds = [];
  List<Map<String, dynamic>> _levels = [];

  // Recruiter
  Map<String, dynamic> _recruiter = {
    'companyName': '',
    'bio': '',
    'companyWebsite': '',
    'position': '',
    'logoUrl': '',
    'locationId': null,
  };
  Map<String, dynamic> _recruiterLocation = {
    'locationId': null,
    'province': '',
    'district': '',
    'address': '',
    'notes': '',
  };

  // Controllers for common user fields
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  // Applicant controllers
  final _dobCtrl = TextEditingController();
  final _skillsCtrl = TextEditingController();
  final _jobTitleCtrl = TextEditingController();
  final _bioApplicantCtrl = TextEditingController();
  final _expYearsCtrl = TextEditingController(text: '0');

  // Applicant location controllers
  final _alProvince = TextEditingController();
  final _alDistrict = TextEditingController();
  final _alAddress = TextEditingController();
  final _alNotes = TextEditingController();

  // Recruiter controllers
  final _companyNameCtrl = TextEditingController();
  final _companyWebsiteCtrl = TextEditingController();
  final _positionCtrl = TextEditingController();
  final _logoUrlCtrl = TextEditingController();
  final _bioRecruiterCtrl = TextEditingController();

  // Recruiter location controllers
  final _rlProvince = TextEditingController();
  final _rlDistrict = TextEditingController();
  final _rlAddress = TextEditingController();
  final _rlNotes = TextEditingController();

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  // A modern hero header showing avatar initials, full name, email, and role badge
  Widget _buildHeroHeader() {
    final firstName = _firstNameCtrl.text.trim();
    final lastName = _lastNameCtrl.text.trim();
    final fullName = [firstName, lastName].where((e) => e.isNotEmpty).join(' ');
    final email = _emailCtrl.text.trim();
    final role = (_currentUser?['role'] ?? '').toString().toUpperCase();
    final initials = ((firstName.isNotEmpty ? firstName[0] : '') + (lastName.isNotEmpty ? lastName[0] : ''))
        .toUpperCase();

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.indigo.shade400,
            Colors.blue.shade400,
          ],
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.indigo.shade200.withOpacity(0.5),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withOpacity(0.2),
                border: Border.all(color: Colors.white.withOpacity(0.6), width: 2),
              ),
              child: Center(
                child: Text(
                  initials.isEmpty ? 'U' : initials,
                  style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    fullName.isEmpty ? 'Người dùng' : fullName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    email.isEmpty ? 'user@example.com' : email,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(color: Colors.white.withOpacity(0.9)),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Flexible(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerRight,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.6)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.verified_user, color: Colors.white, size: 18),
                      const SizedBox(width: 6),
                      Text(
                        role.isEmpty ? 'USER' : role,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ---------------- UI helpers & handlers ----------------
  Widget _sectionCard(
      {required String title, required List<Widget> children, IconData? icon}) {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.blue.shade100),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.shade100.withOpacity(0.6),
            blurRadius: 20,
            offset: const Offset(0, 8),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (icon != null) Icon(icon, color: Colors.blue.shade600),
              if (icon != null) const SizedBox(width: 8),
              Text(title,
                  style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Colors.indigo)),
            ],
          ),
          const SizedBox(height: 12),
          ...children,
        ],
      ),
    );
  }

  Widget _labeledField({
    required String label,
    required TextEditingController controller,
    String? hint,
    TextInputType? keyboardType,
    bool readOnly = false,
    VoidCallback? onTap,
    int maxLines = 1,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.black54,
                fontSize: 12)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          readOnly: readOnly,
          onTap: onTap,
          keyboardType: keyboardType,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: Colors.white,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.blue.shade200, width: 2),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.blue.shade400, width: 2),
            ),
          ),
        ),
      ],
    );
  }

  void _addEducation() {
    setState(() {
      _educations.add({
        'educationId': null,
        'title': '',
        'year': '',
        'levelId': '',
        'institutionId': '',
        'institutionName': '',
      });
    });
  }

  void _removeEducation(int idx) {
    setState(() {
      final id = _educations[idx]['educationId'];
      if (id != null) {
        final parsed = id is int ? id : int.tryParse(id.toString());
        if (parsed != null) _deletedEducationIds.add(parsed);
      }
      _educations.removeAt(idx);
    });
  }

  void _updateEducation(int idx, String key, dynamic value) {
    setState(() {
      _educations[idx][key] = value;
    });
  }

  String _norm(String s) {
    final t = s.trim().toLowerCase();
    // basic normalization: remove extra spaces and punctuation except letters/numbers/spaces
    final cleaned = t.replaceAll(RegExp(r"[^a-z0-9\s]"), "").replaceAll(RegExp(r"\s+"), " ");
    return cleaned;
  }

  Future<int?> _resolveInstitutionIdByName(String name) async {
    if (name.trim().isEmpty) return null;
    final target = _norm(name);
    // try exact match on normalized name
    for (final i in _institutions) {
      final nm = (i['name']?.toString() ?? '');
      if (_norm(nm) == target) {
        return (i['id'] ?? i['institutionId']) as int?;
      }
    }
    // try contains match as fallback
    for (final i in _institutions) {
      final nm = (i['name']?.toString() ?? '');
      if (_norm(nm).contains(target) || target.contains(_norm(nm))) {
        return (i['id'] ?? i['institutionId']) as int?;
      }
    }
    // create new institution in backend
    // Try enrich from GitHub dataset if available
    Map<String, dynamic> payload;
    final webMatch = _webInstitutions.firstWhere(
      (w) => _norm(w['name']?.toString() ?? '') == target,
      orElse: () => {},
    );
    if (webMatch.isNotEmpty) {
      final domains = (webMatch['domains'] is List) ? List<String>.from(webMatch['domains']) : <String>[];
      final pages = (webMatch['web_pages'] is List) ? List<String>.from(webMatch['web_pages']) : <String>[];
      payload = {
        'name': name.trim(),
        'country': (webMatch['country']?.toString() ?? '').isNotEmpty ? webMatch['country'].toString() : 'Unknown',
        'domain': domains.isNotEmpty ? domains.first : 'unknown',
        'website': pages.isNotEmpty ? pages.first : 'https://unknown.example',
      };
    } else {
      payload = {
        'name': name.trim(),
        'country': 'Unknown',
        'domain': 'unknown',
        'website': 'https://unknown.example',
      };
    }
    final created = await ApiInstitutionService.createInstitution(payload);
    final newId = created['id'] ?? created['institutionId'];
    if (newId is int) {
      // update caches
      _institutions.add({'id': newId, 'name': name.trim()});
      _institutionMap[newId] = name.trim();
      return newId;
    }
    return null;
  }

  Future<void> _bootstrap() async {
    try {
      final cu = await ApiUserService.getCurrentUser();
      // load levels for educations
      final levels = await ApiLevelService.fetchLevelsList();
      // load institutions for selection/resolution
      final institutions = await ApiInstitutionService.fetchInstitutionsList();

      setState(() {
        _currentUser = cu;
        _levels = levels;
        _institutions = institutions;
        _institutionMap = {
          for (final inst in institutions)
            ((inst['id'] ?? inst['institutionId']) as int): (inst['name']?.toString() ?? '')
        };
        _webInstitutions = [];
        _firstNameCtrl.text = cu['firstName']?.toString() ?? '';
        _lastNameCtrl.text = cu['lastName']?.toString() ?? '';
        _emailCtrl.text = cu['email']?.toString() ?? '';
        _phoneCtrl.text = cu['phone']?.toString() ?? '';
      });

      final role = (cu['role'] ?? '').toString().toUpperCase();
      if (role == 'APPLICANT') {
        await _loadApplicant();
      } else if (role == 'RECRUITER') {
        await _loadRecruiter();
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _loadApplicant() async {
    final ap = await ApiApplicantService.getProfile();
    final locId = ap['location']?['locationId'] ?? ap['locationId'];
    Map<String, dynamic> loc = _applicantLocation;
    if (locId != null) {
      loc = await ApiLocationService.fetchLocationDetails(
          locId is int ? locId : int.tryParse(locId.toString()) ?? 0);
    }
    final edus = await ApiApplicantService.getEducations();

    setState(() {
      _applicant = {
        'dob': ap['dob'] ?? '',
        'gender': (ap['gender'] ?? 'MALE').toString(),
        'experienceYears': ap['experienceYears'] ?? 0,
        'skills': ap['skills'] ?? '',
        'jobTitle': ap['jobTitle'] ?? '',
        'bio': ap['bio'] ?? '',
        'locationId': loc['locationId'],
      };
      _applicantLocation = {
        'locationId': loc['locationId'],
        'province': loc['province'] ?? '',
        'district': loc['district'] ?? '',
        'address': loc['address'] ?? '',
        'notes': loc['notes'] ?? '',
      };

      _dobCtrl.text = _applicant['dob']?.toString() ?? '';
      _skillsCtrl.text = _applicant['skills']?.toString() ?? '';
      _jobTitleCtrl.text = _applicant['jobTitle']?.toString() ?? '';
      _bioApplicantCtrl.text = _applicant['bio']?.toString() ?? '';
      _expYearsCtrl.text = (_applicant['experienceYears'] ?? 0).toString();
      _alProvince.text = _applicantLocation['province'] ?? '';
      _alDistrict.text = _applicantLocation['district'] ?? '';
      _alAddress.text = _applicantLocation['address'] ?? '';
      _alNotes.text = _applicantLocation['notes'] ?? '';

      _educations = edus.map<Map<String, dynamic>>((e) {
        final level = e['level'];
        final inst = e['institution'];
        return {
          'educationId': e['educationId'] ?? e['id'],
          'title': e['title'] ?? '',
          'year': e['year']?.toString() ?? '',
          'levelId':
              level is Map ? (level['levelId'] ?? level['id']) : e['levelId'],
          'institutionId': inst is Map
              ? (inst['id'] ?? inst['institutionId'])
              : (e['institutionId'] ?? ''),
          'institutionName':
              inst is Map ? (inst['name'] ?? '') : (e['institutionName'] ?? ''),
        };
      }).toList();
    });
  }

  Future<void> _loadRecruiter() async {
    final rp = await ApiRecruiterService.getProfile();
    final locId = rp['location']?['locationId'] ?? rp['locationId'];
    Map<String, dynamic> loc = _recruiterLocation;
    if (locId != null) {
      loc = await ApiLocationService.fetchLocationDetails(
          locId is int ? locId : int.tryParse(locId.toString()) ?? 0);
    }
    setState(() {
      _recruiter = {
        'companyName': rp['companyName'] ?? '',
        'bio': rp['bio'] ?? '',
        'companyWebsite': rp['companyWebsite'] ?? '',
        'position': rp['position'] ?? '',
        'logoUrl': rp['logoUrl'] ?? '',
        'locationId': loc['locationId'],
      };
      _recruiterLocation = {
        'locationId': loc['locationId'],
        'province': loc['province'] ?? '',
        'district': loc['district'] ?? '',
        'address': loc['address'] ?? '',
        'notes': loc['notes'] ?? '',
      };

      _companyNameCtrl.text = _recruiter['companyName'] ?? '';
      _companyWebsiteCtrl.text = _recruiter['companyWebsite'] ?? '';
      _positionCtrl.text = _recruiter['position'] ?? '';
      _logoUrlCtrl.text = _recruiter['logoUrl'] ?? '';
      _bioRecruiterCtrl.text = _recruiter['bio'] ?? '';
      _rlProvince.text = _recruiterLocation['province'] ?? '';
      _rlDistrict.text = _recruiterLocation['district'] ?? '';
      _rlAddress.text = _recruiterLocation['address'] ?? '';
      _rlNotes.text = _recruiterLocation['notes'] ?? '';
    });
  }

  @override
  void dispose() {
    // dispose controllers
    for (final c in [
      _firstNameCtrl,
      _lastNameCtrl,
      _emailCtrl,
      _phoneCtrl,
      _dobCtrl,
      _skillsCtrl,
      _jobTitleCtrl,
      _bioApplicantCtrl,
      _expYearsCtrl,
      _alProvince,
      _alDistrict,
      _alAddress,
      _alNotes,
      _companyNameCtrl,
      _companyWebsiteCtrl,
      _positionCtrl,
      _logoUrlCtrl,
      _bioRecruiterCtrl,
      _rlProvince,
      _rlDistrict,
      _rlAddress,
      _rlNotes,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _onSave() async {
    FocusScope.of(context).unfocus();
    setState(() => _loading = true);
    try {
      final role = (_currentUser?['role'] ?? '').toString().toUpperCase();

      if (role == 'APPLICANT') {
        // handle location create/update
        final hasAddr = _alProvince.text.isNotEmpty &&
            _alDistrict.text.isNotEmpty &&
            _alAddress.text.isNotEmpty;
        final rawId = _applicantLocation['locationId'];
        final parsedId =
            rawId is int ? rawId : int.tryParse(rawId?.toString() ?? '');
        if (hasAddr) {
          if (parsedId != null && parsedId > 0) {
            // Preflight: ensure the location exists, otherwise create
            bool exists = true;
            try {
              await ApiLocationService.fetchLocationDetails(parsedId);
            } catch (_) {
              exists = false;
            }
            if (exists) {
              try {
                await ApiLocationService.updateLocation(parsedId, {
                  'locationId': parsedId,
                  'province': _alProvince.text,
                  'district': _alDistrict.text,
                  'address': _alAddress.text,
                  'notes': _alNotes.text,
                });
              } catch (e) {
                // Only fallback to create if Not Found (404). Otherwise rethrow to surface the error.
                final msg = e.toString();
                if (msg.contains('404')) {
                  final created = await ApiLocationService.createLocation({
                    'province': _alProvince.text,
                    'district': _alDistrict.text,
                    'address': _alAddress.text,
                    'notes': _alNotes.text,
                  });
                  final newId = created['locationId'] ?? created['id'];
                  if (newId != null) {
                    _applicantLocation['locationId'] = newId;
                  }
                } else {
                  rethrow;
                }
              }
            } else {
              final created = await ApiLocationService.createLocation({
                'province': _alProvince.text,
                'district': _alDistrict.text,
                'address': _alAddress.text,
                'notes': _alNotes.text,
              });
              final newId = created['locationId'] ?? created['id'];
              if (newId != null) {
                _applicantLocation['locationId'] = newId;
              }
            }
          } else {
            final created = await ApiLocationService.createLocation({
              'province': _alProvince.text,
              'district': _alDistrict.text,
              'address': _alAddress.text,
              'notes': _alNotes.text,
            });
            final newId = created['locationId'] ?? created['id'];
            if (newId != null) {
              _applicantLocation['locationId'] = newId;
            }
          }
        }

        // update applicant profile
        final applicantData = {
          'dob': _dobCtrl.text,
          'gender': _applicant['gender'],
          'experienceYears': int.tryParse(_expYearsCtrl.text) ?? 0,
          'skills': _skillsCtrl.text,
          'jobTitle': _jobTitleCtrl.text,
          'bio': _bioApplicantCtrl.text,
          'locationId': _applicantLocation['locationId'],
        };
        await ApiApplicantService.updateProfile(applicantData);

        // sync educations
        // delete removed
        for (final id in _deletedEducationIds) {
          await ApiApplicantService.deleteEducation(id);
        }

        // upsert
        final uidRaw = _currentUser?['userId'];
        final uid =
            uidRaw is int ? uidRaw : int.tryParse(uidRaw?.toString() ?? '');
        final List<Map<String, dynamic>> toCreate = [];
        for (final e in _educations) {
          final title = (e['title'] ?? '').toString();
          final year = int.tryParse((e['year'] ?? '').toString());
          final levelId = int.tryParse((e['levelId'] ?? '').toString());
          int? institutionId = int.tryParse((e['institutionId'] ?? '').toString());
          if (institutionId == null) {
            // try resolve by name
            final name = (e['institutionName'] ?? '').toString();
            institutionId = await _resolveInstitutionIdByName(name);
          }
          if (title.isEmpty || year == null || levelId == null || institutionId == null) continue;
          if (uid == null) continue; // cannot send education without userId

          final eduId = e['educationId'];
          final payload = {
            'title': title,
            'year': year,
            'levelId': levelId,
            'institutionId': institutionId,
            'userId': uid,
          };
          if (eduId != null) {
            await ApiApplicantService.updateEducation(
              eduId is int ? eduId : int.tryParse(eduId.toString()) ?? 0,
              payload,
            );
          } else {
            toCreate.add(payload);
          }
        }
        if (toCreate.isNotEmpty) {
          await ApiApplicantService.addEducations(toCreate);
        }
      } else if (role == 'RECRUITER') {
        // handle location create/update
        final hasAddr = _rlProvince.text.isNotEmpty &&
            _rlDistrict.text.isNotEmpty &&
            _rlAddress.text.isNotEmpty;
        final rawId = _recruiterLocation['locationId'];
        final parsedId =
            rawId is int ? rawId : int.tryParse(rawId?.toString() ?? '');
        if (hasAddr) {
          if (parsedId != null && parsedId > 0) {
            // Preflight: ensure the location exists, otherwise create
            bool exists = true;
            try {
              await ApiLocationService.fetchLocationDetails(parsedId);
            } catch (_) {
              exists = false;
            }
            if (exists) {
              try {
                await ApiLocationService.updateLocation(parsedId, {
                  'locationId': parsedId,
                  'province': _rlProvince.text,
                  'district': _rlDistrict.text,
                  'address': _rlAddress.text,
                  'notes': _rlNotes.text,
                });
              } catch (e) {
                // Only fallback to create if Not Found (404). Otherwise rethrow to surface the error.
                final msg = e.toString();
                if (msg.contains('404')) {
                  final created = await ApiLocationService.createLocation({
                    'province': _rlProvince.text,
                    'district': _rlDistrict.text,
                    'address': _rlAddress.text,
                    'notes': _rlNotes.text,
                  });
                  final newId = created['locationId'] ?? created['id'];
                  if (newId != null) {
                    _recruiterLocation['locationId'] = newId;
                  }
                } else {
                  rethrow;
                }
              }
            } else {
              final created = await ApiLocationService.createLocation({
                'province': _rlProvince.text,
                'district': _rlDistrict.text,
                'address': _rlAddress.text,
                'notes': _rlNotes.text,
              });
              final newId = created['locationId'] ?? created['id'];
              if (newId != null) {
                _recruiterLocation['locationId'] = newId;
              }
            }
          } else {
            final created = await ApiLocationService.createLocation({
              'province': _rlProvince.text,
              'district': _rlDistrict.text,
              'address': _rlAddress.text,
              'notes': _rlNotes.text,
            });
            final newId = created['locationId'] ?? created['id'];
            if (newId != null) {
              _recruiterLocation['locationId'] = newId;
            }
          }
        }

        // update recruiter profile
        await ApiRecruiterService.updateProfile({
          'companyName': _companyNameCtrl.text,
          'companyWebsite': _companyWebsiteCtrl.text,
          'position': _positionCtrl.text,
          'logoUrl': _logoUrlCtrl.text,
          'bio': _bioRecruiterCtrl.text,
          'locationId': _recruiterLocation['locationId'],
        });
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cập nhật thành công!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Cập nhật thất bại: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final role = (_currentUser?['role'] ?? '').toString().toUpperCase();
    return Scaffold(
      resizeToAvoidBottomInset: true,
      appBar: AppBar(title: const Text('Cập nhật hồ sơ')),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.08),
                blurRadius: 12,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              onPressed: _loading ? null : _onSave,
              icon: const Icon(Icons.save),
              label: Text(_loading ? 'Đang lưu...' : 'Lưu thay đổi'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.indigo,
                foregroundColor: Colors.white,
                textStyle: const TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Lỗi: $_error'))
              : LayoutBuilder(
                  builder: (context, constraints) {
                    return SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(16, 20, 16, 120),
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 900),
                          child: Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  Colors.blue.shade50,
                                  Colors.white,
                                  Colors.blue.shade50,
                                ],
                              ),
                              borderRadius: BorderRadius.circular(32),
                              border: Border.all(color: Colors.blue.shade200),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.blue.shade100.withOpacity(0.6),
                                  blurRadius: 30,
                                  offset: const Offset(0, 16),
                                )
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // Modern hero header
                                _buildHeroHeader(),
                                const SizedBox(height: 8),

                                // Common user fields
                                _sectionCard(
                                  title: 'Thông tin chung',
                                  icon: Icons.person,
                                  children: [
                                    LayoutBuilder(builder: (context, c) {
                                      return Wrap(
                                        spacing: 16,
                                        runSpacing: 12,
                                        children: [
                                          SizedBox(
                                            width: constraints.maxWidth > 700
                                                ? (c.maxWidth - 16) / 2
                                                : c.maxWidth,
                                            child: _labeledField(
                                              label: 'Email',
                                              controller: _emailCtrl,
                                              hint: 'Email',
                                              keyboardType:
                                                  TextInputType.emailAddress,
                                            ),
                                          ),
                                          SizedBox(
                                            width: constraints.maxWidth > 700
                                                ? (c.maxWidth - 16) / 2
                                                : c.maxWidth,
                                            child: _labeledField(
                                              label: 'Họ',
                                              controller: _firstNameCtrl,
                                              hint: 'Họ',
                                            ),
                                          ),
                                          SizedBox(
                                            width: constraints.maxWidth > 700
                                                ? (c.maxWidth - 16) / 2
                                                : c.maxWidth,
                                            child: _labeledField(
                                              label: 'Tên',
                                              controller: _lastNameCtrl,
                                              hint: 'Tên',
                                            ),
                                          ),
                                          SizedBox(
                                            width: constraints.maxWidth > 700
                                                ? (c.maxWidth - 16) / 2
                                                : c.maxWidth,
                                            child: _labeledField(
                                              label: 'Số điện thoại',
                                              controller: _phoneCtrl,
                                              hint: 'Số điện thoại',
                                              keyboardType: TextInputType.phone,
                                            ),
                                          ),
                                        ],
                                      );
                                    }),
                                  ],
                                ),

                                // Applicant section
                                if (role == 'APPLICANT') ...[
                                  _sectionCard(
                                    title: 'Thông Tin Ứng Viên',
                                    icon: Icons.badge,
                                    children: [
                                      LayoutBuilder(builder: (context, c) {
                                        final isWide =
                                            constraints.maxWidth > 700;
                                        return Wrap(
                                          spacing: 16,
                                          runSpacing: 12,
                                          children: [
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 16) / 2
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                label: 'Ngày sinh',
                                                controller: _dobCtrl,
                                                hint: 'YYYY-MM-DD',
                                                readOnly: true,
                                                onTap: () async {
                                                  final now = DateTime.now();
                                                  final first = DateTime(1950);
                                                  final initial = _dobCtrl
                                                          .text.isNotEmpty
                                                      ? DateTime.tryParse(
                                                              _dobCtrl.text) ??
                                                          DateTime(
                                                              now.year - 18)
                                                      : DateTime(now.year - 18);
                                                  final picked =
                                                      await showDatePicker(
                                                    context: context,
                                                    initialDate:
                                                        initial.isBefore(now)
                                                            ? initial
                                                            : DateTime(
                                                                now.year - 18),
                                                    firstDate: first,
                                                    lastDate: now,
                                                    helpText: 'Chọn ngày sinh',
                                                  );
                                                  if (picked != null) {
                                                    _dobCtrl.text =
                                                        DateFormat('yyyy-MM-dd')
                                                            .format(picked);
                                                  }
                                                },
                                              ),
                                            ),
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 16) / 2
                                                  : c.maxWidth,
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  const Text('Giới tính',
                                                      style: TextStyle(
                                                          fontWeight:
                                                              FontWeight.w600,
                                                          color: Colors.black54,
                                                          fontSize: 12)),
                                                  const SizedBox(height: 6),
                                                  DropdownButtonFormField<
                                                      String>(
                                                    value:
                                                        (_applicant['gender'] ??
                                                                'MALE')
                                                            .toString(),
                                                    decoration: InputDecoration(
                                                      filled: true,
                                                      fillColor: Colors.white,
                                                      contentPadding:
                                                          const EdgeInsets
                                                              .symmetric(
                                                              horizontal: 14,
                                                              vertical: 12),
                                                      enabledBorder:
                                                          OutlineInputBorder(
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(14),
                                                        borderSide: BorderSide(
                                                            color: Colors
                                                                .blue.shade200,
                                                            width: 2),
                                                      ),
                                                      focusedBorder:
                                                          OutlineInputBorder(
                                                        borderRadius:
                                                            BorderRadius
                                                                .circular(14),
                                                        borderSide: BorderSide(
                                                            color: Colors
                                                                .blue.shade400,
                                                            width: 2),
                                                      ),
                                                    ),
                                                    items: const [
                                                      DropdownMenuItem(
                                                          value: 'MALE',
                                                          child: Text('Nam')),
                                                      DropdownMenuItem(
                                                          value: 'FEMALE',
                                                          child: Text('Nữ')),
                                                    ],
                                                    onChanged: (v) => setState(
                                                        () => _applicant[
                                                                'gender'] =
                                                            v ?? 'MALE'),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 16) / 2
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                label: 'Số năm kinh nghiệm',
                                                controller: _expYearsCtrl,
                                                hint: 'Số năm kinh nghiệm',
                                                keyboardType:
                                                    TextInputType.number,
                                              ),
                                            ),
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 16) / 2
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                label: 'Vị trí mong muốn',
                                                controller: _jobTitleCtrl,
                                                hint: 'Vị trí mong muốn',
                                              ),
                                            ),
                                            SizedBox(
                                              width: c.maxWidth,
                                              child: _labeledField(
                                                label: 'Kỹ năng',
                                                controller: _skillsCtrl,
                                                hint: 'Kỹ năng',
                                                maxLines: 3,
                                              ),
                                            ),
                                            SizedBox(
                                              width: c.maxWidth,
                                              child: _labeledField(
                                                label: 'Giới thiệu bản thân',
                                                controller: _bioApplicantCtrl,
                                                hint: 'Giới thiệu bản thân',
                                                maxLines: 4,
                                              ),
                                            ),
                                          ],
                                        );
                                      }),
                                      const SizedBox(height: 8),
                                      const Divider(),
                                      const SizedBox(height: 8),
                                      const Text('Thông tin địa chỉ',
                                          style: TextStyle(
                                              fontWeight: FontWeight.w600)),
                                      const SizedBox(height: 8),
                                      LayoutBuilder(builder: (context, c) {
                                        final isWide =
                                            constraints.maxWidth > 700;
                                        return Wrap(
                                          spacing: 16,
                                          runSpacing: 12,
                                          children: [
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 32) / 3
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Tỉnh/Thành phố',
                                                  controller: _alProvince,
                                                  hint: 'Ví dụ: Hà Nội'),
                                            ),
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 32) / 3
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Quận/Huyện',
                                                  controller: _alDistrict,
                                                  hint: 'Ví dụ: Cầu Giấy'),
                                            ),
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 32) / 3
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Địa chỉ chi tiết',
                                                  controller: _alAddress,
                                                  hint: 'Ví dụ: 123 Đường ABC'),
                                            ),
                                            SizedBox(
                                              width: c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Ghi chú',
                                                  controller: _alNotes,
                                                  hint:
                                                      'Ghi chú về địa chỉ (tùy chọn)',
                                                  maxLines: 3),
                                            ),
                                          ],
                                        );
                                      }),
                                    ],
                                  ),
                                  _sectionCard(
                                    title: 'Học vấn',
                                    icon: Icons.school,
                                    children: [
                                      if (_levels.isEmpty)
                                        Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                              color: Colors.grey.shade100,
                                              borderRadius:
                                                  BorderRadius.circular(8)),
                                          child: const Text(
                                              'Debug: Levels loaded: 0 items',
                                              style: TextStyle(fontSize: 12)),
                                        )
                                      else
                                        Container(
                                          padding: const EdgeInsets.all(8),
                                          decoration: BoxDecoration(
                                              color: Colors.grey.shade100,
                                              borderRadius:
                                                  BorderRadius.circular(8)),
                                          child: Text(
                                              'Debug: Levels loaded: ${_levels.length} items',
                                              style: const TextStyle(
                                                  fontSize: 12)),
                                        ),
                                      const SizedBox(height: 8),
                                      ...List.generate(_educations.length,
                                          (idx) {
                                        final edu = _educations[idx];
                                        return Container(
                                          margin:
                                              const EdgeInsets.only(bottom: 12),
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            color: Colors.white,
                                            border: Border.all(
                                                color: Colors.blue.shade100,
                                                width: 2),
                                            borderRadius:
                                                BorderRadius.circular(18),
                                            boxShadow: [
                                              BoxShadow(
                                                  color: Colors.blue.shade50,
                                                  blurRadius: 8,
                                                  offset: const Offset(0, 4)),
                                            ],
                                          ),
                                          child: Stack(
                                            children: [
                                              Column(
                                                children: [
                                                  LayoutBuilder(
                                                      builder: (context, c) {
                                                    final isWide =
                                                        constraints.maxWidth >
                                                            700;
                                                    return Wrap(
                                                      spacing: 12,
                                                      runSpacing: 10,
                                                      children: [
                                                        SizedBox(
                                                          width: isWide
                                                              ? (c.maxWidth -
                                                                      12) /
                                                                  2
                                                              : c.maxWidth,
                                                          child: _inputBase(
                                                            label:
                                                                'Tên bằng cấp',
                                                            value: edu['title']
                                                                    ?.toString() ??
                                                                '',
                                                            onChanged: (v) =>
                                                                _updateEducation(
                                                                    idx,
                                                                    'title',
                                                                    v),
                                                          ),
                                                        ),
                                                        SizedBox(
                                                          width: isWide
                                                              ? (c.maxWidth -
                                                                      12) /
                                                                  2
                                                              : c.maxWidth,
                                                          child: _inputBase(
                                                            label: 'Năm',
                                                            value: edu['year']
                                                                    ?.toString() ??
                                                                '',
                                                            keyboardType:
                                                                TextInputType
                                                                    .number,
                                                            onChanged: (v) =>
                                                                _updateEducation(
                                                                    idx,
                                                                    'year',
                                                                    v),
                                                          ),
                                                        ),
                                                        SizedBox(
                                                          width: isWide
                                                              ? (c.maxWidth -
                                                                      12) /
                                                                  2
                                                              : c.maxWidth,
                                                          child: _dropdownBase(
                                                            label: 'Bậc học',
                                                            value:
                                                                (edu['levelId'] ??
                                                                        '')
                                                                    .toString(),
                                                            items: [
                                                              const DropdownMenuItem(
                                                                  value: '',
                                                                  child: Text(
                                                                      '-- Chọn bậc học --')),
                                                              ..._levels.map((l) =>
                                                                  DropdownMenuItem(
                                                                    value: (l['levelId'] ??
                                                                            l['id'])
                                                                        .toString(),
                                                                    child: Text(
                                                                        l['name']?.toString() ??
                                                                            ''),
                                                                  )),
                                                            ],
                                                            onChanged: (v) =>
                                                                _updateEducation(
                                                                    idx,
                                                                    'levelId',
                                                                    v ?? ''),
                                                          ),
                                                        ),
                                                        SizedBox(
                                                          width: isWide
                                                              ? (c.maxWidth -
                                                                      12) /
                                                                  2
                                                              : c.maxWidth,
                                                          child: Row(
                                                            children: [
                                                              Expanded(
                                                                child: _pickerField(
                                                                  label: 'Trường (tên) - chọn từ danh sách',
                                                                  value: (edu['institutionName'] ?? '').toString(),
                                                                  onTap: () => _openInstitutionPicker(idx),
                                                                ),
                                                              ),
                                                              const SizedBox(width: 8),
                                                              Tooltip(
                                                                message: 'Cập nhật từ GitHub',
                                                                child: IconButton(
                                                                  onPressed: () => _refreshInstitutionFromGitHub(idx),
                                                                  icon: const Icon(Icons.sync),
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                        ),
                                                      ],
                                                    );
                                                  }),
                                                ],
                                              ),
                                              if (_educations.length > 1)
                                                Positioned(
                                                  right: -6,
                                                  top: -6,
                                                  child: IconButton(
                                                    tooltip: 'Xóa học vấn',
                                                    icon: const Icon(
                                                        Icons.close,
                                                        color: Colors.red),
                                                    onPressed: () =>
                                                        _removeEducation(idx),
                                                  ),
                                                ),
                                            ],
                                          ),
                                        );
                                      }),
                                      Align(
                                        alignment: Alignment.centerLeft,
                                        child: TextButton.icon(
                                          onPressed: _addEducation,
                                          icon: const Icon(Icons.add),
                                          label: const Text('Thêm học vấn'),
                                          style: TextButton.styleFrom(
                                              foregroundColor:
                                                  Colors.blue.shade700),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],

                                // Recruiter section
                                if (role == 'RECRUITER')
                                  _sectionCard(
                                    title: 'Thông Tin Nhà Tuyển Dụng',
                                    icon: Icons.business_center,
                                    children: [
                                      LayoutBuilder(builder: (context, c) {
                                        final isWide =
                                            constraints.maxWidth > 700;
                                        return Wrap(
                                          spacing: 16,
                                          runSpacing: 12,
                                          children: [
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 16) / 2
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Tên công ty',
                                                  controller: _companyNameCtrl,
                                                  hint: 'Tên công ty'),
                                            ),
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 16) / 2
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Website công ty',
                                                  controller:
                                                      _companyWebsiteCtrl,
                                                  hint: 'Website công ty'),
                                            ),
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 16) / 2
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Vị trí',
                                                  controller: _positionCtrl,
                                                  hint: 'Vị trí'),
                                            ),
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 16) / 2
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Logo URL',
                                                  controller: _logoUrlCtrl,
                                                  hint: 'Logo URL'),
                                            ),
                                            SizedBox(
                                              width: c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Giới thiệu công ty',
                                                  controller: _bioRecruiterCtrl,
                                                  hint: 'Giới thiệu công ty',
                                                  maxLines: 4),
                                            ),
                                          ],
                                        );
                                      }),
                                      const SizedBox(height: 8),
                                      const Divider(),
                                      const SizedBox(height: 8),
                                      const Text('Thông tin địa chỉ',
                                          style: TextStyle(
                                              fontWeight: FontWeight.w600)),
                                      const SizedBox(height: 8),
                                      LayoutBuilder(builder: (context, c) {
                                        final isWide =
                                            constraints.maxWidth > 700;
                                        return Wrap(
                                          spacing: 16,
                                          runSpacing: 12,
                                          children: [
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 32) / 3
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Tỉnh/Thành phố',
                                                  controller: _rlProvince,
                                                  hint: 'Ví dụ: Hà Nội'),
                                            ),
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 32) / 3
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Quận/Huyện',
                                                  controller: _rlDistrict,
                                                  hint: 'Ví dụ: Cầu Giấy'),
                                            ),
                                            SizedBox(
                                              width: isWide
                                                  ? (c.maxWidth - 32) / 3
                                                  : c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Địa chỉ chi tiết',
                                                  controller: _rlAddress,
                                                  hint: 'Ví dụ: 123 Đường ABC'),
                                            ),
                                            SizedBox(
                                              width: c.maxWidth,
                                              child: _labeledField(
                                                  label: 'Ghi chú',
                                                  controller: _rlNotes,
                                                  hint:
                                                      'Ghi chú về địa chỉ (tùy chọn)',
                                                  maxLines: 3),
                                            ),
                                          ],
                                        );
                                      }),
                                    ],
                                  ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
    );
  }

  // Small base input/dropdown used in education tiles
  Widget _inputBase(
      {required String label,
      String? value,
      String? hint,
      TextInputType? keyboardType,
      ValueChanged<String>? onChanged}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.black54,
                fontSize: 12)),
        const SizedBox(height: 6),
        TextFormField(
          initialValue: value,
          onChanged: onChanged,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: hint,
            filled: true,
            fillColor: Colors.white,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.blue.shade200, width: 2),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.blue.shade400, width: 2),
            ),
          ),
        ),
      ],
    );
  }

  Widget _dropdownBase({
    required String label,
    required String value,
    required List<DropdownMenuItem<String>> items,
    ValueChanged<String?>? onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.black54,
                fontSize: 12)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: value.isEmpty ? null : value,
          items: items,
          onChanged: onChanged,
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.blue.shade200, width: 2),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.blue.shade400, width: 2),
            ),
          ),
        ),
      ],
    );
  }

  // Read-only picker field to open a selector bottom sheet
  Widget _pickerField({
    required String label,
    required String value,
    VoidCallback? onTap,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.black54,
                fontSize: 12)),
        const SizedBox(height: 6),
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.blue.shade200, width: 2),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    value.isEmpty ? 'Chọn...' : value,
                    style: TextStyle(
                      color: value.isEmpty ? Colors.black38 : Colors.black87,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const Icon(Icons.arrow_drop_down, color: Colors.blueGrey),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _openInstitutionPicker(int eduIndex) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) {
        final searchCtrl = TextEditingController();
        List<Map<String, dynamic>> filtered = [];
        bool isLoading = false;
        Timer? debounce;
        bool inited = false;

        List<Map<String, dynamic>> buildMerged(String query) {
          final backendNames = _institutions
              .map((e) => (e['name']?.toString() ?? ''))
              .where((e) => e.isNotEmpty)
              .toList();
          final Set<String> seen = backendNames.map((e) => _norm(e)).toSet();
          final merged = [
            ..._institutions.map((e) => {
                  'name': e['name']?.toString() ?? '',
                  'id': e['id'] ?? e['institutionId'],
                  'source': 'backend',
                }),
            ..._webInstitutions
                .where((w) => !seen.contains(_norm(w['name']?.toString() ?? '')))
                .map((w) => {
                      'name': w['name']?.toString() ?? '',
                      'country': w['country']?.toString(),
                      'source': 'web',
                    })
          ];
          // filter by query
          final k = _norm(query);
          final list = k.isEmpty
              ? merged
              : merged
                  .where((e) => _norm(e['name']?.toString() ?? '').contains(k))
                  .toList();
          // sort: startsWith first
          list.sort((a, b) {
            final an = _norm(a['name']?.toString() ?? '');
            final bn = _norm(b['name']?.toString() ?? '');
            final aStarts = an.startsWith(k);
            final bStarts = bn.startsWith(k);
            if (aStarts != bStarts) return aStarts ? -1 : 1;
            return an.compareTo(bn);
          });
          // limit size only when there is a query; otherwise allow full scrollable list
          if (k.isEmpty) return list;
          return list.take(100).toList();
        }

        return StatefulBuilder(builder: (ctx, setS) {
          Future<void> ensureWebData() async {
            if (_webInstitutions.isNotEmpty) return;
            setS(() => isLoading = true);
            try {
              // One-time fetch of entire dataset, cached in state
              final web = await ApiInstitutionService.fetchUniversitiesFromGitHub();
              setState(() => _webInstitutions = web);
            } catch (_) {
              // ignore errors, keep backend list usable
            } finally {
              setS(() => isLoading = false);
              // refresh filtered after load
              setS(() => filtered = buildMerged(searchCtrl.text));
            }
          }

          void applyFilter(String q) {
            debounce?.cancel();
            debounce = Timer(const Duration(milliseconds: 350), () async {
              setS(() => filtered = buildMerged(q));
            });
          }

          // one-time init when sheet opens
          if (!inited) {
            inited = true;
            // initial list from backend while web loads
            filtered = buildMerged('');
            // start loading web dataset
            // ignore: discarded_futures
            ensureWebData();
          }

          return SafeArea(
            child: Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom,
                top: 12,
                left: 12,
                right: 12,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 48,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2)),
                  ),
                  TextField(
                    controller: searchCtrl,
                    onChanged: applyFilter,
                    decoration: InputDecoration(
                      hintText: 'Tìm kiếm trường... ',
                      prefixIcon: const Icon(Icons.search),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  if (isLoading) const LinearProgressIndicator(minHeight: 2),
                  Flexible(
                    child: ListView.separated(
                      shrinkWrap: true,
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (ctx, i) {
                        final item = filtered[i];
                        final name = (item['name'] ?? '').toString();
                        final src = (item['source'] ?? '').toString();
                        final subtitle = src == 'web'
                            ? (item['country']?.toString() ?? 'Web dataset')
                            : 'Trong hệ thống';
                        return ListTile(
                          title: Text(name),
                          subtitle: Text(subtitle),
                          onTap: () {
                            // update selection
                            setState(() {
                              _educations[eduIndex]['institutionName'] = name;
                              final backendMatch = _institutions.firstWhere(
                                  (e) => _norm(e['name']?.toString() ?? '') == _norm(name),
                                  orElse: () => {});
                              final bid = backendMatch.isEmpty
                                  ? null
                                  : (backendMatch['id'] ?? backendMatch['institutionId']);
                              if (bid is int) {
                                _educations[eduIndex]['institutionId'] = bid;
                              } else {
                                _educations[eduIndex]['institutionId'] = '';
                              }
                            });
                            Navigator.of(ctx).pop();
                          },
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          );
        });
      },
    );
  }

  Future<void> _refreshInstitutionFromGitHub(int eduIndex) async {
    final currentName = (_educations[eduIndex]['institutionName'] ?? '').toString().trim();
    if (currentName.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn/tìm tên trường trước.')),
      );
      return;
    }
    try {
      final web = await ApiInstitutionService.fetchUniversitiesFromGitHub();
      setState(() => _webInstitutions = web);
      final target = _norm(currentName);
      final match = web.firstWhere(
        (w) => _norm(w['name']?.toString() ?? '') == target,
        orElse: () => {},
      );
      if (match.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Không tìm thấy trường khớp trong GitHub.')),
        );
        return;
      }

      // Check in backend cache
      final existing = _institutions.firstWhere(
        (i) => _norm(i['name']?.toString() ?? '') == target,
        orElse: () => {},
      );

      if (existing.isEmpty) {
        // Create new in backend with enriched fields from GitHub match
        final domains = (match['domains'] is List)
            ? List<String>.from(match['domains'])
            : <String>[];
        final pages = (match['web_pages'] is List)
            ? List<String>.from(match['web_pages'])
            : <String>[];
        final payload = {
          'name': currentName,
          'country': (match['country']?.toString() ?? '').isNotEmpty
              ? match['country'].toString()
              : 'Unknown',
          'domain': domains.isNotEmpty ? domains.first : 'unknown',
          'website': pages.isNotEmpty ? pages.first : 'https://unknown.example',
        };
        final created = await ApiInstitutionService.createInstitution(payload);
        final newId = created['id'] ?? created['institutionId'];
        if (newId is int) {
          setState(() {
            _institutions.add({'id': newId, 'name': currentName});
            _institutionMap[newId] = currentName;
            _educations[eduIndex]['institutionId'] = newId;
            _educations[eduIndex]['institutionName'] = currentName;
          });
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Đã tạo trường mới trong hệ thống.')),
          );
        }
      } else {
        // Link to existing
        final eid = existing['id'] ?? existing['institutionId'];
        setState(() {
          if (eid is int) _educations[eduIndex]['institutionId'] = eid;
          _educations[eduIndex]['institutionName'] = existing['name']?.toString() ?? currentName;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Đã đồng bộ với bản ghi trong hệ thống.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi cập nhật từ GitHub: $e')),
      );
    }
  }
}
