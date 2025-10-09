-- حذف نظام المذاكرة الذكي من قاعدة البيانات
-- Drop Smart Study System Database Schema

-- حذف الدوال أولاً
DROP FUNCTION IF EXISTS calculate_student_points(UUID);
DROP FUNCTION IF EXISTS generate_smart_reminders(UUID);
DROP FUNCTION IF EXISTS get_next_class(UUID);

-- حذف الجداول (بترتيب عكسي بسبب Foreign Keys)
DROP TABLE IF EXISTS flashcard_reviews CASCADE;
DROP TABLE IF EXISTS flashcards CASCADE;
DROP TABLE IF EXISTS student_progress CASCADE;
DROP TABLE IF EXISTS smart_reminders CASCADE;
DROP TABLE IF EXISTS student_quiz_answers CASCADE;
DROP TABLE IF EXISTS interactive_quizzes CASCADE;
DROP TABLE IF EXISTS study_sessions CASCADE;
DROP TABLE IF EXISTS parsed_schedules CASCADE;

-- رسالة تأكيد
SELECT 'Smart Study System has been completely removed from the database' as message;
