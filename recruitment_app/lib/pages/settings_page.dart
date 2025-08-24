import 'package:flutter/material.dart';
import 'package:recruitment_app/configs/locale_controller.dart';
import 'package:recruitment_app/configs/i18n.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: AnimatedBuilder(
          animation: LocaleController.instance,
          builder: (context, _) {
            return Text(tr('settings'));
          },
        ),
      ),
      body: AnimatedBuilder(
        animation: LocaleController.instance,
        builder: (context, _) {
          final current = LocaleController.instance.locale?.languageCode;
          String subtitle;
          switch (current) {
            case 'en':
              subtitle = tr('english');
              break;
            case 'vi':
            case null:
              subtitle = tr('vietnamese');
              break;
            default:
              subtitle = current;
          }

          final tLanguage = tr('language');
          final tAppearance = tr('appearance');
          final tLight = tr('light');
          final tVersion = tr('version');

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              ListTile(
                leading: const Icon(Icons.language),
                title: Text(tLanguage),
                subtitle: Text(subtitle),
                onTap: () => _showLanguageSheet(context),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.dark_mode),
                title: Text(tAppearance),
                subtitle: Text(tLight),
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.info_outline),
                title: Text(tVersion),
                subtitle: const Text('1.0.0'),
              ),
            ],
          );
        },
      ),
    );
  }

  void _showLanguageSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      builder: (ctx) {
        final current = LocaleController.instance.locale?.languageCode ?? 'vi';
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              RadioListTile<String>(
                value: 'vi',
                groupValue: current,
                title: Text(tr('vietnamese')),
                onChanged: (val) async {
                  await LocaleController.instance.setLocale(const Locale('vi'));
                  Navigator.of(ctx).pop();
                },
              ),
              RadioListTile<String>(
                value: 'en',
                groupValue: current,
                title: Text(tr('english')),
                onChanged: (val) async {
                  await LocaleController.instance.setLocale(const Locale('en'));
                  Navigator.of(ctx).pop();
                },
              ),
              const SizedBox(height: 8),
            ],
          ),
        );
      },
    );
  }
}
