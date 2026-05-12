# Configuration Reference - Hệ Thống Thi Online

## application.properties - Complete Configuration

### Database Configuration

```properties
# SQL Server Connection
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=HeThongThiOnline;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=25052005nta
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServerDialect
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.show-sql=false
```

### Email Configuration (Gmail)

```properties
# SMTP Server Settings
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password

# SMTP Protocol Settings
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

# Sender Configuration
spring.mail.from=noreply@hethongthionline.edu.vn
app.name=Hệ Thống Thi Online
```

### Email Configuration (Alternative Providers)

**Outlook/Office 365:**

```properties
spring.mail.host=smtp.outlook.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
```

**SendGrid:**

```properties
spring.mail.host=smtp.sendgrid.net
spring.mail.port=587
spring.mail.username=apikey
spring.mail.password=YOUR_SENDGRID_API_KEY
```

**Custom/Corporate SMTP:**

```properties
spring.mail.host=mail.company.com
spring.mail.port=587
spring.mail.username=your-email@company.com
spring.mail.password=your-password
```

### File Upload Configuration

```properties
# Directory where files are stored
file.upload.dir=uploads/

# Maximum file size: 50MB (52428800 bytes)
file.upload.max-size=52428800
```

### Server Configuration

```properties
# Server Port
server.port=8080

# Context Path
server.servlet.context-path=/

# Connection Pool
server.tomcat.max-threads=200
server.tomcat.min-spare-threads=10
server.tomcat.connection-timeout=20000
```

### Logging Configuration

```properties
# Root Logger Level
logging.level.root=INFO

# Application Logger Level
logging.level.com.example.exam=DEBUG

# Spring Framework
logging.level.org.springframework=INFO
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG

# JPA/Hibernate
logging.level.org.hibernate=INFO
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql=TRACE

# Log File
logging.file.name=logs/application.log
logging.file.max-size=10MB
logging.file.max-history=10
```

### Security Configuration

```properties
# JWT Configuration
app.jwt.secret=your-secret-key-minimum-256-bits-long
app.jwt.expiration=86400000

# CORS Configuration
app.cors.allowed-origins=http://localhost:3000,http://localhost:4200,https://yourdomain.com

# Password Encoding
app.password.encoder=bcrypt
```

### WebSocket Configuration

```properties
# WebSocket Endpoint
spring.websocket.path=/ws-exam

# STOMP Configuration
spring.websocket.stomp.enabled=true
spring.websocket.stomp.heartbeat=25000,25000
```

### Application Profile Configurations

**Development (application-dev.properties):**

```properties
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
logging.level.com.example.exam=DEBUG
logging.level.org.springframework=DEBUG
server.port=8080
```

**Production (application-prod.properties):**

```properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
logging.level.com.example.exam=INFO
logging.level.org.springframework=WARN
server.port=8080
server.ssl.key-store=classpath:keystore.jks
server.ssl.key-store-password=your-password
server.ssl.key-store-type=JKS
```

---

## Feature-Specific Configuration

### 1. Exam Deadline Utility Configuration

No specific configuration required. Uses system time (`LocalDateTime.now()`).

**Timezone Considerations:**

```properties
# Set application timezone (optional)
spring.jackson.time-zone=Asia/Ho_Chi_Minh
spring.jpa.properties.hibernate.jdbc.time_zone=UTC
```

### 2. JWT Token Configuration

```properties
# Token secret (must be at least 256 bits for HS256)
app.jwt.secret=your-very-long-secret-key-minimum-256-bits-long-for-security

# Token expiration time in milliseconds (86400000 = 24 hours)
app.jwt.expiration=86400000
```

### 3. File Upload Configuration

```properties
# Upload directory (absolute or relative path)
file.upload.dir=uploads/

# Maximum file size in bytes
# 52428800 bytes = 50 MB
file.upload.max-size=52428800

# Allowed file extensions (updated in FileUploadService.java)
# Default: pdf, doc, docx, xls, xlsx, ppt, pptx, txt, jpg, png, gif, zip
```

### 4. Email Notification Configuration

```properties
# From email address
spring.mail.from=noreply@hethongthionline.edu.vn

# Sender name
mail.from.name=Hệ Thống Thi Online

# App name (used in email templates)
app.name=Hệ Thống Thi Online
```

### 5. WebSocket Configuration

```properties
# STOMP endpoint
websocket.endpoint=/ws-exam

# Allowed origins for WebSocket
websocket.allowed-origins=http://localhost:3000,http://localhost:4200

# Heartbeat configuration (milliseconds)
websocket.heartbeat.client=25000
websocket.heartbeat.server=25000
```

### 6. Database Connection Pooling

```properties
# Connection Pool Settings (HikariCP)
spring.datasource.hikari.maximumPoolSize=20
spring.datasource.hikari.minimumIdle=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000
```

---

## Environment Variables

Instead of hardcoding sensitive data in application.properties, use environment variables:

### Windows Command Prompt

```cmd
set SPRING_DATASOURCE_PASSWORD=your_password
set SPRING_MAIL_PASSWORD=your_email_password
set APP_JWT_SECRET=your_jwt_secret
```

### Linux/Mac (bash)

```bash
export SPRING_DATASOURCE_PASSWORD=your_password
export SPRING_MAIL_PASSWORD=your_email_password
export APP_JWT_SECRET=your_jwt_secret
```

### Docker Environment File (.env)

```env
SPRING_DATASOURCE_PASSWORD=your_password
SPRING_MAIL_PASSWORD=your_email_password
APP_JWT_SECRET=your_jwt_secret
```

### application.properties with Variables

```properties
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
spring.mail.password=${SPRING_MAIL_PASSWORD}
app.jwt.secret=${APP_JWT_SECRET}
```

---

## Database Connection Strings

### SQL Server (Windows Authentication)

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=HeThongThiOnline;integratedSecurity=true
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
```

### SQL Server (SQL Authentication)

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=HeThongThiOnline;user=sa;password=your_password
spring.datasource.username=sa
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver
```

### SQL Server (SSL/TLS)

```properties
spring.datasource.url=jdbc:sqlserver://server.database.windows.net:1433;databaseName=HeThongThiOnline;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net
spring.datasource.username=user@server
spring.datasource.password=password
```

---

## Logging Configuration Examples

### Console Logging Only

```properties
logging.level.root=INFO
logging.level.com.example.exam=DEBUG
logging.pattern.console=%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n
```

### File and Console Logging

```properties
logging.file.name=logs/application.log
logging.file.max-size=10MB
logging.file.max-history=10
logging.file.total-size-cap=100MB
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
logging.pattern.console=%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n
```

### Logback Configuration (logback-spring.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <property name="LOG_FILE" value="${LOG_FILE:-${LOG_PATH:-${LOG_TEMP:-${java.io.tmpdir:-/tmp}}/}spring.log}"/>

    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_FILE}</file>
        <encoder>
            <pattern>%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
        <rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
            <fileNamePattern>${LOG_FILE}.%d{yyyy-MM-dd}.%i.gz</fileNamePattern>
            <maxFileSize>10MB</maxFileSize>
            <maxHistory>10</maxHistory>
            <totalSizeCap>100MB</totalSizeCap>
        </rollingPolicy>
    </appender>

    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>

    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>
</configuration>
```

---

## Email Setup Guides

### Gmail Setup (2-Factor Authentication Required)

1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer" (or your device)
4. Copy the 16-character password
5. Use in application.properties:

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=xxxx xxxx xxxx xxxx
```

### Microsoft Outlook Setup

1. Go to https://account.microsoft.com/security
2. Manage advanced security settings if needed
3. Use your email and password:

```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=your-email@outlook.com
spring.mail.password=your-password
```

### Corporate Email Setup

1. Get SMTP server details from IT department
2. Usually: `mail.company.com` or `smtp.company.com`
3. Use internal credentials:

```properties
spring.mail.host=mail.company.com
spring.mail.port=587
spring.mail.username=your-username
spring.mail.password=your-password
```

---

## Performance Tuning

### Connection Pool Optimization

```properties
# For high-traffic applications
spring.datasource.hikari.maximumPoolSize=50
spring.datasource.hikari.minimumIdle=10
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
```

### JPA Batch Processing

```properties
# Batch insert/update optimization
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
spring.jpa.properties.hibernate.jdbc.fetch_size=50
```

### Memory Configuration

```bash
# Minimum heap: 512MB, Maximum heap: 2GB
java -Xms512m -Xmx2g -jar exam-0.0.1-SNAPSHOT.jar

# For large export operations
java -Xms1g -Xmx4g -jar exam-0.0.1-SNAPSHOT.jar
```

### Caching Configuration

```properties
# Enable caching
spring.cache.type=simple

# Or use Redis
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379
```

---

## Troubleshooting Configuration Issues

### Issue: "Unknown property 'spring.mail.from'"

**Solution:** This is a custom property. Add to `@Value` annotation:

```java
@Value("${spring.mail.from}")
private String mailFrom;
```

### Issue: "Could not resolve host: smtp.gmail.com"

**Solution:** Check network connectivity and DNS:

```bash
ping smtp.gmail.com
nslookup smtp.gmail.com
```

### Issue: "Connection refused to database"

**Solution:** Verify SQL Server is running:

```bash
# Windows
sqlcmd -S localhost -U sa -P your_password -Q "SELECT 1"

# Check server status
Get-Service -Name MSSQL* | Format-Table Status, Name
```

### Issue: "File size exceeds maximum: 52428800 bytes"

**Solution:** Increase the limit in application.properties:

```properties
# Increase to 100MB
file.upload.max-size=104857600

# Also update Spring's multipart settings
spring.servlet.multipart.max-file-size=100MB
spring.servlet.multipart.max-request-size=100MB
```

---

## Deployment Checklists

### Pre-Deployment Checklist

- [ ] Database credentials updated in application.properties
- [ ] Email SMTP credentials configured
- [ ] JWT secret updated to strong value (256+ bits)
- [ ] File upload directory created with correct permissions
- [ ] Firewall rules allow port 8080 (or configured port)
- [ ] HTTPS certificates installed (if using HTTPS)
- [ ] All environment variables exported
- [ ] Build successfully: `mvn clean package`

### Post-Deployment Checklist

- [ ] Application starts without errors
- [ ] Database tables created automatically
- [ ] API endpoints responding (test with curl/Postman)
- [ ] Email notifications sending successfully
- [ ] File uploads working correctly
- [ ] WebSocket connections established
- [ ] Logs generated in expected location
- [ ] Monitoring/alerting configured

---

**Configuration Complete**
**Last Updated:** 2024
**Version:** 1.0
