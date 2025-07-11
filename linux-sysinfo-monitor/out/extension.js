"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// Global variables to track network stats over time
let previousNetworkStats = null;
async function getSystemInfo() {
    const cpuCount = os.cpus().length;
    const freeMemBytes = os.freemem();
    const totalMemBytes = os.totalmem();
    const memoryUsed = (totalMemBytes - freeMemBytes) / (1024 * 1024 * 1024); // GB
    const memoryTotal = totalMemBytes / (1024 * 1024 * 1024); // GB
    const memoryPercentage = Math.round(((totalMemBytes - freeMemBytes) / totalMemBytes) * 100);
    const uptime = Math.round(os.uptime() / 60);
    const loadAverage = os.loadavg();
    let cpuUsage = 0;
    let diskUsage = 'N/A';
    let networkInfo = 'N/A';
    let temperature = null;
    try {
        // Get CPU usage
        const cpuData = await getCpuUsage();
        cpuUsage = cpuData;
        // Get disk usage for root partition
        const { stdout: diskOut } = await execAsync("df -h / | awk 'NR==2 {print $5}'");
        diskUsage = diskOut.trim();
        // Get network interface info
        const { stdout: netOut } = await execAsync("ip route get 8.8.8.8 | head -1 | awk '{print $5}'");
        const mainInterface = netOut.trim();
        if (mainInterface) {
            const { stdout: netStats } = await execAsync(`cat /proc/net/dev | grep ${mainInterface} | awk '{print $2, $10}'`);
            if (netStats.trim()) {
                const [rxBytes, txBytes] = netStats.trim().split(' ').map(Number);
                const currentTime = Date.now();
                if (previousNetworkStats && previousNetworkStats.interface === mainInterface) {
                    // Calculate speed (bytes per second)
                    const timeDiff = (currentTime - previousNetworkStats.timestamp) / 1000; // seconds
                    const rxDiff = rxBytes - previousNetworkStats.rxBytes;
                    const txDiff = txBytes - previousNetworkStats.txBytes;
                    if (timeDiff > 0) {
                        const rxSpeed = Math.round(rxDiff / timeDiff); // bytes/sec
                        const txSpeed = Math.round(txDiff / timeDiff); // bytes/sec
                        // Format speeds nicely
                        const formatSpeed = (bytesPerSec) => {
                            if (bytesPerSec < 1024) {
                                return `${bytesPerSec}B/s`;
                            }
                            if (bytesPerSec < 1024 * 1024) {
                                return `${(bytesPerSec / 1024).toFixed(1)}KB/s`;
                            }
                            return `${(bytesPerSec / (1024 * 1024)).toFixed(1)}MB/s`;
                        };
                        networkInfo = `↓${formatSpeed(rxSpeed)} ↑${formatSpeed(txSpeed)}`;
                    }
                }
                // Update previous stats for next calculation
                previousNetworkStats = {
                    interface: mainInterface,
                    rxBytes,
                    txBytes,
                    timestamp: currentTime
                };
            }
        }
        // Get CPU temperature (if available)
        try {
            const { stdout: tempOut } = await execAsync("sensors | grep 'Package id 0' | awk '{print $4}' | sed 's/+//g' | sed 's/°C//g'");
            if (tempOut.trim()) {
                temperature = parseFloat(tempOut.trim());
            }
            else {
                // Try alternative temperature reading
                const { stdout: tempOut2 } = await execAsync("cat /sys/class/thermal/thermal_zone0/temp");
                if (tempOut2.trim()) {
                    temperature = Math.round(parseInt(tempOut2.trim()) / 1000);
                }
            }
        }
        catch (e) {
            // Temperature reading failed, keep as null
        }
    }
    catch (error) {
        // Some commands failed, but we'll use the basic info we have
    }
    return {
        cpuCount,
        cpuUsage,
        memoryUsed,
        memoryTotal,
        memoryPercentage,
        diskUsage,
        uptime,
        loadAverage,
        networkInfo,
        temperature
    };
}
async function getCpuUsage() {
    try {
        const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'");
        const usage = parseFloat(stdout.trim());
        return isNaN(usage) ? 0 : Math.round(usage);
    }
    catch (error) {
        return 0;
    }
}
function formatSystemInfo(info) {
    const config = vscode.workspace.getConfiguration('linuxSysinfoMonitor');
    let result = `🖥️ CPU: ${info.cpuCount}c/${info.cpuUsage}% | 🧠 RAM: ${info.memoryUsed.toFixed(1)}/${info.memoryTotal.toFixed(1)}GB (${info.memoryPercentage}%)`;
    if (config.get('showDiskUsage', true) && info.diskUsage !== 'N/A') {
        result += ` | 💾 Disk: ${info.diskUsage}`;
    }
    result += ` | ⏱️ Up: ${info.uptime}min`;
    if (info.loadAverage.length > 0) {
        result += ` | 📊 Load: ${info.loadAverage[0].toFixed(2)}`;
    }
    if (config.get('showNetworkInfo', true) && info.networkInfo !== 'N/A') {
        result += ` | 🌐 Net: ${info.networkInfo}`;
    }
    if (config.get('showTemperature', true) && info.temperature !== null) {
        result += ` | 🌡️ ${info.temperature}°C`;
    }
    return result;
}
function formatDetailedSystemInfo(info) {
    let details = `🖥️ **CPU Information:**\n`;
    details += `   • Cores: ${info.cpuCount}\n`;
    details += `   • Usage: ${info.cpuUsage}%\n`;
    details += `   • Load Average: ${info.loadAverage.map(l => l.toFixed(2)).join(', ')}\n`;
    if (info.temperature !== null) {
        details += `   • Temperature: ${info.temperature}°C\n`;
    }
    details += `\n🧠 **Memory Information:**\n`;
    details += `   • Used: ${info.memoryUsed.toFixed(1)} GB\n`;
    details += `   • Total: ${info.memoryTotal.toFixed(1)} GB\n`;
    details += `   • Usage: ${info.memoryPercentage}%\n`;
    if (info.diskUsage !== 'N/A') {
        details += `\n💾 **Disk Information:**\n`;
        details += `   • Root partition usage: ${info.diskUsage}\n`;
    }
    details += `\n⏱️ **System Uptime:** ${info.uptime} minutes\n`;
    if (info.networkInfo !== 'N/A') {
        details += `\n🌐 **Network Speed:** ${info.networkInfo}\n`;
    }
    return details;
}
function activate(context) {
    // Create a status bar item to display system info
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.tooltip = 'Linux System Monitor - Click for details';
    statusBarItem.command = 'linuxSysinfoMonitor.showDetails';
    context.subscriptions.push(statusBarItem);
    let intervalId = null;
    // Function to update status bar text
    const updateStatusBar = async () => {
        try {
            const info = await getSystemInfo();
            statusBarItem.text = formatSystemInfo(info);
            statusBarItem.show();
        }
        catch (error) {
            statusBarItem.text = '❌ System info unavailable';
            statusBarItem.show();
        }
    };
    // Function to start monitoring with configurable interval
    const startMonitoring = () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
        const config = vscode.workspace.getConfiguration('linuxSysinfoMonitor');
        const interval = config.get('refreshInterval', 5000);
        updateStatusBar(); // Initial display
        intervalId = setInterval(updateStatusBar, interval);
    };
    // Start monitoring
    startMonitoring();
    // Listen for configuration changes
    const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('linuxSysinfoMonitor')) {
            startMonitoring(); // Restart with new settings
        }
    });
    context.subscriptions.push(configChangeDisposable);
    // Cleanup interval on deactivation
    context.subscriptions.push({ dispose: () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        } });
    // Command to show basic info in a popup
    const showDisposable = vscode.commands.registerCommand('linuxSysinfoMonitor.showInfo', async () => {
        try {
            const info = await getSystemInfo();
            vscode.window.showInformationMessage(formatSystemInfo(info));
        }
        catch (error) {
            vscode.window.showErrorMessage('Failed to get system information');
        }
    });
    context.subscriptions.push(showDisposable);
    // Command to show detailed info in a new document
    const showDetailsDisposable = vscode.commands.registerCommand('linuxSysinfoMonitor.showDetails', async () => {
        try {
            const info = await getSystemInfo();
            const doc = await vscode.workspace.openTextDocument({
                content: formatDetailedSystemInfo(info),
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
        }
        catch (error) {
            vscode.window.showErrorMessage('Failed to get detailed system information');
        }
    });
    context.subscriptions.push(showDetailsDisposable);
    // Command to manually refresh status bar
    const refreshDisposable = vscode.commands.registerCommand('linuxSysinfoMonitor.refresh', () => {
        updateStatusBar();
    });
    context.subscriptions.push(refreshDisposable);
    // Command to toggle status bar visibility
    const toggleDisposable = vscode.commands.registerCommand('linuxSysinfoMonitor.toggle', () => {
        if (statusBarItem.text) {
            statusBarItem.hide();
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        }
        else {
            startMonitoring();
        }
    });
    context.subscriptions.push(toggleDisposable);
}
function deactivate() {
    // Reset network stats on deactivation
    previousNetworkStats = null;
}
//# sourceMappingURL=extension.js.map