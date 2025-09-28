import axios from 'axios';
import { logger } from './logger';
import { testConfig } from '@config/test.config';

export interface SlackMessage {
  text: string;
  attachments?: SlackAttachment[];
  blocks?: SlackBlock[];
}

export interface SlackAttachment {
  color: string;
  title: string;
  text: string;
  fields: SlackField[];
  footer?: string;
  ts?: number;
}

export interface SlackField {
  title: string;
  value: string;
  short: boolean;
}

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  fields?: SlackField[];
}

export class SlackNotifier {
  private webhookUrl: string;
  private enabled: boolean;

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || testConfig.slackWebhookUrl || '';
    this.enabled = !!this.webhookUrl;
    
    if (!this.enabled) {
      logger.warn('Slack webhook URL not provided. Slack notifications disabled.');
    }
  }

  async sendTestResults(
    totalTests: number,
    passed: number,
    failed: number,
    skipped: number,
    duration: number,
    environment: string = 'test'
  ): Promise<void> {
    if (!this.enabled) {
      logger.debug('Slack notifications disabled. Skipping notification.');
      return;
    }

    const successRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;
    const status = failed === 0 ? 'success' : 'warning';
    const color = failed === 0 ? 'good' : 'warning';

    const message: SlackMessage = {
      text: `Test Results - ${environment.toUpperCase()}`,
      attachments: [
        {
          color,
          title: `Test Execution Summary`,
          text: `Test execution completed in ${environment} environment`,
          fields: [
            {
              title: 'Total Tests',
              value: totalTests.toString(),
              short: true,
            },
            {
              title: 'Passed',
              value: passed.toString(),
              short: true,
            },
            {
              title: 'Failed',
              value: failed.toString(),
              short: true,
            },
            {
              title: 'Skipped',
              value: skipped.toString(),
              short: true,
            },
            {
              title: 'Success Rate',
              value: `${successRate}%`,
              short: true,
            },
            {
              title: 'Duration',
              value: `${Math.round(duration / 1000)}s`,
              short: true,
            },
          ],
          footer: 'Full-Stack Test Automation',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.sendMessage(message);
  }

  async sendPerformanceResults(
    testName: string,
    avgResponseTime: number,
    p95ResponseTime: number,
    errorRate: number,
    totalRequests: number,
    environment: string = 'test'
  ): Promise<void> {
    if (!this.enabled) {
      logger.debug('Slack notifications disabled. Skipping notification.');
      return;
    }

    const status = errorRate < 0.1 && p95ResponseTime < 2000 ? 'success' : 'warning';
    const color = status === 'success' ? 'good' : 'warning';

    const message: SlackMessage = {
      text: `Performance Test Results - ${environment.toUpperCase()}`,
      attachments: [
        {
          color,
          title: `Performance Test: ${testName}`,
          text: `Performance test completed in ${environment} environment`,
          fields: [
            {
              title: 'Average Response Time',
              value: `${Math.round(avgResponseTime)}ms`,
              short: true,
            },
            {
              title: '95th Percentile',
              value: `${Math.round(p95ResponseTime)}ms`,
              short: true,
            },
            {
              title: 'Error Rate',
              value: `${(errorRate * 100).toFixed(2)}%`,
              short: true,
            },
            {
              title: 'Total Requests',
              value: totalRequests.toString(),
              short: true,
            },
            {
              title: 'Status',
              value: status === 'success' ? '✅ Passed' : '⚠️ Warning',
              short: true,
            },
          ],
          footer: 'Full-Stack Test Automation',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.sendMessage(message);
  }

  async sendFailureAlert(
    testName: string,
    errorMessage: string,
    environment: string = 'test'
  ): Promise<void> {
    if (!this.enabled) {
      logger.debug('Slack notifications disabled. Skipping notification.');
      return;
    }

    const message: SlackMessage = {
      text: `🚨 Test Failure Alert - ${environment.toUpperCase()}`,
      attachments: [
        {
          color: 'danger',
          title: `Test Failed: ${testName}`,
          text: `A critical test has failed in ${environment} environment`,
          fields: [
            {
              title: 'Test Name',
              value: testName,
              short: false,
            },
            {
              title: 'Error Message',
              value: errorMessage,
              short: false,
            },
            {
              title: 'Environment',
              value: environment,
              short: true,
            },
            {
              title: 'Timestamp',
              value: new Date().toISOString(),
              short: true,
            },
          ],
          footer: 'Full-Stack Test Automation',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.sendMessage(message);
  }

  async sendPipelineStatus(
    pipelineName: string,
    status: 'success' | 'failed' | 'running',
    environment: string = 'test',
    duration?: number
  ): Promise<void> {
    if (!this.enabled) {
      logger.debug('Slack notifications disabled. Skipping notification.');
      return;
    }

    const statusEmoji = {
      success: '✅',
      failed: '❌',
      running: '🔄',
    };

    const color = {
      success: 'good',
      failed: 'danger',
      running: 'warning',
    };

    const message: SlackMessage = {
      text: `${statusEmoji[status]} Pipeline ${status.toUpperCase()} - ${environment.toUpperCase()}`,
      attachments: [
        {
          color: color[status],
          title: `Pipeline: ${pipelineName}`,
          text: `Pipeline ${status} in ${environment} environment`,
          fields: [
            {
              title: 'Pipeline Name',
              value: pipelineName,
              short: true,
            },
            {
              title: 'Status',
              value: status.toUpperCase(),
              short: true,
            },
            {
              title: 'Environment',
              value: environment,
              short: true,
            },
            ...(duration ? [{
              title: 'Duration',
              value: `${Math.round(duration / 1000)}s`,
              short: true,
            }] : []),
          ],
          footer: 'Full-Stack Test Automation',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await this.sendMessage(message);
  }

  private async sendMessage(message: SlackMessage): Promise<void> {
    try {
      const response = await axios.post(this.webhookUrl, message, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.status === 200) {
        logger.info('Slack notification sent successfully');
      } else {
        logger.warn(`Slack notification sent with status: ${response.status}`);
      }
    } catch (error: any) {
      logger.error('Failed to send Slack notification:', error.message);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.enabled) {
      return false;
    }

    try {
      const testMessage: SlackMessage = {
        text: 'Test notification from Full-Stack Test Automation Framework',
        attachments: [
          {
            color: 'good',
            title: 'Connection Test',
            text: 'This is a test message to verify Slack integration is working correctly.',
            footer: 'Full-Stack Test Automation',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      };

      await this.sendMessage(testMessage);
      return true;
    } catch (error) {
      logger.error('Slack connection test failed:', error);
      return false;
    }
  }
}
