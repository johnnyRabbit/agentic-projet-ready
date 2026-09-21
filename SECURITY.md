# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**DO NOT CREATE A GITHUB ISSUE** to report a security vulnerability.

If you discover a security vulnerability, please send an email to **security@aiengteam.com** with:

* Description of the vulnerability
* Steps to reproduce
* Potential impact
* Suggested fix (if any)

We will acknowledge your email within 48 hours, and will send a more detailed response within 72 hours indicating the next steps in handling your report.

After the initial reply to your report, the security team will endeavor to keep you informed of the progress towards a fix and full announcement, and may ask for additional information or guidance.

## Security Best Practices

### For Users

1. **Keep your API keys secure**
   * Never commit `.env` files to version control
   * Use environment variables for sensitive data
   * Rotate API keys regularly

2. **Review dependencies**
   * Run `npm audit` regularly
   * Keep dependencies up to date
   * Review security advisories

3. **Use HTTPS**
   * Always use HTTPS in production
   * Enable HSTS headers
   * Use secure cookies

4. **Limit permissions**
   * Follow the principle of least privilege
   * Use read-only access when possible
   * Scope API keys to minimum required permissions

### For Developers

1. **Input validation**
   * Validate all user inputs
   * Sanitize data before processing
   * Use parameterized queries

2. **Authentication & Authorization**
   * Implement proper authentication
   * Use role-based access control
   * Validate user permissions

3. **Data protection**
   * Encrypt sensitive data at rest
   * Use HTTPS for data in transit
   * Implement proper logging (no sensitive data)

4. **Code review**
   * Review all code for security issues
   * Use automated security scanning
   * Follow security coding guidelines

## Security Features

### Current Implementation

* **Sandboxed Execution**: Code runs in isolated Web Workers
* **API Key Management**: Keys stored in memory, not persisted
* **Input Validation**: All inputs validated before processing
* **Rate Limiting**: API calls are rate-limited
* **Error Handling**: Errors don't leak sensitive information

### Planned Features

* **Multi-factor Authentication**: For team collaboration
* **Audit Logging**: Track all security-relevant events
* **Encryption at Rest**: Encrypt IndexedDB data
* **CSP Headers**: Content Security Policy implementation
* **Dependency Scanning**: Automated vulnerability detection

## Incident Response

In case of a security incident:

1. **Detection**: Identify and assess the incident
2. **Containment**: Limit the damage
3. **Eradication**: Remove the threat
4. **Recovery**: Restore normal operations
5. **Lessons Learned**: Improve security posture

## Security Updates

Security updates will be announced via:

* GitHub Security Advisories
* Release notes
* Email notifications (for critical issues)

## Responsible Disclosure

We follow responsible disclosure practices:

* Report vulnerabilities privately
* Allow time for fixes before public disclosure
* Coordinate disclosure timeline with reporters
* Credit reporters (unless they prefer anonymity)

## Compliance

This project aims to comply with:

* OWASP Top 10
* GDPR (for EU users)
* SOC 2 (when applicable)
* ISO 27001 (when applicable)

## Contact

* Security team: security@aiengteam.com
* PGP key: Available upon request
* Bug bounty: Coming soon

---

Last updated: 2026-03-05
