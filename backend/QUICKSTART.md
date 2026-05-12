# Quick Start Guide - Hệ Thống Thi Online Backend

## Build & Run Instructions

### Prerequisites

- Java 21 LTS installed
- Maven 3.9.15+ (or use Maven wrapper)
- SQL Server instance running
- Administrator access to application directory

### Step 1: Configure Database Connection

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=HeThongThiOnline;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=YOUR_PASSWORD
```

### Step 2: Configure Email Service (Optional)

For email notifications, update:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.from=noreply@hethongthionline.edu.vn
```

**For Gmail:**

1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-Factor Authentication first
3. Generate App Password
4. Use generated password above

### Step 3: Create Upload Directory

```bash
# Windows (Command Prompt)
mkdir uploads\exams
mkdir uploads\submissions
mkdir uploads\resources

# Linux/Mac
mkdir -p uploads/exams
mkdir -p uploads/submissions
mkdir -p uploads/resources
```

### Step 4: Build the Project

Using Maven Wrapper (Recommended):

```bash
# Windows
mvnw.cmd clean package

# Linux/Mac
./mvnw clean package
```

Or with installed Maven:

```bash
mvn clean package
```

### Step 5: Run the Application

```bash
# Development mode (with auto-reload)
java -jar target/exam-0.0.1-SNAPSHOT.jar

# Or with Maven
mvn spring-boot:run
```

### Verification

When you see this message, the app is ready:

```
Tomcat started on port(s): 8080 (http) with context path ''
Started ExamApplication in X.XXX seconds
```

---

## Testing the API

### 1. Test Compilation Only (No Execution)

```bash
mvnw clean test-compile -q
# Expected: No errors
```

### 2. Test Database Connection

```bash
# Check application.properties for correct SQL Server URL and credentials
# Application will auto-create tables on startup (ddl-auto=update)
```

### 3. Test a Simple Endpoint

**Authentication (Get JWT Token):**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "password123"
  }'
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "student1",
    "email": "student1@example.com",
    "role": "STUDENT"
  }
}
```

**View Dashboard:**

```bash
curl -X GET http://localhost:8080/api/dashboard/student \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Test File Upload

```bash
# Upload exam material
curl -X POST http://localhost:8080/api/files/exam-material/1 \
  -F "file=@exam_guide.pdf" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response: { "filename": "20240101_120000_abc12345.pdf" }
```

### 5. Test Export Functionality

```bash
# Export exam results as CSV
curl -X GET http://localhost:8080/api/analytics/exam/1/export-csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o exam_results.csv
```

### 6. Test WebSocket Connection

Using a WebSocket client (e.g., Postman or JavaScript):

```javascript
// Connect to WebSocket
const client = new SockJS("http://localhost:8080/ws-exam");
const stompClient = Stomp.over(client);

stompClient.connect({}, (frame) => {
  console.log("Connected: " + frame);

  // Subscribe to exam updates
  stompClient.subscribe("/topic/exam/1/status", (message) => {
    console.log("Received: " + message.body);
  });

  // Send message
  stompClient.send(
    "/app/exam/1/join",
    {},
    JSON.stringify({
      studentId: 123,
      studentName: "Nguyễn Văn A",
    }),
  );
});
```

---

## Project Structure Quick Reference

```
exam/
├── mvnw / mvnw.cmd            # Maven wrapper (use instead of global mvn)
├── pom.xml                    # Maven configuration & dependencies
├── src/
│   ├── main/
│   │   ├── java/com/example/exam/
│   │   │   ├── config/        # Spring configuration beans
│   │   │   ├── controller/    # REST API endpoints (8 controllers)
│   │   │   ├── service/       # Business logic (7+ services)
│   │   │   ├── entity/        # JPA entities (15+ models)
│   │   │   ├── repository/    # Data access (8+ repositories)
│   │   │   ├── security/      # JWT & authentication
│   │   │   ├── util/          # Utilities (deadlines, exports)
│   │   │   ├── websocket/     # WebSocket controllers & messages
│   │   │   └── ExamApplication.java
│   │   └── resources/
│   │       ├── application.properties  # Configuration
│   │       ├── static/        # Static files (CSS, JS)
│   │       └── templates/     # HTML templates
│   └── test/
│       └── ExamApplicationTests.java
├── target/                    # Compiled files (created after build)
├── uploads/                   # User-uploaded files
│   ├── exams/
│   ├── submissions/
│   └── resources/
└── IMPLEMENTATION_SUMMARY.md  # Detailed implementation docs
```

---

## Troubleshooting

### Issue: Port 8080 Already In Use

```bash
# Kill process using port 8080
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :8080
kill -9 <PID>

# Or use different port:
java -jar target/exam-0.0.1-SNAPSHOT.jar --server.port=8081
```

### Issue: Database Connection Failed

- Verify SQL Server is running: `sqlcmd -S localhost -U sa -P PASSWORD -Q "SELECT 1"`
- Check credentials in application.properties
- Verify database `HeThongThiOnline` exists

### Issue: Maven Compilation Errors

```bash
# Clean and retry
mvn clean -U compile

# Show full error trace
mvn compile -e

# Check for uncommitted changes
git status
```

### Issue: File Upload Not Working

- Verify `uploads/` directory exists and is writable
- Check file size < 50MB (default limit)
- Verify uploaded file extension is in allowed list (pdf, doc, txt, jpg, png, etc.)

### Issue: Email Not Sending

- Verify SMTP credentials are correct
- Check if Gmail requires App Password (if using Gmail)
- Test connection: `telnet smtp.gmail.com 587`
- Check application logs for JavaMailSender errors

### Issue: WebSocket Connection Fails

- Verify browser supports WebSocket (not on very old browsers)
- Check CORS configuration in SecurityConfig
- Verify firewall allows connections to port 8080

---

## Performance Optimization

### 1. Enable Caching (Optional)

```properties
# In application.properties
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
```

### 2. Increase Heap Memory for Large Exports

```bash
java -Xmx2g -Xms1g -jar target/exam-0.0.1-SNAPSHOT.jar
```

### 3. Enable Compression

```properties
server.compression.enabled=true
server.compression.min-response-size=1024
```

---

## Development Tips

### Auto-Reload on Code Changes

```bash
# Requires spring-boot-devtools (already in pom.xml)
mvn spring-boot:run
```

### Debug Mode

```bash
# Enable debug logging
mvn spring-boot:run -Dspring-boot.run.arguments="--debug"
```

### View SQL Queries

```properties
# In application.properties
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql=TRACE
```

### Generate API Documentation (TODO)

```bash
# After implementing Springdoc-OpenAPI
# Swagger UI available at: http://localhost:8080/swagger-ui.html
```

---

## Next Steps

### Immediate Actions

1. ✅ Configure email SMTP credentials
2. ✅ Ensure SQL Server database exists
3. ✅ Create upload directories
4. ✅ Build and run: `mvnw clean package && java -jar target/exam-0.0.1-SNAPSHOT.jar`

### Short-term Enhancements

1. Implement frontend WebSocket client for real-time monitoring
2. Add integration tests for exam flow
3. Configure CI/CD pipeline (GitHub Actions, Jenkins)
4. Setup logging and monitoring (ELK, Prometheus)

### Before Production Deployment

1. ☐ Configure HTTPS/SSL certificates
2. ☐ Setup database backups
3. ☐ Configure external file storage (S3, Azure Blob)
4. ☐ Implement rate limiting and DDoS protection
5. ☐ Setup monitoring and alerting
6. ☐ Performance testing under load
7. ☐ Security audit and penetration testing

---

## Contact & Support

For issues or questions:

1. Check IMPLEMENTATION_SUMMARY.md for detailed API documentation
2. Review Spring Boot logs: `tail -f logs/application.log`
3. Check application.properties for configuration errors

---

**Status:** ✅ Ready for Development
**All 6 Features:** ✅ Implemented & Verified
**Compilation:** ✅ Success
**Build Date:** 2024
