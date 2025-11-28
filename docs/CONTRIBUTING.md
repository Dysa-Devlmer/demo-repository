# 🤝 Guía de Contribución - ChatBotDysa Enterprise

¡Gracias por tu interés en contribuir a ChatBotDysa! Esta guía te ayudará a entender nuestros procesos, estándares y mejores prácticas para contribuir de manera efectiva.

## 🎯 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Estándares de Desarrollo](#estándares-de-desarrollo)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Configuración del Entorno](#configuración-del-entorno)
- [Testing](#testing)
- [Documentación](#documentación)
- [Seguridad](#seguridad)

## 📋 Código de Conducta

Nos comprometemos a mantener un ambiente inclusivo y respetuoso. Todos los contribuyentes deben seguir nuestro [Código de Conducta](CODE_OF_CONDUCT.md).

## 🚀 Cómo Contribuir

### Tipos de Contribuciones

1. **🐛 Reportes de Bugs**
2. **✨ Nuevas Funcionalidades**
3. **📖 Mejoras de Documentación**
4. **🔧 Refactoring de Código**
5. **🛡️ Mejoras de Seguridad**
6. **🌐 Traducciones (i18n)**

### Antes de Comenzar

1. **Revisa Issues Existentes**: Verifica que tu contribución no esté ya siendo trabajada
2. **Discute Grandes Cambios**: Para cambios mayores, abre un issue para discusión
3. **Familiarízate con el Código**: Lee la documentación técnica y arquitectura

## 🛠️ Estándares de Desarrollo

### Tecnologías Principales

```
Backend: NestJS 11+ + TypeScript 5+
Frontend: Next.js 15+ + React 19+
Database: PostgreSQL 15+ + TypeORM
Cache: Redis 7+
AI: Ollama + Local LLMs
Containerization: Docker + Docker Compose
```

### Estructura del Proyecto

```
ChatBotDysa/
├── apps/
│   ├── backend/          # API NestJS
│   ├── admin-panel/      # Dashboard Next.js
│   └── web-widget/       # Widget React
├── docs/                 # Documentación
├── infra/               # Infraestructura
└── scripts/             # Scripts de utilidad
```

### Convenciones de Código

#### TypeScript/JavaScript

```typescript
// ✅ Correcto - Naming
class UserService {
  private readonly logger = new Logger(UserService.name);

  async findUserById(id: string): Promise<User | null> {
    // implementación
  }
}

// ✅ Correcto - Interfaces
interface CreateUserRequest {
  name: string;
  email: string;
  role: UserRole;
}

// ✅ Correcto - Enums
enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}
```

#### Naming Conventions

- **Variables/Funciones**: camelCase
- **Clases**: PascalCase
- **Interfaces**: PascalCase (sin prefijo I)
- **Enums**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE
- **Archivos**: kebab-case
- **Carpetas**: kebab-case

#### Comentarios y Documentación

```typescript
/**
 * Servicio para gestión de usuarios del restaurante
 *
 * @description Maneja CRUD de usuarios, autenticación y autorización
 * @version 1.0.0
 * @author DysaDev Team
 */
@Injectable()
export class UserService {
  /**
   * Busca un usuario por su ID
   *
   * @param id - ID único del usuario
   * @returns Promise<User | null> - Usuario encontrado o null
   * @throws {NotFoundException} - Si el usuario no existe
   */
  async findUserById(id: string): Promise<User | null> {
    // implementación
  }
}
```

### Estándares de Calidad

#### Linting y Formatting

```bash
# ESLint para análisis estático
npm run lint
npm run lint:fix

# Prettier para formateo
npm run format

# TypeScript para verificación de tipos
npm run type-check
```

#### Configuración ESLint

```json
{
  "extends": [
    "@nestjs/eslint-config",
    "plugin:@typescript-eslint/recommended",
    "plugin:security/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "security/detect-object-injection": "error"
  }
}
```

## 🔄 Proceso de Pull Request

### 1. Preparación

```bash
# Fork del repositorio
git clone https://github.com/tu-usuario/ChatBotDysa.git
cd ChatBotDysa

# Crear branch para tu feature
git checkout -b feature/nombre-descriptivo
```

### 2. Desarrollo

```bash
# Instalar dependencias
yarn install

# Ejecutar tests antes de comenzar
yarn test

# Desarrollar tu funcionalidad
# ...

# Ejecutar tests durante desarrollo
yarn test:watch
```

### 3. Antes del Commit

```bash
# Verificar linting
yarn lint

# Verificar tipos
yarn type-check

# Ejecutar tests completos
yarn test:coverage

# Verificar build
yarn build
```

### 4. Commit Guidelines

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Tipos de commit
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Cambios en documentación
style:    Cambios que no afectan el código (espacios, formato)
refactor: Refactoring de código
test:     Agregar o corregir tests
chore:    Cambios en build, herramientas, etc.

# Ejemplos
git commit -m "feat(auth): add JWT refresh token functionality"
git commit -m "fix(api): resolve CORS issue in production"
git commit -m "docs(readme): update installation instructions"
```

### 5. Pull Request Template

Al crear un PR, incluye:

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (fix o feature que causa que funcionalidad existente no funcione)
- [ ] Cambio de documentación

## Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He realizado self-review de mi código
- [ ] He comentado mi código, especialmente en áreas complejas
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Los tests nuevos y existentes pasan localmente
- [ ] He actualizado la documentación correspondiente

## Testing
Describe los tests realizados para verificar los cambios.

## Screenshots (si aplica)
Agrega capturas de pantalla para cambios en UI.
```

## 🧪 Testing

### Estructura de Tests

```
apps/backend/src/
├── users/
│   ├── users.service.ts
│   ├── users.service.spec.ts    # Unit tests
│   ├── users.controller.ts
│   └── users.controller.spec.ts
└── test/
    ├── integration/             # Integration tests
    └── e2e/                    # End-to-end tests
```

### Tipos de Tests

#### Unit Tests
```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(getRepositoryToken(User));
  });

  it('should find user by id', async () => {
    // Arrange
    const userId = 'test-id';
    const expectedUser = { id: userId, name: 'Test User' };
    jest.spyOn(repository, 'findOne').mockResolvedValue(expectedUser);

    // Act
    const result = await service.findById(userId);

    // Assert
    expect(result).toEqual(expectedUser);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
  });
});
```

#### Integration Tests
```typescript
describe('UserController (Integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
      });
  });
});
```

### Coverage Requirements

- **Unit Tests**: Mínimo 80% coverage
- **Integration Tests**: Endpoints críticos cubiertos
- **E2E Tests**: Flujos principales de usuario

```bash
# Ejecutar tests con coverage
yarn test:coverage

# Ver reporte HTML
open coverage/lcov-report/index.html
```

## 📚 Documentación

### API Documentation

Usamos Swagger/OpenAPI para documentar APIs:

```typescript
@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Obtener lista de usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios', type: [User] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async findAll(@Query() query: FindUsersDto): Promise<User[]> {
    return this.usersService.findAll(query);
  }
}
```

### Comentarios de Código

- **Clases**: Describir propósito y responsabilidades
- **Métodos Públicos**: Documentar parámetros y valores de retorno
- **Algoritmos Complejos**: Explicar la lógica
- **TODO/FIXME**: Incluir contexto y fecha

### README Updates

Actualiza README.md para:
- Nuevas funcionalidades
- Cambios en instalación
- Nuevas variables de entorno
- Cambios en la arquitectura

## 🛡️ Seguridad

### Análisis de Seguridad

```bash
# Audit de dependencias
yarn audit

# Scan de vulnerabilidades
yarn security:scan

# Análisis estático de seguridad
yarn lint:security
```

### Prácticas Seguras

1. **Input Validation**: Siempre validar y sanitizar inputs
2. **Output Encoding**: Escapar datos antes de mostrar
3. **Authentication**: Verificar autenticación en endpoints protegidos
4. **Authorization**: Verificar permisos granulares
5. **Secrets**: No commitear secretos en el código

```typescript
// ✅ Correcto - Validación de entrada
@Post()
async createUser(@Body() dto: CreateUserDto) {
  // dto es automáticamente validado por class-validator
  return this.userService.create(dto);
}

// ❌ Incorrecto - SQL directo sin sanitización
const users = await query(`SELECT * FROM users WHERE name = '${name}'`);

// ✅ Correcto - Query parametrizada
const users = await repository.find({ where: { name } });
```

## 🌐 Internacionalización (i18n)

### Agregando Traducciones

```typescript
// Archivo de traducción: src/i18n/es.json
{
  "user": {
    "created": "Usuario creado exitosamente",
    "notFound": "Usuario no encontrado",
    "invalidCredentials": "Credenciales inválidas"
  }
}

// Uso en código
@Injectable()
export class UserService {
  constructor(private i18n: I18nService) {}

  async createUser(dto: CreateUserDto) {
    // lógica de creación
    const message = this.i18n.translate('user.created');
    return { message, user };
  }
}
```

### Idiomas Soportados

- **Español (es)**: Idioma principal
- **Inglés (en)**: Idioma secundario
- **Francés (fr)**: En desarrollo

## 📞 Soporte y Contacto

### Canales de Comunicación

- **Issues**: Para bugs y feature requests
- **Discussions**: Para preguntas generales
- **Email**: dev@zgamersa.com
- **Discord**: [Servidor de desarrollo](https://discord.gg/chatbotdysa)

### Revisores de Código

- **@devlmer**: Lead Developer & Architecture
- **@security-team**: Security Reviews
- **@qa-team**: Quality Assurance

## 📈 Proceso de Release

### Semantic Versioning

Seguimos [SemVer](https://semver.org/):

- **MAJOR**: Cambios incompatibles en API (breaking changes)
- **MINOR**: Nuevas funcionalidades compatibles
- **PATCH**: Bug fixes compatibles

### Release Checklist

- [ ] Tests pasan en CI/CD
- [ ] Documentación actualizada
- [ ] CHANGELOG.md actualizado
- [ ] Version bump en package.json
- [ ] Security scan completado
- [ ] Performance benchmarks verificados

---

## 🙏 Reconocimientos

Agradecemos a todos los contribuyentes que hacen posible ChatBotDysa. Tu contribución, sin importar su tamaño, es valiosa para la comunidad.

### Hall of Fame

- **@devlmer** - Creator & Lead Developer
- **@community-contributors** - Amazing community support

---

**¿Preguntas?** No dudes en contactarnos. ¡Estamos aquí para ayudarte a contribuir exitosamente!

*Última actualización: Enero 2025*