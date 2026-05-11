package com.example.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private List<ExamResponse> examsValid;
    private List<ExamResponse> examsExpired;
    private List<String> classes;
    private String selectedClass;
}
