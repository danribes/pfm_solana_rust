# SSL Certificate Management Guide

## Overview

This guide covers the comprehensive SSL/TLS certificate management system implemented for the PFM Community Management application. The system provides automated certificate acquisition, renewal, monitoring, and security validation.

## Architecture

### Components

1. **Certificate Acquisition & Management**
   - Let's Encrypt integration with Certbot
   - Automated HTTP-01 challenge validation
   - Multi-domain certificate support
   - Certificate chain validation

2. **Automated Renewal System**
   - Scheduled certificate renewal (twice daily)
   - Backup and rollback capabilities
   - Service restart automation
   - Failure detection and alerting

3. **Security Monitoring**
   - Certificate expiry monitoring
   - SSL configuration validation
   - Security headers verification
   - Certificate transparency monitoring

4. **Emergency Response**
   - Emergency renewal procedures
   - Critical expiry alerts
   - Multi-channel notifications
   - Backup and recovery systems

## Configuration

### Domain Configuration

The system manages certificates for the following domains:
- `pfm-community.app` (primary application)
- `api.pfm-community.app` (API endpoint)
- `admin.pfm-community.app` (admin portal)
- `member.pfm-community.app` (member portal)

### TLS Security Configuration

- **Protocols**: TLS 1.2 and TLS 1.3 only
- **Cipher Suites**: Modern AEAD ciphers with Perfect Forward Secrecy
- **OCSP Stapling**: Enabled for certificate validation
- **Session Management**: Secure session cache configuration

## Usage

### Initial Certificate Deployment

```bash
# Deploy certificates for all domains
sudo ./scripts/ssl/deploy-certificates.sh
```

### Manual Certificate Renewal

```bash
# Standard renewal check
sudo ./scripts/ssl/renew-certificates.sh

# Force renewal of all certificates
sudo ./scripts/ssl/renew-certificates.sh force
```

### SSL Validation and Testing

```bash
# Validate all SSL configurations
./scripts/ssl/validate-ssl.sh

# Test specific domain
DOMAINS="api.pfm-community.app" ./scripts/ssl/validate-ssl.sh
```

### Certificate Monitoring

```bash
# Run certificate monitoring
./scripts/ssl/certificate-monitor.sh

# Generate monitoring report
./scripts/ssl/certificate-monitor.sh report
```

### Emergency Procedures

```bash
# Check emergency status
sudo ./scripts/ssl/emergency-renewal.sh check

# Run emergency renewal
sudo ./scripts/ssl/emergency-renewal.sh emergency
```

## Docker Integration

### SSL Services

Start SSL-enabled services:

```bash
# Start SSL services alongside main application
docker-compose -f docker-compose.yml -f infra/ssl/docker-compose.ssl.yml up -d
```

## Automation

### Scheduled Tasks

The system implements the following automated schedules:

```bash
# Certificate renewal - twice daily
30 2,14 * * * /path/to/scripts/ssl/renew-certificates.sh

# Certificate monitoring - hourly
0 * * * * /path/to/scripts/ssl/certificate-monitor.sh check
```

## Monitoring and Alerting

### Certificate Expiry Monitoring

- **Warning Threshold**: 14 days before expiry
- **Critical Threshold**: 7 days before expiry
- **Emergency Threshold**: 3 days before expiry

### Notification Channels

1. **Email Notifications**
   - Recipients: admin@pfm-community.app, devops@pfm-community.app

2. **Webhook Notifications**
   - Endpoint: https://api.pfm-community.app/webhooks/ssl-status

## Security Considerations

### Certificate Storage

- **Location**: `/etc/letsencrypt/`
- **Permissions**: Private keys restricted to root:ssl-cert (600)
- **Backup**: Encrypted backups with 30-day retention

### Network Security

- **HSTS**: Enforced with preload list inclusion
- **Certificate Pinning**: HTTP Public Key Pinning (HPKP) configured
- **OCSP**: Must-staple and OCSP stapling enabled
- **Cipher Suites**: Only modern, secure ciphers allowed

## Troubleshooting

### Common Issues

#### Certificate Renewal Failures

```bash
# Check certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Manual renewal for specific domain
sudo certbot renew --cert-name pfm-community.app --force-renewal
```

#### SSL Configuration Issues

```bash
# Test nginx configuration
sudo nginx -t

# Validate SSL configuration
./scripts/ssl/validate-ssl.sh
```

### Emergency Procedures

#### Expired Certificate Recovery

1. **Immediate Response**:
   ```bash
   sudo ./scripts/ssl/emergency-renewal.sh emergency
   ```

2. **Manual Recovery**:
   ```bash
   sudo certbot certonly --standalone -d pfm-community.app
   ```

## Support and Contact

For SSL certificate management issues:

- **Primary Contact**: admin@pfm-community.app
- **Emergency Contact**: devops@pfm-community.app
