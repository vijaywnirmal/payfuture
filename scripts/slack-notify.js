#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const status = process.argv[2] || 'unknown';
const webhookUrl = process.env.SLACK_WEBHOOK_URL;

if (!webhookUrl) {
  console.log('Slack webhook URL not configured. Skipping notification.');
  process.exit(0);
}

// Read test results if available
function readTestResults() {
  try {
    const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
    if (fs.existsSync(resultsPath)) {
      return JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    }
  } catch (error) {
    console.log('Could not read test results:', error.message);
  }
  return null;
}

// Generate Slack message based on status
function generateMessage(status, testResults) {
  const timestamp = new Date().toISOString();
  const pipelineUrl = process.env.CI_PIPELINE_URL || 'N/A';
  const commitUrl = process.env.CI_COMMIT_URL || 'N/A';
  const branch = process.env.CI_COMMIT_REF_NAME || 'unknown';
  const commit = process.env.CI_COMMIT_SHA?.substring(0, 8) || 'unknown';

  let color, emoji, title;
  
  switch (status) {
    case 'success':
      color = 'good';
      emoji = '✅';
      title = 'Pipeline Success';
      break;
    case 'failure':
      color = 'danger';
      emoji = '❌';
      title = 'Pipeline Failed';
      break;
    default:
      color = 'warning';
      emoji = '⚠️';
      title = 'Pipeline Status Unknown';
  }

  const message = {
    text: `${emoji} ${title} - ${branch.toUpperCase()}`,
    attachments: [
      {
        color,
        title: `Pipeline: ${process.env.CI_PROJECT_NAME || 'Test Automation'}`,
        text: `Pipeline ${status} for branch ${branch}`,
        fields: [
          {
            title: 'Branch',
            value: branch,
            short: true,
          },
          {
            title: 'Commit',
            value: `<${commitUrl}|${commit}>`,
            short: true,
          },
          {
            title: 'Pipeline',
            value: `<${pipelineUrl}|View Pipeline>`,
            short: true,
          },
          {
            title: 'Environment',
            value: process.env.CI_ENVIRONMENT_NAME || 'test',
            short: true,
          },
        ],
        footer: 'Full-Stack Test Automation Framework',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  // Add test results if available
  if (testResults && testResults.stats) {
    const stats = testResults.stats;
    const totalTests = stats.tests || 0;
    const passed = stats.passed || 0;
    const failed = stats.failed || 0;
    const skipped = stats.skipped || 0;
    const duration = stats.duration || 0;
    const successRate = totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0;

    message.attachments.push({
      color: failed === 0 ? 'good' : 'warning',
      title: 'Test Results',
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
    });
  }

  return message;
}

// Send Slack notification
async function sendNotification() {
  try {
    const testResults = readTestResults();
    const message = generateMessage(status, testResults);
    
    console.log('Sending Slack notification...');
    console.log('Status:', status);
    console.log('Webhook URL:', webhookUrl ? 'configured' : 'not configured');
    
    const response = await axios.post(webhookUrl, message, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    if (response.status === 200) {
      console.log('✅ Slack notification sent successfully');
    } else {
      console.log(`⚠️ Slack notification sent with status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Failed to send Slack notification:', error.message);
    process.exit(1);
  }
}

// Run the notification
sendNotification();
