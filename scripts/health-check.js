#!/usr/bin/env node
/**
 * ChatBotDysa Enterprise - Health Check Completo
 * Verifica el estado de todos los servicios críticos
 */

const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class HealthChecker {
  constructor() {
    this.results = {
      services: {},
      overall: 'unknown',
      timestamp: new Date().toISOString()
    };
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  async checkService(name, url, timeout = 5000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const req = http.get(url, { timeout }, (res) => {
        const responseTime = Date.now() - startTime;
        const isHealthy = res.statusCode >= 200 && res.statusCode < 300;
        
        resolve({
          name,
          status: isHealthy ? 'healthy' : 'unhealthy',
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
          url
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          name,
          status: 'timeout',
          error: `Timeout after ${timeout}ms`,
          url
        });
      });

      req.on('error', (err) => {
        resolve({
          name,
          status: 'error',
          error: err.message,
          url
        });
      });
    });
  }

  async checkDatabase() {
    try {
      const result = execSync('docker exec chatbotdysa-postgres-1 pg_isready -U postgres', 
        { encoding: 'utf8', timeout: 5000 });
      return {
        name: 'PostgreSQL',
        status: result.includes('accepting connections') ? 'healthy' : 'unhealthy',
        details: result.trim()
      };
    } catch (error) {
      return {
        name: 'PostgreSQL',
        status: 'error',
        error: error.message
      };
    }
  }

  async checkRedis() {
    try {
      const result = execSync('redis-cli -h localhost -p 16379 ping', 
        { encoding: 'utf8', timeout: 5000 });
      return {
        name: 'Redis',
        status: result.trim() === 'PONG' ? 'healthy' : 'unhealthy',
        details: result.trim()
      };
    } catch (error) {
      return {
        name: 'Redis',
        status: 'error',
        error: error.message
      };
    }
  }

  async checkOllama() {
    try {
      const result = await this.checkService('Ollama AI', 'http://localhost:21434/api/tags', 10000);
      return result;
    } catch (error) {
      return {
        name: 'Ollama AI',
        status: 'error',
        error: error.message
      };
    }
  }

  checkSSLCertificates() {
    try {
      const certExists = fs.existsSync('./certs/server.crt');
      const keyExists = fs.existsSync('./certs/server.key');
      
      return {
        name: 'SSL Certificates',
        status: certExists && keyExists ? 'healthy' : 'missing',
        details: {
          certificate: certExists ? 'found' : 'missing',
          privateKey: keyExists ? 'found' : 'missing'
        }
      };
    } catch (error) {
      return {
        name: 'SSL Certificates',
        status: 'error',
        error: error.message
      };
    }
  }

  async runHealthCheck() {
    this.log(`\n${colors.bold}${colors.blue}🏥 ChatBotDysa Enterprise - Health Check${colors.reset}\n`);
    this.log(`Timestamp: ${this.results.timestamp}\n`);

    // Verificar servicios web
    const webServices = [
      { name: 'Backend API', url: 'http://localhost:8005/api/health' },
      { name: 'Admin Panel', url: 'http://localhost:8001' },
    ];

    this.log(`${colors.bold}🌐 Web Services:${colors.reset}`);
    for (const service of webServices) {
      const result = await this.checkService(service.name, service.url);
      this.results.services[service.name.toLowerCase().replace(/\s+/g, '_')] = result;
      
      const statusColor = result.status === 'healthy' ? colors.green : colors.red;
      const statusIcon = result.status === 'healthy' ? '✅' : '❌';
      
      this.log(`${statusIcon} ${result.name}: ${statusColor}${result.status.toUpperCase()}${colors.reset} ${result.responseTime || ''}`);
    }

    // Verificar bases de datos
    this.log(`\n${colors.bold}🗄️ Databases:${colors.reset}`);
    
    const dbChecks = [
      this.checkDatabase(),
      this.checkRedis()
    ];

    const dbResults = await Promise.all(dbChecks);
    
    for (const result of dbResults) {
      this.results.services[result.name.toLowerCase().replace(/\s+/g, '_')] = result;
      
      const statusColor = result.status === 'healthy' ? colors.green : colors.red;
      const statusIcon = result.status === 'healthy' ? '✅' : '❌';
      
      this.log(`${statusIcon} ${result.name}: ${statusColor}${result.status.toUpperCase()}${colors.reset}`);
    }

    // Verificar IA
    this.log(`\n${colors.bold}🤖 AI Services:${colors.reset}`);
    const aiResult = await this.checkOllama();
    this.results.services.ollama_ai = aiResult;
    
    const aiStatusColor = aiResult.status === 'healthy' ? colors.green : colors.yellow;
    const aiStatusIcon = aiResult.status === 'healthy' ? '✅' : '⚠️';
    
    this.log(`${aiStatusIcon} ${aiResult.name}: ${aiStatusColor}${aiResult.status.toUpperCase()}${colors.reset}`);

    // Verificar SSL
    this.log(`\n${colors.bold}🔒 Security:${colors.reset}`);
    const sslResult = this.checkSSLCertificates();
    this.results.services.ssl_certificates = sslResult;
    
    const sslStatusColor = sslResult.status === 'healthy' ? colors.green : colors.yellow;
    const sslStatusIcon = sslResult.status === 'healthy' ? '✅' : '⚠️';
    
    this.log(`${sslStatusIcon} ${sslResult.name}: ${sslStatusColor}${sslResult.status.toUpperCase()}${colors.reset}`);

    // Calcular estado general
    const healthyCount = Object.values(this.results.services).filter(s => s.status === 'healthy').length;
    const totalCount = Object.keys(this.results.services).length;
    const healthPercentage = Math.round((healthyCount / totalCount) * 100);

    if (healthPercentage >= 90) {
      this.results.overall = 'healthy';
    } else if (healthPercentage >= 70) {
      this.results.overall = 'degraded';
    } else {
      this.results.overall = 'unhealthy';
    }

    // Mostrar resumen
    this.log(`\n${colors.bold}📊 Overall System Health:${colors.reset}`);
    const overallColor = this.results.overall === 'healthy' ? colors.green : 
                        this.results.overall === 'degraded' ? colors.yellow : colors.red;
    const overallIcon = this.results.overall === 'healthy' ? '✅' : 
                       this.results.overall === 'degraded' ? '⚠️' : '❌';
    
    this.log(`${overallIcon} Status: ${overallColor}${colors.bold}${this.results.overall.toUpperCase()}${colors.reset}`);
    this.log(`📈 Health Score: ${healthyCount}/${totalCount} services (${healthPercentage}%)`);

    // Recomendaciones
    if (this.results.overall !== 'healthy') {
      this.log(`\n${colors.bold}💡 Recommendations:${colors.reset}`);
      
      Object.values(this.results.services).forEach(service => {
        if (service.status !== 'healthy') {
          this.log(`${colors.yellow}• Fix ${service.name}: ${service.error || 'Service not responding'}${colors.reset}`);
        }
      });
    }

    // Guardar resultados
    fs.writeFileSync('./health-check-results.json', JSON.stringify(this.results, null, 2));
    this.log(`\n📝 Results saved to: health-check-results.json`);

    return this.results;
  }
}

// Ejecutar health check
async function main() {
  const checker = new HealthChecker();
  const results = await checker.runHealthCheck();
  
  // Exit code basado en el estado general
  const exitCode = results.overall === 'healthy' ? 0 : 1;
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = HealthChecker;