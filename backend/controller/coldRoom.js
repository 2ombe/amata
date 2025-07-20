const IoTDevice = require('../models/IoTDevice');
const { publish } = require('../mqtt');

class TemperatureMonitor {
  constructor() {
    this.thresholds = {
      criticalHigh: 8, // °C
      warningHigh: 6,
      ideal: 4,
      warningLow: 2,
      criticalLow: 0
    };
    this.violationTimers = new Map();
  }

  async processReading(deviceId, temperature) {
    const device = await IoTDevice.findById(deviceId)
      .populate('collection');
    
    if (!device) return;
    
    // Log the reading
    await TemperatureReading.create({
      device: deviceId,
      temperature,
      timestamp: new Date()
    });
    
    // Check for violations
    const status = this.checkTemperatureStatus(temperature);
    
    if (status !== 'normal') {
      await this.handleViolation(device, temperature, status);
    } else {
      await this.clearViolation(deviceId);
    }
    
    // Update collection cooling metrics
    if (device.collection) {
      await Collection.findByIdAndUpdate(device.collection._id, {
        $push: {
          'cooling.temperatureLogs': {
            temperature,
            timestamp: new Date()
          }
        }
      });
    }
  }

  checkTemperatureStatus(temp) {
    if (temp > this.thresholds.criticalHigh) return 'critical_high';
    if (temp > this.thresholds.warningHigh) return 'warning_high';
    if (temp < this.thresholds.criticalLow) return 'critical_low';
    if (temp < this.thresholds.warningLow) return 'warning_low';
    return 'normal';
  }

  async handleViolation(device, temp, status) {
    const violationKey = `${device._id}-${status}`;
    
    if (!this.violationTimers.has(violationKey)) {
      // Start new violation timer
      const timer = setTimeout(async () => {
        await this.triggerAlert(device, temp, status);
        this.violationTimers.delete(violationKey);
      }, 5 * 60 * 1000); // 5 minute delay before alert
      
      this.violationTimers.set(violationKey, timer);
    }
    
    // Log preliminary warning
    await CoolingViolation.create({
      device: device._id,
      collection: device.collection?._id,
      temperature: temp,
      status,
      startTime: new Date()
    });
  }

  async triggerAlert(device, temp, status) {
    // 1. Notify responsible parties
    const recipients = await this.getNotificationRecipients(device);
    
    await NotificationService.broadcast({
      recipients,
      title: `Temperature Alert: ${status.replace('_', ' ')}`,
      message: `Device ${device.name} reports ${temp}°C`,
      priority: status.startsWith('critical') ? 'high' : 'medium'
    });
    
    // 2. Attempt automatic correction
    if (device.controlCapabilities?.includes('adjust_temperature')) {
      const targetTemp = this.thresholds.ideal;
      publish(`devices/${device._id}/control`, {
        command: 'set_temperature',
        value: targetTemp
      });
    }
    
    // 3. Update collection record
    if (device.collection) {
      await Collection.findByIdAndUpdate(device.collection._id, {
        $push: {
          'cooling.violations': {
            timestamp: new Date(),
            temperature: temp,
            duration: 5 * 60 * 1000,
            status
          }
        }
      });
    }
  }

  async clearViolation(deviceId) {
    const violations = Array.from(this.violationTimers.entries())
      .filter(([key]) => key.startsWith(deviceId));
    
    violations.forEach(([key, timer]) => {
      clearTimeout(timer);
      this.violationTimers.delete(key);
    });
    
    // Update any ongoing violation records
    await CoolingViolation.updateMany(
      { device: deviceId, endTime: { $exists: false } },
      { endTime: new Date() }
    );
  }
}