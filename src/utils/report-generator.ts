import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  timestamp: string;
  category: 'web' | 'api' | 'performance';
}

export interface TestSuite {
  name: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: TestResult[];
}

export interface TestReport {
  summary: {
    totalSuites: number;
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    totalSkipped: number;
    totalDuration: number;
    successRate: number;
  };
  suites: TestSuite[];
  timestamp: string;
  environment: string;
}

export class ReportGenerator {
  private outputDir: string;
  private reportDir: string;

  constructor(outputDir: string = 'test-reports') {
    this.outputDir = outputDir;
    this.reportDir = path.join(outputDir, 'reports');
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  generateTestReport(suites: TestSuite[]): TestReport {
    const totalTests = suites.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = suites.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = suites.reduce((sum, suite) => sum + suite.failed, 0);
    const totalSkipped = suites.reduce((sum, suite) => sum + suite.skipped, 0);
    const totalDuration = suites.reduce((sum, suite) => sum + suite.duration, 0);
    const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

    const report: TestReport = {
      summary: {
        totalSuites: suites.length,
        totalTests,
        totalPassed,
        totalFailed,
        totalSkipped,
        totalDuration,
        successRate: Math.round(successRate * 100) / 100,
      },
      suites,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
    };

    return report;
  }

  saveJsonReport(report: TestReport, filename?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFilename = filename || `test-report-${timestamp}.json`;
    const reportPath = path.join(this.reportDir, reportFilename);

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logger.info(`JSON report saved: ${reportPath}`);
    return reportPath;
  }

  generateHtmlReport(report: TestReport, filename?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFilename = filename || `test-report-${timestamp}.html`;
    const reportPath = path.join(this.reportDir, reportFilename);

    const html = this.generateHtmlContent(report);
    fs.writeFileSync(reportPath, html);
    logger.info(`HTML report saved: ${reportPath}`);
    return reportPath;
  }

  private generateHtmlContent(report: TestReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - ${new Date().toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header .subtitle {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .summary {
            padding: 30px;
            border-bottom: 1px solid #eee;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #007bff;
        }
        .summary-card.success {
            border-left-color: #28a745;
        }
        .summary-card.danger {
            border-left-color: #dc3545;
        }
        .summary-card.warning {
            border-left-color: #ffc107;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            font-size: 2em;
            font-weight: 600;
        }
        .summary-card p {
            margin: 0;
            color: #666;
            font-size: 0.9em;
        }
        .suites {
            padding: 30px;
        }
        .suite {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        .suite-header {
            background: #f8f9fa;
            padding: 15px 20px;
            border-bottom: 1px solid #ddd;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .suite-title {
            font-size: 1.2em;
            font-weight: 600;
            margin: 0;
        }
        .suite-stats {
            display: flex;
            gap: 20px;
            font-size: 0.9em;
            color: #666;
        }
        .test-results {
            padding: 0;
        }
        .test-result {
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-result:last-child {
            border-bottom: none;
        }
        .test-result.passed {
            background-color: #d4edda;
        }
        .test-result.failed {
            background-color: #f8d7da;
        }
        .test-result.skipped {
            background-color: #fff3cd;
        }
        .test-name {
            font-weight: 500;
        }
        .test-status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .test-status.passed {
            background-color: #28a745;
            color: white;
        }
        .test-status.failed {
            background-color: #dc3545;
            color: white;
        }
        .test-status.skipped {
            background-color: #ffc107;
            color: #212529;
        }
        .test-duration {
            color: #666;
            font-size: 0.9em;
        }
        .error-message {
            margin-top: 10px;
            padding: 10px;
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 4px;
            color: #721c24;
            font-family: monospace;
            font-size: 0.8em;
        }
        .footer {
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #eee;
        }
        .category-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7em;
            font-weight: 600;
            text-transform: uppercase;
            margin-left: 10px;
        }
        .category-web {
            background-color: #e3f2fd;
            color: #1976d2;
        }
        .category-api {
            background-color: #f3e5f5;
            color: #7b1fa2;
        }
        .category-performance {
            background-color: #e8f5e8;
            color: #388e3c;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test Report</h1>
            <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
        </div>
        
        <div class="summary">
            <h2>Summary</h2>
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>${report.summary.totalSuites}</h3>
                    <p>Test Suites</p>
                </div>
                <div class="summary-card">
                    <h3>${report.summary.totalTests}</h3>
                    <p>Total Tests</p>
                </div>
                <div class="summary-card success">
                    <h3>${report.summary.totalPassed}</h3>
                    <p>Passed</p>
                </div>
                <div class="summary-card danger">
                    <h3>${report.summary.totalFailed}</h3>
                    <p>Failed</p>
                </div>
                <div class="summary-card warning">
                    <h3>${report.summary.totalSkipped}</h3>
                    <p>Skipped</p>
                </div>
                <div class="summary-card">
                    <h3>${report.summary.successRate}%</h3>
                    <p>Success Rate</p>
                </div>
            </div>
        </div>
        
        <div class="suites">
            <h2>Test Suites</h2>
            ${report.suites.map(suite => this.generateSuiteHtml(suite)).join('')}
        </div>
        
        <div class="footer">
            <p>Report generated by Full-Stack Test Automation Framework</p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateSuiteHtml(suite: TestSuite): string {
    return `
    <div class="suite">
        <div class="suite-header">
            <h3 class="suite-title">${suite.name}</h3>
            <div class="suite-stats">
                <span>Total: ${suite.totalTests}</span>
                <span>Passed: ${suite.passed}</span>
                <span>Failed: ${suite.failed}</span>
                <span>Skipped: ${suite.skipped}</span>
                <span>Duration: ${suite.duration}ms</span>
            </div>
        </div>
        <div class="test-results">
            ${suite.results.map(result => this.generateTestResultHtml(result)).join('')}
        </div>
    </div>`;
  }

  private generateTestResultHtml(result: TestResult): string {
    const categoryClass = `category-${result.category}`;
    return `
    <div class="test-result ${result.status}">
        <div>
            <div class="test-name">
                ${result.testName}
                <span class="category-badge ${categoryClass}">${result.category}</span>
            </div>
            ${result.error ? `<div class="error-message">${result.error}</div>` : ''}
        </div>
        <div>
            <span class="test-status ${result.status}">${result.status}</span>
            <span class="test-duration">${result.duration}ms</span>
        </div>
    </div>`;
  }

  generatePerformanceReport(k6Results: any, filename?: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFilename = filename || `performance-report-${timestamp}.html`;
    const reportPath = path.join(this.reportDir, reportFilename);

    const html = this.generatePerformanceHtmlContent(k6Results);
    fs.writeFileSync(reportPath, html);
    logger.info(`Performance report saved: ${reportPath}`);
    return reportPath;
  }

  private generatePerformanceHtmlContent(results: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report - ${new Date().toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .metrics {
            padding: 30px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .metric-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #007bff;
        }
        .metric-value {
            font-size: 2em;
            font-weight: 600;
            margin: 0 0 10px 0;
        }
        .metric-label {
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Performance Test Report</h1>
            <div class="subtitle">Generated on ${new Date().toLocaleString()}</div>
        </div>
        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value">${results.metrics?.http_req_duration?.avg || 'N/A'}</div>
                <div class="metric-label">Average Response Time (ms)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${results.metrics?.http_req_duration?.p95 || 'N/A'}</div>
                <div class="metric-label">95th Percentile (ms)</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${results.metrics?.http_req_failed?.rate || 'N/A'}</div>
                <div class="metric-label">Error Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${results.metrics?.http_reqs?.count || 'N/A'}</div>
                <div class="metric-label">Total Requests</div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }
}
