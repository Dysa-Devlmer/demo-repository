import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';

class EnterpriseReporter implements Reporter {
  private startTime: number = 0;
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private testResults: Array<{
    name: string;
    status: string;
    duration: number;
    error?: string;
  }> = [];

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('  🧪 ChatBotDysa Enterprise E2E Test Suite');
    console.log('═'.repeat(60));
    console.log(`  📁 Test Directory: ${config.testDir}`);
    console.log(`  🌐 Projects: ${config.projects.map(p => p.name).join(', ')}`);
    console.log(`  ⏱️  Started at: ${new Date().toISOString()}`);
    console.log('─'.repeat(60));
    console.log('');
  }

  onTestBegin(test: TestCase) {
    process.stdout.write(`  ⏳ ${test.title}...`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const duration = result.duration;
    const status = result.status;

    // Clear the line
    process.stdout.write('\r');

    if (status === 'passed') {
      this.passed++;
      console.log(`  ✅ ${test.title} (${this.formatDuration(duration)})`);
    } else if (status === 'failed') {
      this.failed++;
      console.log(`  ❌ ${test.title} (${this.formatDuration(duration)})`);
      if (result.error?.message) {
        console.log(`     └─ Error: ${result.error.message.split('\n')[0]}`);
      }
    } else if (status === 'skipped') {
      this.skipped++;
      console.log(`  ⏭️  ${test.title} (skipped)`);
    }

    this.testResults.push({
      name: test.title,
      status,
      duration,
      error: result.error?.message,
    });
  }

  onEnd(result: FullResult) {
    const totalDuration = Date.now() - this.startTime;
    const total = this.passed + this.failed + this.skipped;

    console.log('');
    console.log('─'.repeat(60));
    console.log('  📊 Test Results Summary');
    console.log('─'.repeat(60));
    console.log(`  ✅ Passed:  ${this.passed}`);
    console.log(`  ❌ Failed:  ${this.failed}`);
    console.log(`  ⏭️  Skipped: ${this.skipped}`);
    console.log(`  📝 Total:   ${total}`);
    console.log(`  ⏱️  Duration: ${this.formatDuration(totalDuration)}`);
    console.log('');

    if (this.failed > 0) {
      console.log('─'.repeat(60));
      console.log('  ❌ Failed Tests:');
      console.log('─'.repeat(60));
      this.testResults
        .filter((t) => t.status === 'failed')
        .forEach((t) => {
          console.log(`  • ${t.name}`);
          if (t.error) {
            console.log(`    └─ ${t.error.split('\n')[0]}`);
          }
        });
      console.log('');
    }

    const passRate = total > 0 ? ((this.passed / total) * 100).toFixed(1) : 0;
    const statusIcon = this.failed === 0 ? '✅' : '❌';
    const statusText = this.failed === 0 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED';

    console.log('═'.repeat(60));
    console.log(`  ${statusIcon} ${statusText} (${passRate}% pass rate)`);
    console.log('═'.repeat(60));
    console.log('');
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(0);
      return `${minutes}m ${seconds}s`;
    }
  }
}

export default EnterpriseReporter;
