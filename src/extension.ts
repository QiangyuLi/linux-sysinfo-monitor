import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs';

function getSysInfo(): string {
	const cpus = os.cpus().length;
	const freeMem = (os.freemem() / (1024 * 1024)).toFixed(2);
	const totalMem = (os.totalmem() / (1024 * 1024)).toFixed(2);
	const uptime = (os.uptime() / 60).toFixed(1); // in minutes
	return `🖥️ CPUs: ${cpus} | 🧠 RAM: ${freeMem}/${totalMem} MB | ⏱️ Uptime: ${uptime} min`;
}

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('linuxSysinfoMonitor.showInfo', () => {
		vscode.window.showInformationMessage(getSysInfo());
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
