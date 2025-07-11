import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SystemInfo {
	cpuCount: number;
	cpuUsage: number;
	memoryUsed: number;
	memoryTotal: number;
	memoryPercentage: number;
	diskUsage: string;
	uptime: number;
	loadAverage: number[];
	networkInfo: string;
	temperature: number | null;
}

async function getSystemInfo(): Promise<SystemInfo> {
	const cpuCount = os.cpus().length;
	const freeMemBytes = os.freemem();
	const totalMemBytes = os.totalmem();
	const memoryUsed = Math.round((totalMemBytes - freeMemBytes) / (1024 * 1024));
	const memoryTotal = Math.round(totalMemBytes / (1024 * 1024));
	const memoryPercentage = Math.round(((totalMemBytes - freeMemBytes) / totalMemBytes) * 100);
	const uptime = Math.round(os.uptime() / 60);
	const loadAverage = os.loadavg();

	let cpuUsage = 0;
	let diskUsage = 'N/A';
	let networkInfo = 'N/A';
	let temperature: number | null = null;

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
				const [rx, tx] = netStats.trim().split(' ');
				const rxMB = Math.round(parseInt(rx) / (1024 * 1024));
				const txMB = Math.round(parseInt(tx) / (1024 * 1024));
				networkInfo = `↓${rxMB}MB ↑${txMB}MB`;
			}
		}

		// Get CPU temperature (if available)
		try {
			const { stdout: tempOut } = await execAsync("sensors | grep 'Package id 0' | awk '{print $4}' | sed 's/+//g' | sed 's/°C//g'");
			if (tempOut.trim()) {
				temperature = parseFloat(tempOut.trim());
			} else {
				// Try alternative temperature reading
				const { stdout: tempOut2 } = await execAsync("cat /sys/class/thermal/thermal_zone0/temp");
				if (tempOut2.trim()) {
					temperature = Math.round(parseInt(tempOut2.trim()) / 1000);
				}
			}
		} catch (e) {
			// Temperature reading failed, keep as null
		}
	} catch (error) {
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

async function getCpuUsage(): Promise<number> {
	try {
		const { stdout } = await execAsync("top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'");
		const usage = parseFloat(stdout.trim());
		return isNaN(usage) ? 0 : Math.round(usage);
	} catch (error) {
		return 0;
	}
}

function formatSystemInfo(info: SystemInfo): string {
	const config = vscode.workspace.getConfiguration('linuxSysinfoMonitor');
	
	let result = `🖥️ CPU: ${info.cpuCount}c/${info.cpuUsage}% | 🧠 RAM: ${info.memoryUsed}/${info.memoryTotal}MB (${info.memoryPercentage}%)`;
	
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

function formatDetailedSystemInfo(info: SystemInfo): string {
	let details = `🖥️ **CPU Information:**\n`;
	details += `   • Cores: ${info.cpuCount}\n`;
	details += `   • Usage: ${info.cpuUsage}%\n`;
	details += `   • Load Average: ${info.loadAverage.map(l => l.toFixed(2)).join(', ')}\n`;
	if (info.temperature !== null) {
		details += `   • Temperature: ${info.temperature}°C\n`;
	}
	
	details += `\n🧠 **Memory Information:**\n`;
	details += `   • Used: ${info.memoryUsed} MB\n`;
	details += `   • Total: ${info.memoryTotal} MB\n`;
	details += `   • Usage: ${info.memoryPercentage}%\n`;
	
	if (info.diskUsage !== 'N/A') {
		details += `\n💾 **Disk Information:**\n`;
		details += `   • Root partition usage: ${info.diskUsage}\n`;
	}
	
	details += `\n⏱️ **System Uptime:** ${info.uptime} minutes\n`;
	
	if (info.networkInfo !== 'N/A') {
		details += `\n🌐 **Network:** ${info.networkInfo}\n`;
	}
	
	return details;
}

export function activate(context: vscode.ExtensionContext) {
  // Create a status bar item to display system info
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.tooltip = 'Linux System Monitor - Click for details';
  statusBarItem.command = 'linuxSysinfoMonitor.showDetails';
  context.subscriptions.push(statusBarItem);

  let intervalId: NodeJS.Timeout | null = null;

  // Function to update status bar text
  const updateStatusBar = async () => {
	try {
		const info = await getSystemInfo();
		statusBarItem.text = formatSystemInfo(info);
		statusBarItem.show();
	} catch (error) {
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
  }});

  // Command to show basic info in a popup
  const showDisposable = vscode.commands.registerCommand('linuxSysinfoMonitor.showInfo', async () => {
	try {
		const info = await getSystemInfo();
		vscode.window.showInformationMessage(formatSystemInfo(info));
	} catch (error) {
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
	} catch (error) {
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
	} else {
		startMonitoring();
	}
  });
  context.subscriptions.push(toggleDisposable);
}

export function deactivate() {
  // Subscriptions handle disposal of status bar and timer
}
