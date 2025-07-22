# Linux System Info Monitor

[![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=QiangyuLi.linux-sysinfo-monitor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A comprehensive VS Code extension that provides real-time system monitoring for Linux platforms directly in your status bar. Monitor CPU usage, memory, disk space, network activity, and system temperature without leaving your development environment.

![System Monitor Demo](https://via.placeholder.com/800x200/1e1e1e/ffffff?text=🖥️+CPU:+8c/45%25+|+🧠+RAM:+8GB/16GB+(50%25)+|+💾+Disk:+75%25+|+⏱️+Up:+120min+|+📊+Load:+1.23+|+🌐+Net:+↓25MB+↑5MB+|+🌡️+65°C)

## ✨ Features

### 🔄 Real-time Monitoring
- **CPU**: Core count, usage percentage, and load average
- **Memory**: Used/total memory with percentage utilization
- **Disk**: Root partition usage monitoring
- **Network**: Live download/upload speed tracking
- **Temperature**: CPU temperature monitoring (when available)
- **Uptime**: System uptime tracking

### 🎛️ Flexible Display Options
- **Compact Status Bar**: Essential info at a glance
- **Detailed View**: Comprehensive system information in markdown format
- **Popup Messages**: Quick system info display
- **Configurable Elements**: Show/hide specific metrics

### ⚙️ Customizable Settings
- **Refresh Interval**: 1-60 seconds (default: 5 seconds)
- **Toggle Components**: Enable/disable temperature, network, disk monitoring
- **Auto-start**: Begins monitoring when VS Code starts

## 📊 System Information Display

### Status Bar (Compact View)
```
🖥️ CPU: 8c/45% | 🧠 RAM: 8/16GB (50%) | 💾 Disk: 75% | ⏱️ Up: 120min | 📊 Load: 1.23 | 🌐 Net: ↓25MB ↑5MB | 🌡️ 65°C
```

### Detailed View
- 🖥️ **CPU Information**: Cores, usage, load average, temperature
- 🧠 **Memory Statistics**: Used, total, percentage breakdown
- 💾 **Storage**: Root partition usage details
- ⏱️ **System Uptime**: Runtime in minutes/hours
- 🌐 **Network Activity**: Interface statistics and transfer rates

## 🚀 Quick Start

### Installation
1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for "Linux System Info Monitor"
4. Click **Install**
5. The monitor will automatically start!

### Commands
Access these commands via Command Palette (`Ctrl+Shift+P`):

| Command | Description |
|---------|-------------|
| `Show Linux System Info` | Display quick system info popup |
| `Show Detailed Linux System Info` | Open comprehensive system report |
| `Refresh Linux System Info` | Manually update system data |
| `Toggle Linux System Monitor` | Turn status bar display on/off |

## ⚙️ Configuration

Customize the extension through VS Code settings (`Ctrl+,`):

```json
{
  "linuxSysinfoMonitor.refreshInterval": 5000,     // Update interval (1000-60000ms)
  "linuxSysinfoMonitor.showTemperature": true,     // Show CPU temperature
  "linuxSysinfoMonitor.showNetworkInfo": true,     // Show network statistics
  "linuxSysinfoMonitor.showDiskUsage": true        // Show disk usage
}
```

## 🖥️ System Requirements

| Requirement | Details |
|-------------|---------|
| **OS** | Linux (Ubuntu, Debian, CentOS, Arch, etc.) |
| **VS Code** | Version 1.102.0 or higher |
| **Commands** | `df`, `ip`, `top`, `cat` (standard Linux tools) |
| **Optional** | `lm-sensors` for enhanced temperature monitoring |

## 🔧 Technical Features

- **TypeScript Implementation**: Type-safe, robust codebase
- **Asynchronous Operations**: Non-blocking system calls
- **Error Handling**: Graceful fallbacks when commands fail
- **Resource Management**: Proper cleanup and memory management
- **Configuration Reactive**: Live updates when settings change

## 🌡️ Temperature Monitoring

The extension uses multiple methods to detect CPU temperature:

1. **lm-sensors**: `sensors` command output parsing
2. **Thermal Zones**: Direct `/sys/class/thermal/thermal_zone0/temp` reading
3. **Graceful Fallback**: Continues without temperature if unavailable

Install sensors for best results:
```bash
# Ubuntu/Debian
sudo apt install lm-sensors
sudo sensors-detect

# CentOS/RHEL
sudo yum install lm_sensors
```

## 🌐 Network Monitoring

Real-time network speed calculation:
- Monitors the primary network interface (auto-detected)
- Shows actual current transfer rates (not cumulative)
- Formats speeds intelligently (B/s → KB/s → MB/s)
- Updates based on your configured refresh interval

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| "❌ System info unavailable" | Verify Linux system with required commands |
| No temperature data | Install `lm-sensors` or check thermal zone permissions |
| Network stats missing | Ensure network interface is active and accessible |
| High CPU usage | Increase refresh interval in settings |

## 🏗️ Development

### Building from Source
```bash
# Clone the repository
git clone https://github.com/QiangyuLi/linux-sysinfo-monitor.git
cd linux-sysinfo-monitor

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Run tests
npm test

# Package extension
npm run vscode:prepublish
```

### Project Structure
```
├── src/
│   ├── extension.ts          # Main extension logic
│   └── test/
│       └── extension.test.ts # Test suite
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **🐛 Report Bugs**: Open an issue with system details and error logs
2. **💡 Suggest Features**: Share ideas for new monitoring capabilities  
3. **🔧 Submit PRs**: Fork, create feature branch, submit pull request
4. **📝 Improve Docs**: Help make documentation clearer

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Ensure Linux compatibility

## 📈 Roadmap

- [ ] Support for additional Linux distributions
- [ ] GPU monitoring support
- [ ] Process monitoring and top processes display
- [ ] Historical data graphs
- [ ] Custom alert thresholds
- [ ] Export system reports

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- VS Code Extension API documentation
- Linux system monitoring community
- Contributors and users providing feedback

---

**Made with ❤️ for the Linux development community**

[Report Issues](https://github.com/QiangyuLi/linux-sysinfo-monitor/issues) • [Feature Requests](https://github.com/QiangyuLi/linux-sysinfo-monitor/issues/new) • [Marketplace](https://marketplace.visualstudio.com/items?itemName=QiangyuLi.linux-sysinfo-monitor)
