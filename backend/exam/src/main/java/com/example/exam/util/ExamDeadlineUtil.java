package com.example.exam.util;

import com.example.exam.entity.BaiThi;
import com.example.exam.entity.CaThi;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ExamDeadlineUtil {

    /**
     * Check if exam is still within deadline
     * 
     * @param caThi exam session with start and end times
     * @return true if exam is still open, false if expired
     */
    public boolean isExamStillValid(CaThi caThi) {
        if (caThi == null || caThi.getGioKetThuc() == null) {
            return true;
        }
        return LocalDateTime.now().isBefore(caThi.getGioKetThuc());
    }

    /**
     * Check if exam has started
     * 
     * @param caThi exam session
     * @return true if exam has started
     */
    public boolean hasExamStarted(CaThi caThi) {
        if (caThi == null || caThi.getGioBatDau() == null) {
            return true;
        }
        return LocalDateTime.now().isAfter(caThi.getGioBatDau());
    }

    /**
     * Get remaining time in milliseconds
     * 
     * @param caThi exam session
     * @return milliseconds remaining, or 0 if expired
     */
    public long getRemainingTimeMs(CaThi caThi) {
        if (caThi == null || caThi.getGioKetThuc() == null) {
            return Long.MAX_VALUE;
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(caThi.getGioKetThuc())) {
            return 0;
        }

        return java.time.temporal.ChronoUnit.MILLIS.between(now, caThi.getGioKetThuc());
    }

    /**
     * Get remaining time in human-readable format
     * 
     * @param caThi exam session
     * @return formatted time string (e.g., "1h 30m 45s")
     */
    public String getRemainingTimeFormatted(CaThi caThi) {
        long millis = getRemainingTimeMs(caThi);
        if (millis <= 0)
            return "Hết hạn";

        long hours = millis / 3600000;
        long minutes = (millis % 3600000) / 60000;
        long seconds = (millis % 60000) / 1000;

        return String.format("%dh %dm %ds", hours, minutes, seconds);
    }

    /**
     * Check if exam is expired
     * 
     * @param caThi exam session
     * @return true if exam time has passed
     */
    public boolean isExamExpired(CaThi caThi) {
        return !isExamStillValid(caThi);
    }

    /**
     * Check if student can take exam based on time
     * 
     * @param caThi exam session
     * @return true if current time is within exam session
     */
    public boolean canTakeExam(CaThi caThi) {
        return hasExamStarted(caThi) && isExamStillValid(caThi);
    }
}
