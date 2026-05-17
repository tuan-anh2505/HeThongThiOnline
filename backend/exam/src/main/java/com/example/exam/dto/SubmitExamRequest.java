package com.example.exam.dto;

import lombok.Data;

import java.util.Map;

@Data
public class SubmitExamRequest {
    private Map<String, Object> answers;
}
