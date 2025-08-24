import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:http/http.dart' as http;
import 'package:recruitment_app/services/api_statistics_service.dart';

class RecruiterStatisticPage extends StatefulWidget {
  const RecruiterStatisticPage({super.key});

  @override
  State<RecruiterStatisticPage> createState() => _RecruiterStatisticPageState();
}

class _JobsDistributionPie extends StatelessWidget {
  final Map<String, dynamic> jobStats;
  const _JobsDistributionPie({required this.jobStats});

  int _toInt(dynamic v) {
    if (v is int) return v;
    if (v is double) return v.toInt();
    if (v is String) return int.tryParse(v) ?? 0;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final total = _toInt(jobStats['totalJobs'] ?? jobStats['total']);
    final active = _toInt(jobStats['activeJobs'] ?? jobStats['active']);
    final featured = _toInt(jobStats['featuredJobs'] ?? jobStats['featureJobs'] ?? jobStats['featured']);
    final other = (total - active - featured).clamp(0, total);

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Phân bố công việc',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            SizedBox(
              height: 240,
              child: PieChart(
                PieChartData(
                  sectionsSpace: 2,
                  centerSpaceRadius: 32,
                  sections: [
                    PieChartSectionData(
                      color: Colors.green,
                      value: active.toDouble(),
                      title: 'Active',
                      radius: 64,
                      titleStyle: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    PieChartSectionData(
                      color: Colors.orange,
                      value: featured.toDouble(),
                      title: 'Featured',
                      radius: 64,
                      titleStyle: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    PieChartSectionData(
                      color: Colors.blueGrey,
                      value: other.toDouble(),
                      title: 'Other',
                      radius: 64,
                      titleStyle: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ViewsBarChart extends StatelessWidget {
  final Map<String, dynamic> jobStats;
  const _ViewsBarChart({required this.jobStats});

  int _toInt(dynamic v) {
    if (v is int) return v;
    if (v is double) return v.toInt();
    if (v is String) return int.tryParse(v) ?? 0;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final views = _toInt(jobStats['totalViews']);
    final maxY = (views == 0 ? 5 : views + 1).toDouble();
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Lượt xem',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            SizedBox(
              height: 200,
              child: BarChart(
                BarChartData(
                  maxY: maxY,
                  gridData: const FlGridData(show: true),
                  borderData: FlBorderData(show: false),
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 32)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          return const Padding(
                              padding: EdgeInsets.only(top: 4), child: Text('Views'));
                        },
                      ),
                    ),
                  ),
                  barGroups: [
                    BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: views.toDouble(), color: Colors.blue)]),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ApplicationsTotalBar extends StatelessWidget {
  final Map<String, dynamic> appStats;
  const _ApplicationsTotalBar({required this.appStats});

  int _toInt(dynamic v) {
    if (v is int) return v;
    if (v is double) return v.toInt();
    if (v is String) return int.tryParse(v) ?? 0;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final total = _toInt(appStats['totalApplications'] ?? appStats['total']);
    final maxY = (total == 0 ? 5 : total + 1).toDouble();
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Tổng số ứng tuyển',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            SizedBox(
              height: 200,
              child: BarChart(
                BarChartData(
                  maxY: maxY,
                  gridData: const FlGridData(show: true),
                  borderData: FlBorderData(show: false),
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 32)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          return const Padding(
                              padding: EdgeInsets.only(top: 4), child: Text('Applications'));
                        },
                      ),
                    ),
                  ),
                  barGroups: [
                    BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: total.toDouble(), color: Colors.indigo)]),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecruiterStatisticPageState extends State<RecruiterStatisticPage> {
  final _service = StatisticsService(client: http.Client());
  bool _loading = true;
  String? _error;
  Map<String, dynamic> _jobStats = {};
  Map<String, dynamic> _appStats = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        _service.fetchRecruiterJobStats(),
        _service.fetchRecruiterApplicationStats(),
      ]);
      _jobStats = results[0];
      _appStats = results[1];
    } catch (e) {
      _error = 'Không thể tải thống kê: ' + e.toString();
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _service.client.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thống kê')),
      body: _loading
          ? const _LoadingView()
          : _error != null
              ? _ErrorView(message: _error!, onRetry: _load)
              : LayoutBuilder(
                  builder: (context, constraints) {
                    final maxWidth = constraints.maxWidth > 1100
                        ? 1040.0
                        : constraints.maxWidth - 24;
                    final crossAxisCount = constraints.maxWidth >= 1200
                        ? 4
                        : constraints.maxWidth >= 900
                            ? 3
                            : constraints.maxWidth >= 600
                                ? 2
                                : 1;
                    return Center(
                      child: ConstrainedBox(
                        constraints: BoxConstraints(maxWidth: maxWidth),
                        child: RefreshIndicator(
                          onRefresh: _load,
                          child: SingleChildScrollView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 8),
                                const Text('Tổng quan',
                                    style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w700)),
                                const SizedBox(height: 8),
                                GridView.count(
                                  shrinkWrap: true,
                                  crossAxisCount: crossAxisCount,
                                  mainAxisSpacing: 12,
                                  crossAxisSpacing: 12,
                                  childAspectRatio: 2.4,
                                  physics: const NeverScrollableScrollPhysics(),
                                  children: [
                                    StatCard(
                                      title: 'Tổng tin đăng',
                                      value: (_jobStats['totalJobs'] ??
                                              _jobStats['total'] ??
                                              0)
                                          .toString(),
                                      color: Colors.indigo,
                                      icon: Icons.work_outline,
                                    ),
                                    StatCard(
                                      title: 'Đang hiển thị',
                                      value: (_jobStats['activeJobs'] ??
                                              _jobStats['active'] ??
                                              0)
                                          .toString(),
                                      color: Colors.green,
                                      icon: Icons.visibility_outlined,
                                    ),
                                    StatCard(
                                      title: 'Tạm ẩn',
                                      value: (_jobStats['inactiveJobs'] ??
                                              _jobStats['inactive'] ??
                                              0)
                                          .toString(),
                                      color: Colors.orange,
                                      icon: Icons.visibility_off_outlined,
                                    ),
                                    StatCard(
                                      title: 'Nổi bật',
                                      value: (_jobStats['featuredJobs'] ??
                                              _jobStats['featured'] ??
                                              0)
                                          .toString(),
                                      color: Colors.purple,
                                      icon: Icons.auto_awesome_outlined,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                _JobsBarChart(jobStats: _jobStats),
                                const SizedBox(height: 16),
                                _JobsDistributionPie(jobStats: _jobStats),
                                const SizedBox(height: 16),
                                _ViewsBarChart(jobStats: _jobStats),
                                const SizedBox(height: 16),
                                const Text('Ứng tuyển',
                                    style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.w700)),
                                const SizedBox(height: 8),
                                GridView.count(
                                  shrinkWrap: true,
                                  crossAxisCount: crossAxisCount,
                                  mainAxisSpacing: 12,
                                  crossAxisSpacing: 12,
                                  childAspectRatio: 2.4,
                                  physics: const NeverScrollableScrollPhysics(),
                                  children: [
                                    StatCard(
                                      title: 'Tổng ứng tuyển',
                                      value: (_appStats['totalApplications'] ??
                                              _appStats['total'] ??
                                              0)
                                          .toString(),
                                      color: Colors.indigo,
                                      icon: Icons.how_to_reg_outlined,
                                    ),
                                    StatCard(
                                      title: 'Chờ xử lý',
                                      value: (_appStats['pending'] ??
                                              _appStats['waiting'] ??
                                              0)
                                          .toString(),
                                      color: Colors.amber,
                                      icon: Icons.pending_actions_outlined,
                                    ),
                                    StatCard(
                                      title: 'Được duyệt',
                                      value: (_appStats['approved'] ??
                                              _appStats['accepted'] ??
                                              0)
                                          .toString(),
                                      color: Colors.green,
                                      icon: Icons.check_circle_outline,
                                    ),
                                    StatCard(
                                      title: 'Bị từ chối',
                                      value: (_appStats['rejected'] ?? 0)
                                          .toString(),
                                      color: Colors.red,
                                      icon: Icons.cancel_outlined,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                _ApplicationsBarChart(appStats: _appStats),
                                const SizedBox(height: 16),
                                _ApplicationsTotalBar(appStats: _appStats),
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
}

class StatCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  final IconData icon;
  const StatCard(
      {super.key,
      required this.title,
      required this.value,
      required this.color,
      required this.icon});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title,
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(color: Colors.grey[700])),
                const SizedBox(height: 6),
                Text(value,
                    style: Theme.of(context)
                        .textTheme
                        .headlineSmall
                        ?.copyWith(fontWeight: FontWeight.w800, color: color)),
              ],
            ),
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color, size: 24),
            )
          ],
        ),
      ),
    );
  }
}

class _LoadingView extends StatelessWidget {
  const _LoadingView();
  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24.0),
        child: CircularProgressIndicator(),
      ),
    );
  }
}

class _JobsBarChart extends StatelessWidget {
  final Map<String, dynamic> jobStats;
  const _JobsBarChart({required this.jobStats});

  int _toInt(dynamic v) {
    if (v is int) return v;
    if (v is double) return v.toInt();
    if (v is String) return int.tryParse(v) ?? 0;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final active = _toInt(jobStats['activeJobs'] ?? jobStats['active']);
    final inactive = _toInt(jobStats['inactiveJobs'] ?? jobStats['inactive']);
    final featured = _toInt(jobStats['featuredJobs'] ?? jobStats['featured']);
    final maxY = [active, inactive, featured].fold<int>(0, (p, c) => c > p ? c : p).toDouble();

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Công việc theo trạng thái',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            SizedBox(
              height: 240,
              child: BarChart(
                BarChartData(
                  maxY: (maxY == 0 ? 5 : maxY + 1),
                  gridData: const FlGridData(show: true),
                  borderData: FlBorderData(show: false),
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 32)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          switch (value.toInt()) {
                            case 0:
                              return const Padding(
                                  padding: EdgeInsets.only(top: 4), child: Text('Active'));
                            case 1:
                              return const Padding(
                                  padding: EdgeInsets.only(top: 4), child: Text('Inactive'));
                            case 2:
                              return const Padding(
                                  padding: EdgeInsets.only(top: 4), child: Text('Featured'));
                          }
                          return const SizedBox.shrink();
                        },
                      ),
                    ),
                  ),
                  barGroups: [
                    BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: active.toDouble(), color: Colors.green)]),
                    BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: inactive.toDouble(), color: Colors.orange)]),
                    BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: featured.toDouble(), color: Colors.purple)]),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ApplicationsBarChart extends StatelessWidget {
  final Map<String, dynamic> appStats;
  const _ApplicationsBarChart({required this.appStats});

  int _toInt(dynamic v) {
    if (v is int) return v;
    if (v is double) return v.toInt();
    if (v is String) return int.tryParse(v) ?? 0;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final pending = _toInt(appStats['pending'] ?? appStats['waiting']);
    final approved = _toInt(appStats['approved'] ?? appStats['accepted']);
    final rejected = _toInt(appStats['rejected']);
    final maxY = [pending, approved, rejected].fold<int>(0, (p, c) => c > p ? c : p).toDouble();

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Ứng tuyển theo trạng thái',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            SizedBox(
              height: 240,
              child: BarChart(
                BarChartData(
                  maxY: (maxY == 0 ? 5 : maxY + 1),
                  gridData: const FlGridData(show: true),
                  borderData: FlBorderData(show: false),
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 32)),
                    rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          switch (value.toInt()) {
                            case 0:
                              return const Padding(
                                  padding: EdgeInsets.only(top: 4), child: Text('Pending'));
                            case 1:
                              return const Padding(
                                  padding: EdgeInsets.only(top: 4), child: Text('Approved'));
                            case 2:
                              return const Padding(
                                  padding: EdgeInsets.only(top: 4), child: Text('Rejected'));
                          }
                          return const SizedBox.shrink();
                        },
                      ),
                    ),
                  ),
                  barGroups: [
                    BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: pending.toDouble(), color: Colors.amber)]),
                    BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: approved.toDouble(), color: Colors.green)]),
                    BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: rejected.toDouble(), color: Colors.red)]),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final Future<void> Function() onRetry;
  const _ErrorView({required this.message, required this.onRetry});
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red[200]!)),
              child: Text(message, style: TextStyle(color: Colors.red[700])),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Thử lại')),
          ],
        ),
      ),
    );
  }
}
