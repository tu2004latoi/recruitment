import 'package:flutter/material.dart';
import 'package:recruitment_app/pages/application_page.dart';
import 'package:recruitment_app/pages/profile_page.dart';
import 'package:recruitment_app/pages/login_page.dart';
import 'package:recruitment_app/pages/favorites_page.dart';
import 'package:recruitment_app/pages/recruiter_statistic_page.dart';
import 'package:recruitment_app/services/api_user_service.dart';
import 'package:recruitment_app/pages/interviews_page.dart';
import 'package:recruitment_app/pages/my_jobs_page.dart';
import 'package:recruitment_app/pages/recruiter_applications_page.dart';

class AccountPage extends StatelessWidget {
  const AccountPage({super.key});

  Future<void> _logout(BuildContext context) async {
    await ApiUserService.logout();
    if (context.mounted) {
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const LoginPage()),
        (route) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hồ sơ')),
      body: FutureBuilder<Map<String, dynamic>>(
        future: ApiUserService.getCurrentUser(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          String role = (snapshot.data?['role'] ?? '').toString().toUpperCase();

          // Common: profile tile
          final profileTile = Column(
            children: [
              const SizedBox(height: 8),
              ListTile(
                leading: const Icon(Icons.person),
                title: const Text('Thông tin cá nhân'),
                subtitle: const Text('Xem và chỉnh sửa hồ sơ của bạn'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ProfilePage()),
                ),
              ),
              const Divider(height: 1),
            ],
          );

          // Common: logout tile
          final logoutTile = Column(
            children: [
              const SizedBox(height: 8),
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.redAccent),
                title: const Text('Đăng xuất',
                    style: TextStyle(color: Colors.redAccent)),
                onTap: () async {
                  final ok = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      title: const Text('Xác nhận'),
                      content: const Text('Bạn có chắc chắn muốn đăng xuất?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(ctx).pop(false),
                          child: const Text('Hủy'),
                        ),
                        FilledButton(
                          onPressed: () => Navigator.of(ctx).pop(true),
                          child: const Text('Đăng xuất'),
                        ),
                      ],
                    ),
                  );
                  if (ok == true) {
                    await _logout(context);
                  }
                },
              ),
            ],
          );

          if (role == 'RECRUITER') {
            // Replace the 3 middle items with recruiter-specific ones
            return ListView(
              children: [
                profileTile,
                ListTile(
                  leading: const Icon(Icons.work_outline),
                  title: const Text('Công việc của tôi'),
                  subtitle: const Text('Danh sách tin tuyển dụng của bạn'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const MyJobsPage()),
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.assignment_turned_in_outlined),
                  title: const Text('Quản lý đơn ứng tuyển'),
                  subtitle: const Text('Theo dõi và xử lý ứng tuyển'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const RecruiterApplicationsPage()),
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.query_stats),
                  title: const Text('Thống kê'),
                  subtitle: const Text('Số liệu và biểu đồ tuyển dụng'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const RecruiterStatisticPage()),
                  ),
                ),
                const Divider(height: 1),
                logoutTile,
              ],
            );
          }

          // Default/APPLICANT: keep existing items
          return ListView(
            children: [
              profileTile,
              ListTile(
                leading: const Icon(Icons.favorite_border),
                title: const Text('Công việc yêu thích'),
                subtitle: const Text('Danh sách việc làm đã lưu'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const FavoritesPage()),
                ),
              ),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.work),
                title: const Text('Công việc đã ứng tuyển'),
                subtitle: const Text('Danh sách việc làm đã ứng tuyển'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const ApplicationPage()),
                ),
              ),
              const Divider(height: 1),
              ListTile(
                leading: const Icon(Icons.event_note),
                title: const Text('Lịch phỏng vấn'),
                subtitle: const Text('Các lịch phỏng vấn của bạn'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const InterviewsPage()),
                ),
              ),
              const Divider(height: 1),
              logoutTile,
            ],
          );
        },
      ),
    );
  }
}
