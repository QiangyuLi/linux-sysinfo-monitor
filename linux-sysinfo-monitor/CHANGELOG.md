# Change Log

All notable changes to the "linux-sysinfo-monitor" extension will be documented in this file.

## [0.0.1] - 2025-07-11

### Added
- Initial release of Linux System Info Monitor extension
- Real-time system monitoring in VS Code status bar
- Comprehensive system information display including:
  - CPU usage and core count
  - Memory usage and statistics
  - Disk usage for root partition
  - System uptime
  - Load average
  - Network transfer statistics
  - CPU temperature (if available)
- Configurable refresh interval
- Multiple display options:
  - Compact status bar view
  - Detailed information in separate document
  - Popup information message
- User-configurable settings:
  - Refresh interval (1-60 seconds)
  - Toggle temperature display
  - Toggle network statistics
  - Toggle disk usage display
- Commands for manual control:
  - Show system info popup
  - Show detailed system info
  - Refresh system info
  - Toggle status bar display
- Automatic detection of system capabilities
- Graceful fallback when system information is unavailable

### Technical Features
- TypeScript implementation
- Asynchronous system information gathering
- Configuration-aware display formatting
- Proper resource cleanup on deactivation
- Error handling for system command failures