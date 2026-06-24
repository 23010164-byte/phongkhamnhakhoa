/**
 * Khai báo tất cả Sequelize associations — Phase 1-5
 */
const User = require('../modules/user/user.model');
const RefreshToken = require('../modules/auth/auth.model');
const DoctorProfile = require('../modules/doctor/doctor.model');
const DoctorSlot = require('../modules/doctor/slot.model');
const Specialty = require('../modules/service/specialty.model');
const Service = require('../modules/service/service.model');
const Appointment = require('../modules/appointment/appointment.model');
const { MedicalRecord, Prescription, MedicalRecordService } = require('../modules/medical/medical.model');
const Notification = require('../modules/notification/notification.model');
const Payment = require('../modules/payment/payment.model');
const Review = require('../modules/review/review.model');
const Media = require('../modules/media/media.model');
const { ChatRoom, ChatMember, ChatMessage } = require('../modules/chat/chat.model');
const { Blog, BlogCategory } = require('../modules/blog/blog.model');
const Contact = require('../modules/contact/contact.model');
const Holiday = require('../modules/holiday/holiday.model');
const Shift = require('../modules/shift/shift.model');
const Roster = require('../modules/roster/roster.model');
const { SalaryConfig, SalarySlip } = require('../modules/salary/salary.model');

const setupAssociations = () => {

  // ========================
  // USER
  // ========================
  User.hasOne(DoctorProfile, { foreignKey: 'user_id', as: 'doctorProfile' });
  User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
  User.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
  User.hasMany(MedicalRecord, { foreignKey: 'patient_id', as: 'medicalRecords' });
  User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
  User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
  User.hasMany(Review, { foreignKey: 'patient_id', as: 'reviews' });
  User.hasMany(Media, { foreignKey: 'user_id', as: 'media' });
  User.hasMany(ChatMember, { foreignKey: 'user_id', as: 'chatMemberships' });
  User.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'chatMessages' });
  User.hasMany(Blog, { foreignKey: 'author_id', as: 'blogs' });
  User.hasMany(Contact, { foreignKey: 'assigned_to', as: 'assignedContacts' });
  RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // ========================
  // DOCTOR PROFILE & SLOTS
  // ========================
  DoctorProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  DoctorProfile.belongsTo(Specialty, { foreignKey: 'specialty_id', as: 'specialty' });
  DoctorProfile.hasMany(Appointment, { foreignKey: 'doctor_profile_id', as: 'appointments' });
  DoctorProfile.hasMany(MedicalRecord, { foreignKey: 'doctor_profile_id', as: 'medicalRecords' });
  DoctorProfile.hasMany(Review, { foreignKey: 'doctor_profile_id', as: 'reviews' });
  DoctorProfile.hasMany(DoctorSlot, { foreignKey: 'doctor_profile_id', as: 'slots' });
  DoctorSlot.belongsTo(DoctorProfile, { foreignKey: 'doctor_profile_id', as: 'doctorProfile' });

  // ========================
  // SPECIALTY & SERVICE
  // ========================
  Specialty.hasMany(Service, { foreignKey: 'specialty_id', as: 'services' });
  Specialty.hasMany(DoctorProfile, { foreignKey: 'specialty_id', as: 'doctors' });
  Service.belongsTo(Specialty, { foreignKey: 'specialty_id', as: 'specialty' });
  Service.hasMany(Appointment, { foreignKey: 'service_id', as: 'appointments' });

  // ========================
  // APPOINTMENT
  // ========================
  Appointment.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
  Appointment.belongsTo(DoctorProfile, { foreignKey: 'doctor_profile_id', as: 'doctor' });
  Appointment.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });
  Appointment.belongsTo(User, { foreignKey: 'cancelled_by', as: 'cancelledByUser' });
  Appointment.hasOne(MedicalRecord, { foreignKey: 'appointment_id', as: 'medicalRecord' });
  Appointment.hasOne(Payment, { foreignKey: 'appointment_id', as: 'payment' });
  Appointment.hasOne(Review, { foreignKey: 'appointment_id', as: 'review' });
  Appointment.hasOne(ChatRoom, { foreignKey: 'appointment_id', as: 'chatRoom' });

  // ========================
  // MEDICAL RECORD
  // ========================
  MedicalRecord.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });
  MedicalRecord.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
  MedicalRecord.belongsTo(DoctorProfile, { foreignKey: 'doctor_profile_id', as: 'doctor' });
  MedicalRecord.hasMany(Prescription, { foreignKey: 'medical_record_id', as: 'prescriptions' });
  MedicalRecord.hasMany(MedicalRecordService, { foreignKey: 'medical_record_id', as: 'services' });
  Prescription.belongsTo(MedicalRecord, { foreignKey: 'medical_record_id', as: 'medicalRecord' });
  MedicalRecordService.belongsTo(MedicalRecord, { foreignKey: 'medical_record_id', as: 'medicalRecord' });
  MedicalRecordService.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

  // ========================
  // NOTIFICATION
  // ========================
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // ========================
  // PAYMENT
  // ========================
  Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Payment.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

  // ========================
  // REVIEW
  // ========================
  Review.belongsTo(User, { foreignKey: 'patient_id', as: 'patient' });
  Review.belongsTo(DoctorProfile, { foreignKey: 'doctor_profile_id', as: 'doctor' });
  Review.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

  // ========================
  // MEDIA
  // ========================
  Media.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // ========================
  // CHAT
  // ========================
  ChatRoom.hasMany(ChatMember, { foreignKey: 'room_id', as: 'members' });
  ChatRoom.hasMany(ChatMessage, { foreignKey: 'room_id', as: 'messages' });
  ChatRoom.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  ChatRoom.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

  ChatMember.belongsTo(ChatRoom, { foreignKey: 'room_id', as: 'room' });
  ChatMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  ChatMessage.belongsTo(ChatRoom, { foreignKey: 'room_id', as: 'room' });
  ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
  ChatMessage.belongsTo(ChatMessage, { foreignKey: 'reply_to_id', as: 'replyTo' });
  ChatMessage.hasMany(ChatMessage, { foreignKey: 'reply_to_id', as: 'replies' });

  // ========================
  // BLOG
  // ========================
  BlogCategory.hasMany(Blog, { foreignKey: 'category_id', as: 'blogs' });
  Blog.belongsTo(BlogCategory, { foreignKey: 'category_id', as: 'category' });
  Blog.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

  // ========================
  // CONTACT
  // ========================
  Contact.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

  // ========================
  // CLINIC MANAGEMENT (ROSTER)
  // ========================
  Roster.belongsTo(DoctorProfile, { foreignKey: 'doctor_profile_id', as: 'doctor' });
  Roster.belongsTo(Shift, { foreignKey: 'shift_id', as: 'shift' });
  DoctorProfile.hasMany(Roster, { foreignKey: 'doctor_profile_id', as: 'rosters' });
  Shift.hasMany(Roster, { foreignKey: 'shift_id', as: 'rosters' });

  // ========================
  // DOCTOR LEAVE
  // ========================
  const Leave = require('../modules/leave/leave.model');
  Leave.belongsTo(DoctorProfile, { foreignKey: 'doctor_profile_id', as: 'doctor' });
  DoctorProfile.hasMany(Leave, { foreignKey: 'doctor_profile_id', as: 'leaves' });

  // ========================
  // SALARY
  // ========================
  SalarySlip.belongsTo(DoctorProfile, { foreignKey: 'doctor_profile_id', as: 'doctor' });
  DoctorProfile.hasMany(SalarySlip, { foreignKey: 'doctor_profile_id', as: 'salarySlips' });
};

module.exports = setupAssociations;
