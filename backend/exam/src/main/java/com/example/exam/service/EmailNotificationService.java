package com.example.exam.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from:noreply@hethongthionline.edu.vn}")
    private String fromEmail;

    @Value("${app.name:Hệ Thống Thi Online}")
    private String appName;

    /**
     * Send simple text email
     * 
     * @param to      recipient email
     * @param subject email subject
     * @param body    email body
     */
    public void sendSimpleEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Simple email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to: " + to, e);
        }
    }

    /**
     * Send HTML email
     * 
     * @param to       recipient email
     * @param subject  email subject
     * @param htmlBody email body in HTML format
     */
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("HTML email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to: " + to, e);
        }
    }

    /**
     * Send email to multiple recipients
     * 
     * @param recipients list of email addresses
     * @param subject    email subject
     * @param body       email body
     */
    public void sendBulkEmail(List<String> recipients, String subject, String body) {
        for (String recipient : recipients) {
            sendSimpleEmail(recipient, subject, body);
        }
    }

    /**
     * Send exam notification to student
     * 
     * @param studentEmail  student email
     * @param studentName   student name
     * @param examName      exam name
     * @param examStartTime exam start time
     */
    public void notifyExamStart(String studentEmail, String studentName, String examName, String examStartTime) {
        String subject = "Thông báo: Bài thi sắp bắt đầu";
        String body = buildExamNotificationBody(studentName, examName, examStartTime, "sắp bắt đầu");
        sendHtmlEmail(studentEmail, subject, body);
        log.info("Exam start notification sent to: {}", studentEmail);
    }

    /**
     * Send exam deadline reminder
     * 
     * @param studentEmail  student email
     * @param studentName   student name
     * @param examName      exam name
     * @param remainingTime time remaining
     */
    public void notifyExamDeadline(String studentEmail, String studentName, String examName, String remainingTime) {
        String subject = "Nhắc nhở: " + remainingTime + " còn lại để nộp bài";
        String body = buildExamNotificationBody(studentName, examName, remainingTime, "sắp hết thời gian");
        sendHtmlEmail(studentEmail, subject, body);
        log.info("Exam deadline reminder sent to: {}", studentEmail);
    }

    /**
     * Send exam submission confirmation
     * 
     * @param studentEmail student email
     * @param studentName  student name
     * @param examName     exam name
     * @param score        score achieved
     */
    public void notifyExamSubmission(String studentEmail, String studentName, String examName, String score) {
        String subject = "Xác nhận nộp bài: " + examName;
        String htmlBody = buildSubmissionConfirmationBody(studentName, examName, score);
        sendHtmlEmail(studentEmail, subject, htmlBody);
        log.info("Exam submission confirmation sent to: {}", studentEmail);
    }

    /**
     * Send results notification to student
     * 
     * @param studentEmail student email
     * @param studentName  student name
     * @param examName     exam name
     * @param score        student's score
     * @param totalScore   total possible score
     */
    public void notifyExamResults(String studentEmail, String studentName, String examName,
            String score, String totalScore) {
        String subject = "Kết quả bài thi: " + examName;
        String htmlBody = buildResultsNotificationBody(studentName, examName, score, totalScore);
        sendHtmlEmail(studentEmail, subject, htmlBody);
        log.info("Exam results notification sent to: {}", studentEmail);
    }

    /**
     * Send account creation notification
     * 
     * @param email        user email
     * @param name         user name
     * @param username     username
     * @param tempPassword temporary password
     */
    public void notifyAccountCreation(String email, String name, String username, String tempPassword) {
        String subject = "Tài khoản mới được tạo trên " + appName;
        String htmlBody = buildAccountCreationBody(name, username, tempPassword);
        sendHtmlEmail(email, subject, htmlBody);
        log.info("Account creation notification sent to: {}", email);
    }

    /**
     * Send password reset email
     * 
     * @param email     user email
     * @param name      user name
     * @param resetLink password reset link
     */
    public void notifyPasswordReset(String email, String name, String resetLink) {
        String subject = "Đặt lại mật khẩu - " + appName;
        String htmlBody = buildPasswordResetBody(name, resetLink);
        sendHtmlEmail(email, subject, htmlBody);
        log.info("Password reset notification sent to: {}", email);
    }

    // Helper methods to build email bodies

    private String buildExamNotificationBody(String studentName, String examName, String timeInfo, String status) {
        return "<html>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<h2>Thông báo từ " + appName + "</h2>" +
                "<p>Xin chào <strong>" + studentName + "</strong>,</p>" +
                "<p>Bài thi <strong>" + examName + "</strong> " + status + ":</p>" +
                "<p style='font-size: 16px; color: #e74c3c;'><strong>" + timeInfo + "</strong></p>" +
                "<p>Vui lòng chuẩn bị sẵn sàng và đăng nhập vào hệ thống.</p>" +
                "<br/>" +
                "<p>Trân trọng,<br/>" + appName + "</p>" +
                "</body>" +
                "</html>";
    }

    private String buildSubmissionConfirmationBody(String studentName, String examName, String score) {
        return "<html>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<h2>Xác nhận nộp bài</h2>" +
                "<p>Xin chào <strong>" + studentName + "</strong>,</p>" +
                "<p>Chúng tôi xác nhận rằng bài thi <strong>" + examName
                + "</strong> của bạn đã được nộp thành công.</p>" +
                "<p><strong>Điểm tạm tính:</strong> " + score + "</p>" +
                "<p>Kết quả chi tiết sẽ được gửi sau khi giáo viên chấm bài.</p>" +
                "<br/>" +
                "<p>Trân trọng,<br/>" + appName + "</p>" +
                "</body>" +
                "</html>";
    }

    private String buildResultsNotificationBody(String studentName, String examName, String score, String totalScore) {
        return "<html>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<h2>Kết quả bài thi</h2>" +
                "<p>Xin chào <strong>" + studentName + "</strong>,</p>" +
                "<p>Kết quả bài thi <strong>" + examName + "</strong> của bạn:</p>" +
                "<p style='font-size: 18px; color: #27ae60;'><strong>Điểm: " + score + "/" + totalScore
                + "</strong></p>" +
                "<p>Bạn có thể xem chi tiết các câu trả lời sai trên hệ thống.</p>" +
                "<br/>" +
                "<p>Trân trọng,<br/>" + appName + "</p>" +
                "</body>" +
                "</html>";
    }

    private String buildAccountCreationBody(String name, String username, String tempPassword) {
        return "<html>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<h2>Chào mừng đến với " + appName + "</h2>" +
                "<p>Xin chào <strong>" + name + "</strong>,</p>" +
                "<p>Tài khoản của bạn đã được tạo thành công:</p>" +
                "<p><strong>Tên đăng nhập:</strong> " + username + "</p>" +
                "<p><strong>Mật khẩu tạm thời:</strong> " + tempPassword + "</p>" +
                "<p style='color: #e74c3c;'><strong>Lưu ý:</strong> Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu.</p>"
                +
                "<br/>" +
                "<p>Trân trọng,<br/>" + appName + "</p>" +
                "</body>" +
                "</html>";
    }

    private String buildPasswordResetBody(String name, String resetLink) {
        return "<html>" +
                "<body style='font-family: Arial, sans-serif;'>" +
                "<h2>Đặt lại mật khẩu</h2>" +
                "<p>Xin chào <strong>" + name + "</strong>,</p>" +
                "<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>" +
                "<p><a href='" + resetLink
                + "' style='background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Đặt lại mật khẩu</a></p>"
                +
                "<p>Nếu bạn không yêu cầu điều này, vui lòng bỏ qua email này.</p>" +
                "<br/>" +
                "<p>Trân trọng,<br/>" + appName + "</p>" +
                "</body>" +
                "</html>";
    }
}
