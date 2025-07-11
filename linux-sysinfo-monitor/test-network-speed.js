#!/usr/bin/env node

// Test the real-time network speed calculation
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function testNetworkSpeed() {
    console.log('🌐 Testing Real-time Network Speed Calculation...\n');
    
    try {
        // Get main network interface
        const { stdout: netOut } = await execAsync("ip route get 8.8.8.8 | head -1 | awk '{print $5}'");
        const mainInterface = netOut.trim();
        console.log(`Main Network Interface: ${mainInterface}`);
        
        // Get network stats twice with a delay to calculate speed
        const { stdout: netStats1 } = await execAsync(`cat /proc/net/dev | grep ${mainInterface} | awk '{print $2, $10}'`);
        const [rxBytes1, txBytes1] = netStats1.trim().split(' ').map(Number);
        const time1 = Date.now();
        
        console.log(`Initial Reading: RX=${rxBytes1} bytes, TX=${txBytes1} bytes`);
        
        // Wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { stdout: netStats2 } = await execAsync(`cat /proc/net/dev | grep ${mainInterface} | awk '{print $2, $10}'`);
        const [rxBytes2, txBytes2] = netStats2.trim().split(' ').map(Number);
        const time2 = Date.now();
        
        console.log(`Second Reading: RX=${rxBytes2} bytes, TX=${txBytes2} bytes`);
        
        // Calculate speed
        const timeDiff = (time2 - time1) / 1000; // seconds
        const rxDiff = rxBytes2 - rxBytes1;
        const txDiff = txBytes2 - txBytes1;
        
        const rxSpeed = Math.round(rxDiff / timeDiff); // bytes/sec
        const txSpeed = Math.round(txDiff / timeDiff); // bytes/sec
        
        // Format speeds
        const formatSpeed = (bytesPerSec) => {
            if (bytesPerSec < 1024) return `${bytesPerSec}B/s`;
            if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)}KB/s`;
            return `${(bytesPerSec / (1024 * 1024)).toFixed(1)}MB/s`;
        };
        
        console.log(`\n📊 Network Speed Calculation:`);
        console.log(`   Time Difference: ${timeDiff.toFixed(2)} seconds`);
        console.log(`   RX Difference: ${rxDiff} bytes`);
        console.log(`   TX Difference: ${txDiff} bytes`);
        console.log(`   Download Speed: ${formatSpeed(rxSpeed)}`);
        console.log(`   Upload Speed: ${formatSpeed(txSpeed)}`);
        console.log(`   Status Bar Format: ↓${formatSpeed(rxSpeed)} ↑${formatSpeed(txSpeed)}`);
        
    } catch (error) {
        console.error('Error testing network speed:', error.message);
    }
}

testNetworkSpeed();
