package com.example.exam.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ExamWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Handle exam status updates
     */
    @MessageMapping("/exam/{maBaiThi}/status")
    public void updateExamStatus(
            @DestinationVariable Integer maBaiThi,
            @Payload ExamStatusMessage message) {
        log.info("Exam {} status update: {}", maBaiThi, message);

        message.setTimestamp(LocalDateTime.now());
        messagingTemplate.convertAndSend(
                "/topic/exam/" + maBaiThi + "/status",
                message);
    }

    /**
     * Handle student joining exam
     */
    @MessageMapping("/exam/{maBaiThi}/join")
    public void handleStudentJoin(
            @DestinationVariable Integer maBaiThi,
            @Payload StudentJoinMessage message) {
        log.info("Student {} joined exam {}", message.getMaSinhVien(), maBaiThi);

        message.setTimestamp(LocalDateTime.now());
        message.setAction("JOIN");
        messagingTemplate.convertAndSend(
                "/topic/exam/" + maBaiThi + "/students",
                message);
    }

    /**
     * Handle student leaving exam
     */
    @MessageMapping("/exam/{maBaiThi}/leave")
    public void handleStudentLeave(
            @DestinationVariable Integer maBaiThi,
            @Payload StudentJoinMessage message) {
        log.info("Student {} left exam {}", message.getMaSinhVien(), maBaiThi);

        message.setTimestamp(LocalDateTime.now());
        message.setAction("LEAVE");
        messagingTemplate.convertAndSend(
                "/topic/exam/" + maBaiThi + "/students",
                message);
    }

    /**
     * Handle exam progress update
     */
    @MessageMapping("/exam/{maBaiThi}/progress")
    public void updateExamProgress(
            @DestinationVariable Integer maBaiThi,
            @Payload ExamProgressMessage message) {
        log.info("Exam {} progress update: {}", maBaiThi, message);

        message.setTimestamp(LocalDateTime.now());
        messagingTemplate.convertAndSend(
                "/topic/exam/" + maBaiThi + "/progress",
                message);
    }

    /**
     * Send notification to exam participants
     */
    @MessageMapping("/exam/{maBaiThi}/notify")
    public void sendNotification(
            @DestinationVariable Integer maBaiThi,
            @Payload NotificationMessage message) {
        log.info("Notification for exam {}: {}", maBaiThi, message.getContent());

        message.setTimestamp(LocalDateTime.now());
        messagingTemplate.convertAndSend(
                "/topic/exam/" + maBaiThi + "/notifications",
                message);
    }

    /**
     * Broadcast to all exam monitoring screens
     */
    @MessageMapping("/monitor/{maBaiThi}/update")
    public void broadcastMonitorUpdate(
            @DestinationVariable Integer maBaiThi,
            @Payload MonitorUpdateMessage message) {
        log.info("Monitor update for exam {}", maBaiThi);

        message.setTimestamp(LocalDateTime.now());
        messagingTemplate.convertAndSend(
                "/topic/monitor/" + maBaiThi,
                message);
    }

    // Message classes

    @Data
    public static class ExamStatusMessage {
        private Integer maBaiThi;
        private String status; // RUNNING, PAUSED, FINISHED, etc.
        private LocalDateTime timestamp;
    }

    @Data
    public static class StudentJoinMessage {
        private Integer maSinhVien;
        private String tenSinhVien;
        private String action;
        private LocalDateTime timestamp;
    }

    @Data
    public static class ExamProgressMessage {
        private Integer maBaiThi;
        private Integer maSinhVien;
        private Integer questionNumber;
        private Integer answersSubmitted;
        private Integer questionsTotal;
        private LocalDateTime timestamp;
    }

    @Data
    public static class NotificationMessage {
        private String type; // INFO, WARNING, ERROR, etc.
        private String content;
        private String targetAudience; // ALL, TEACHERS, STUDENTS, etc.
        private LocalDateTime timestamp;
    }

    @Data
    public static class MonitorUpdateMessage {
        private Integer maBaiThi;
        private Integer totalStudents;
        private Integer onlineStudents;
        private Integer submittedCount;
        private Double averageScore;
        private LocalDateTime timestamp;
    }
}
