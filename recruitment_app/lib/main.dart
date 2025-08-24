import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:recruitment_app/pages/application_page.dart';
import 'package:recruitment_app/pages/register_page.dart';
import 'pages/login_page.dart';
import 'pages/job_detail_page.dart';
import 'pages/root_page.dart';
import 'pages/interviews_page.dart';
import 'pages/add_job_page.dart';
import 'pages/edit_job_page.dart';
import 'pages/recruiter_statistic_page.dart';
import 'pages/chat_page.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'configs/locale_controller.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storage = FlutterSecureStorage();
  final token = await storage.read(key: 'token');
  await Firebase.initializeApp();

  // Request notification permission
  await FirebaseMessaging.instance.requestPermission();

  // Init local notifications
  const AndroidInitializationSettings initSettingsAndroid =
      AndroidInitializationSettings('@mipmap/ic_launcher');
  const InitializationSettings initSettings =
      InitializationSettings(android: initSettingsAndroid);
  await flutterLocalNotificationsPlugin.initialize(initSettings);

  // Get FCM token
  String? fcmToken = await FirebaseMessaging.instance.getToken();
  debugPrint("FCM Token: $fcmToken");

  // Lắng nghe thông báo khi app đang foreground
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    debugPrint('📩 Got a message in foreground');
    debugPrint('Title: ${message.notification?.title}');
    debugPrint('Body: ${message.notification?.body}');
    debugPrint('Data: ${message.data}');

    if (message.notification != null) {
      // Hiển thị local notification
      flutterLocalNotificationsPlugin.show(
        message.hashCode,
        message.notification!.title,
        message.notification!.body,
        const NotificationDetails(
          android: AndroidNotificationDetails(
            'default_channel', // id
            'Default Channel', // name
            channelDescription: 'This is the default notification channel',
            importance: Importance.high,
            priority: Priority.high,
          ),
        ),
      );
    }
  });

  await LocaleController.instance.load();

  runApp(MyApp(initialRoute: token == null ? '/login' : '/home'));
}

class MyApp extends StatelessWidget {
  final String initialRoute;
  const MyApp({Key? key, required this.initialRoute}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final seed = const Color(0xFF4A90E2);
    final lightScheme =
        ColorScheme.fromSeed(seedColor: seed, brightness: Brightness.light);
    final darkScheme =
        ColorScheme.fromSeed(seedColor: seed, brightness: Brightness.dark);
    return AnimatedBuilder(
      animation: LocaleController.instance,
      builder: (context, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'Recruitment App',
          themeMode: ThemeMode.system,
          theme: ThemeData(
            colorScheme: lightScheme,
            useMaterial3: true,
            appBarTheme: const AppBarTheme(centerTitle: true),
            cardTheme: const CardTheme(elevation: 1),
          ),
          darkTheme: ThemeData(
            colorScheme: darkScheme,
            useMaterial3: true,
            appBarTheme: const AppBarTheme(centerTitle: true),
            cardTheme: const CardTheme(elevation: 1),
          ),
          locale: LocaleController.instance.locale,
          supportedLocales: const [
            Locale('en'),
            Locale('vi'),
          ],
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          initialRoute: initialRoute,
          routes: {
            '/login': (context) => const LoginPage(),
            '/home': (context) => const RootPage(),
            '/register': (context) => const RegisterPage(),
            '/jobDetail': (context) => const JobDetailPage(),
            '/application': (context) => const ApplicationPage(),
            '/interview': (context) => const InterviewsPage(),
            '/addJob': (context) => const AddJobPage(),
            '/editJob': (context) => const EditJobPage(),
            '/recruiterStatistic': (context) => const RecruiterStatisticPage(),
            '/chat': (context) => const ChatPage(),
          },
        );
      },
    );
  }
}
