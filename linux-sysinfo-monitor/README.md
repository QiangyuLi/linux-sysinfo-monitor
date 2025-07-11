# Linux System Info Monitor

A comprehensive VS Code extension that provides real-time system monitoring for Linux platforms directly in your status bar.

## Features

- **Real-time System Monitoring**: Displays CPU usage, memory usage, disk usage, uptime, and more
- **Status Bar Integration**: Shows system information directly in your VS Code status bar
- **Detailed System Information**: Click on the status bar to get detailed system information in a separate document
- **Configurable Refresh Rate**: Customize how often the system information is updated
- **Temperature Monitoring**: Shows CPU temperature if available (requires `sensors` or thermal zone support)
- **Network Statistics**: Displays network transfer statistics for the main interface
- **Load Average**: Shows system load average
- **Multiple Commands**: Various commands to control the extension

## System Information Displayed

### Status Bar (Compact View)
- **CPU**: Core count and usage percentage
- **Memory**: Used/Total memory in GB with percentage
- **Disk**: Root partition usage percentage
- **Uptime**: System uptime in minutes
- **Load**: System load average
- **Network**: Real-time network speed (↓download ↑upload in B/s, KB/s, or MB/s)
- **Temperature**: CPU temperature (if available)

### Detailed View
- Comprehensive CPU information including cores, usage, load average, and temperature
- Detailed memory statistics
- Disk usage information
- System uptime
- Network transfer statistics

## Commands

The extension provides the following commands:

- `Show Linux System Info`: Display system information in a popup message
- `Show Detailed Linux System Info`: Open a detailed system information document
- `Refresh Linux System Info`: Manually refresh the system information
- `Toggle Linux System Monitor`: Toggle the status bar display on/off

## Configuration

You can customize the extension behavior through VS Code settings:

### Settings

- `linuxSysinfoMonitor.refreshInterval`: Refresh interval in milliseconds (default: 5000, min: 1000, max: 60000)
- `linuxSysinfoMonitor.showTemperature`: Show CPU temperature if available (default: true)
- `linuxSysinfoMonitor.showNetworkInfo`: Show network transfer statistics (default: true)
- `linuxSysinfoMonitor.showDiskUsage`: Show disk usage for root partition (default: true)

## Requirements

This extension is designed specifically for Linux systems and requires:

- Linux operating system
- Basic system commands: `df`, `ip`, `top`, `cat`
- Optional: `sensors` for temperature monitoring

## Installation

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X)
3. Search for "Linux System Info Monitor"
4. Click Install

## Usage

1. After installation, the extension will automatically start monitoring and display system information in the status bar
2. Click on the status bar item to open detailed system information
3. Use the Command Palette (Ctrl+Shift+P) to access extension commands
4. Configure the extension through VS Code settings

## Temperature Monitoring

The extension attempts to read CPU temperature through multiple methods:
1. Using `sensors` command (if lm-sensors is installed)
2. Reading from `/sys/class/thermal/thermal_zone0/temp`

If neither method works, temperature information will not be displayed.

## Network Statistics

The extension shows real-time network speed for the main network interface (the one used for external connectivity). The speed is calculated by measuring the difference in bytes transferred between refresh intervals, showing actual current download/upload speeds in B/s, KB/s, or MB/s.

## Troubleshooting

If the extension shows "❌ System info unavailable":
1. Ensure you're running on a Linux system
2. Check that required commands (`df`, `ip`, `top`) are available
3. Verify file system permissions allow reading system information

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This extension is released under the MIT License.
