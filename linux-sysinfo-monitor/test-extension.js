#!/usr/bin/env node

// Simple test script to verify the extension's system information gathering
const { exec } = require('child_process');
const { promisify } = require('util');
const os = require('os');

const execAsync = promisify(exec);

async function testSystemInfo() {
    console.log('Testing Linux System Info Monitor Extension...\n');
    
    // Test basic Node.js system info
    console.log('📊 Basic System Info (Node.js):');
    console.log(`   CPU Cores: ${os.cpus().length}`);
    console.log(`   Total Memory: ${Math.round(os.totalmem() / (1024 * 1024))} MB`);
    console.log(`   Free Memory: ${Math.round(os.freemem() / (1024 * 1024))} MB`);
    console.log(`   Uptime: ${Math.round(os.uptime() / 60)} minutes`);
    console.log(`   Load Average: ${os.loadavg().map(l => l.toFixed(2)).join(', ')}`);
    console.log(`   Platform: ${os.platform()}`);
    console.log(`   Architecture: ${os.arch()}`);
    
    console.log('\n🔧 Testing Linux Commands:');
    
    // Test disk usage
    try {
        const { stdout: diskOut } = await execAsync("df -h / | awk 'NR==2 {print $5}'");
        console.log(`   Disk Usage: ${diskOut.trim()}`);
    } catch (e) {
        console.log(`   Disk Usage: Failed - ${e.message}`);
    }
    
    // Test CPU usage
    try {
        const { stdout: cpuOut } = await execAsync("top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'");
        console.log(`   CPU Usage: ${parseFloat(cpuOut.trim()).toFixed(1)}%`);
    } catch (e) {
        console.log(`   CPU Usage: Failed - ${e.message}`);
    }
    
    // Test network interface
    try {
        const { stdout: netOut } = await execAsync("ip route get 8.8.8.8 | head -1 | awk '{print $5}'");
        console.log(`   Main Network Interface: ${netOut.trim()}`);
    } catch (e) {
        console.log(`   Main Network Interface: Failed - ${e.message}`);
    }
    
    // Test temperature
    try {
        const { stdout: tempOut } = await execAsync("sensors | grep 'Package id 0' | awk '{print $4}' | sed 's/+//g' | sed 's/°C//g'");
        if (tempOut.trim()) {
            console.log(`   CPU Temperature: ${tempOut.trim()}°C`);
        } else {
            // Try alternative method
            const { stdout: tempOut2 } = await execAsync("cat /sys/class/thermal/thermal_zone0/temp");
            if (tempOut2.trim()) {
                console.log(`   CPU Temperature: ${Math.round(parseInt(tempOut2.trim()) / 1000)}°C`);
            } else {
                console.log(`   CPU Temperature: Not available`);
            }
        }
    } catch (e) {
        console.log(`   CPU Temperature: Not available - ${e.message}`);
    }
    
    console.log('\n✅ Test completed!');
}

testSystemInfo().catch(console.error);
