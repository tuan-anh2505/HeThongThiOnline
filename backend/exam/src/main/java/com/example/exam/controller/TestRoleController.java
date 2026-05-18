package com.example.exam.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestRoleController {

    @GetMapping("/api/admin/test")
    public String adminTest() {
        return "ADMIN OK";
    }

    @GetMapping("/api/teacher/test")
    public String teacherTest() {
        return "TEACHER OK";
    }

    @GetMapping("/api/student/test")
    public String studentTest() {
        return "STUDENT OK";
    }
}