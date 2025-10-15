# Data School - Frontend

Sistema de gestión académica para colegios - Interfaz de usuario con funcionalidades de autenticación y gestión de usuarios.

## 🚀 Stack Tecnológico

- **Vue 3** (Composition API con `<script setup>`)
- **TypeScript** (tipado estricto)
- **Tailwind CSS** (estilos utility-first)
- **Pinia** (gestión de estado)
- **Vue Router** (navegación y guards)
- **Axios** (cliente HTTP)
- **Vite** (build tool)

## 📋 Requisitos Previos

- **Node.js**: v20.19.0 o superior (recomendado v22.12.0+)
- **npm** o **pnpm**
- **Backend**: El servidor backend debe estar corriendo en `http://localhost:3000`

## 🛠️ Instalación

### 1. Clonar el repositorio (si aún no lo has hecho)

```bash
git clone <url-del-repositorio>
cd Data-School/client
```

### 2. Instalar dependencias

```bash
npm install
```

O si usas pnpm:

```bash
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto `client/` basándote en `.env.example`:

```bash
cp .env.example .env
```

Contenido de `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

> **Nota**: Si tu backend está en otra URL, ajusta `VITE_API_URL` según corresponda.

## 🎯 Scripts Disponibles

### Modo desarrollo

Inicia el servidor de desarrollo con hot-reload en `http://localhost:5173`:

```bash
npm run dev
```

### Build para producción

Compila y minifica para producción:

```bash
npm run build
```

Los archivos compilados se generan en la carpeta `dist/`.

### Preview de producción

Previsualiza el build de producción localmente:

```bash
npm run preview
```

### Verificación de tipos

Verifica errores de TypeScript sin compilar:

```bash
npm run type-check
```

## 📁 Estructura del Proyecto

```
client/
├── src/
│   ├── assets/              # Recursos estáticos (imágenes, estilos)
│   │   └── styles/
│   │       └── main.css     # Tailwind CSS + estilos globales
│   ├── components/          # Componentes reutilizables
│   │   └── auth/
│   │       ├── LoginForm.vue
│   │       ├── RegisterForm.vue
│   │       ├── ForgotPasswordForm.vue
│   │       └── ResetPasswordForm.vue
│   ├── layouts/             # Layouts de la aplicación
│   │   ├── AuthLayout.vue
│   │   └── DashboardLayout.vue
│   ├── pages/               # Vistas/Páginas principales
│   │   ├── Login.vue
│   │   ├── Dashboard.vue
│   │   ├── Register.vue
│   │   ├── ForgotPassword.vue
│   │   └── ResetPassword.vue
│   ├── router/              # Configuración de Vue Router
│   │   └── index.ts
│   ├── services/            # Servicios API
│   │   ├── api.config.ts    # Configuración de Axios
│   │   └── auth.service.ts  # Servicio de autenticación
│   ├── store/               # Pinia stores
│   │   └── auth.store.ts    # Store de autenticación
│   ├── types/               # Tipos TypeScript
│   │   └── auth.types.ts
│   ├── utils/               # Utilidades y helpers
│   │   └── validators.ts
│   ├── App.vue              # Componente raíz
│   └── main.ts              # Punto de entrada
├── .env.example             # Ejemplo de variables de entorno
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js        # Configuración de PostCSS
├── tailwind.config.js       # Configuración de Tailwind CSS
├── tsconfig.json            # Configuración de TypeScript
├── tsconfig.node.json
└── vite.config.ts           # Configuración de Vite
```

## 🔐 Funcionalidad de Login

### Flujo de autenticación

1. Usuario accede a `/login`
2. Completa formulario con **email** y **password**
3. Validación en tiempo real (frontend)
4. Submit envía petición `POST /api/auth/login` al backend
5. Si exitoso:
   - Guarda token JWT en `localStorage`
   - Guarda datos del usuario en Pinia store
   - Redirige a `/dashboard` según rol
6. Si error:
   - Muestra mensaje de error
   - Limpia campo de password
   - Permite reintentar

### Validaciones implementadas

- **Email**: Formato válido (regex)
- **Password**: Mínimo 8 caracteres
- **Campos requeridos**: No pueden estar vacíos
- **Submit deshabilitado**: Mientras hay errores o está cargando

### Roles de usuario

El sistema soporta los siguientes roles:

- `ADMINISTRADOR`: Acceso completo al sistema
- `DIRECTOR`: Gestión del colegio
- `UTP`: Unidad Técnico Pedagógica
- `PROFESOR`: Gestión de cursos y estudiantes
- `ESTUDIANTE_APODERADO`: Vista de estudiante/apoderado

## 🔑 Funcionalidad de Recuperación de Contraseña

### Descripción

El sistema permite a los usuarios recuperar su contraseña en caso de olvido mediante un proceso de dos pasos: solicitud de recuperación y restablecimiento de contraseña.

### Flujo de recuperación

#### 1. Solicitar recuperación de contraseña

1. En la página de login, hacer clic en **"¿Olvidaste tu contraseña?"**
2. Ingresar el correo electrónico registrado
3. Hacer clic en **"Enviar Enlace de Recuperación"**
4. Si el correo existe en el sistema, se enviará un email con un enlace de recuperación
5. **Cooldown de 60 segundos**: Después de enviar, debes esperar 60 segundos antes de poder solicitar otro enlace

#### 2. Restablecer contraseña

1. Abrir el enlace recibido por correo electrónico (válido por tiempo limitado)
2. El sistema validará automáticamente el token del enlace
3. Si el token es válido, se mostrará el formulario de restablecimiento
4. Ingresar y confirmar la nueva contraseña
5. La contraseña debe cumplir los mismos requisitos de seguridad que el registro
6. Después de restablecer exitosamente, redirige automáticamente al login en 3 segundos

### Campos del formulario de restablecimiento

- **Nueva Contraseña**: Debe cumplir los requisitos:
  - Mínimo 8 caracteres
  - Al menos 1 letra mayúscula
  - Al menos 1 letra minúscula
  - Al menos 1 número
  - Al menos 1 símbolo (@$!%*?&)
- **Confirmar Contraseña**: Debe coincidir exactamente con la nueva contraseña

### Características especiales

#### Indicador de fortaleza de contraseña
- Barra visual con 4 niveles
- Colores: rojo (débil), amarillo (media), verde (fuerte)
- Muestra requisitos faltantes en tiempo real

#### Protección contra spam
- Cooldown de 60 segundos entre solicitudes
- Contador visible para reenvío
- Botón deshabilitado durante el cooldown

#### Validación de token
- Validación automática al cargar la página de restablecimiento
- Muestra estado de validación (validando, inválido, válido)
- Enlace para solicitar nuevo token si el actual expiró

#### Seguridad
- Los tokens tienen tiempo de expiración configurado en el backend
- No se revela si un email existe o no en el sistema (protección contra enumeración)
- Rate limiting para prevenir ataques de fuerza bruta
- Muestra solo mensajes genéricos para proteger la privacidad

### Manejo de errores

- **Email no encontrado**: Mensaje genérico por seguridad
- **Token inválido/expirado**: Opción para solicitar nuevo enlace
- **Demasiados intentos**: Mensaje de rate limiting
- **Error de validación**: Mensajes específicos por campo

### Rutas

- `/forgot-password`: Solicitar recuperación de contraseña
- `/reset-password?token=xxx`: Restablecer contraseña con token

## 👥 Funcionalidad de Registro de Usuarios

### Descripción

El sistema permite a los **administradores** registrar nuevos usuarios con diferentes roles. Esta funcionalidad está protegida y solo es accesible para usuarios con rol `ADMINISTRADOR`.

### Acceso

1. Iniciar sesión con credenciales de administrador
2. En el dashboard, hacer clic en el botón **"Registrar Usuario"** en la barra superior
3. Completar el formulario de registro

### Campos del formulario de registro

#### Campos obligatorios (*)

- **Email**: Dirección de correo electrónico única en el sistema
- **Nombre Completo**: Nombre completo del usuario (mínimo 3 caracteres, solo letras y espacios)
- **RUT**: RUT chileno con validación de dígito verificador (formato: XX.XXX.XXX-X)
- **Contraseña**: Debe cumplir los siguientes requisitos:
  - Mínimo 8 caracteres
  - Al menos 1 letra mayúscula
  - Al menos 1 letra minúscula
  - Al menos 1 número
  - Al menos 1 símbolo (@$!%*?&)
- **Confirmar Contraseña**: Debe coincidir con la contraseña
- **Rol**: Seleccionar uno de los roles disponibles
- **ID del Colegio**: UUID del colegio al que pertenecerá el usuario

#### Campos opcionales

- **Teléfono**: Teléfono en formato chileno (+56XXXXXXXXX)

### Características especiales

#### Validación de RUT chileno
- Formateo automático mientras se escribe (XX.XXX.XXX-X)
- Validación del dígito verificador usando algoritmo módulo 11
- Mensaje de error específico si el RUT es inválido

#### Indicador de fortaleza de contraseña
- Barra visual con 4 niveles
- Colores: rojo (débil), amarillo (media), verde (fuerte)
- Muestra requisitos faltantes en tiempo real

#### Manejo de errores
- Validación en tiempo real por campo
- Mensajes de error específicos del backend
- Opción de limpiar formulario después del registro exitoso

### Flujo de registro

1. **Completar formulario**: Llenar todos los campos obligatorios
2. **Validación**: El formulario valida cada campo en tiempo real
3. **Envío**: Al hacer submit, se envía petición POST al backend con token de administrador
4. **Respuesta exitosa**:
   - Mensaje de confirmación con email del usuario creado
   - Opción "Registrar Otro" para crear más usuarios
   - Botón para volver al dashboard
5. **Respuesta con error**:
   - Mensaje de error claro (email duplicado, RUT inválido, etc.)
   - El formulario mantiene los datos para corrección
   - Se limpia solo la contraseña por seguridad

### Permisos y seguridad

- ✅ Solo usuarios con rol `ADMINISTRADOR` pueden acceder a `/register`
- ✅ Si un usuario no-admin intenta acceder, es redirigido al dashboard
- ✅ El token JWT del administrador se envía automáticamente en las peticiones
- ✅ Validación exhaustiva en frontend y backend
- ✅ RUT y email deben ser únicos en el sistema

## 🔒 Seguridad

- ✅ Validación de inputs antes de enviar
- ✅ Sanitización de datos (trim, normalize)
- ✅ Tokens JWT almacenados en `localStorage` (con precaución)
- ✅ Interceptores Axios para manejar 401 Unauthorized
- ✅ Timeout de 10 segundos en peticiones HTTP
- ✅ Redirección automática a `/login` si token expira
- ✅ Guards en rutas protegidas

## 🎨 Diseño UI/UX

### Características

- **Responsive**: Mobile-first, funciona en todos los dispositivos
- **Paleta de colores**: Tonos azules (`primary`) configurados en Tailwind
- **Feedback visual**:
  - Loading spinner durante peticiones
  - Errores en rojo con iconos
  - Estados hover/focus/active
- **Accesibilidad**:
  - Labels asociados a inputs
  - Contraste WCAG AA
  - Navegación por teclado

### Estados del formulario

1. **Vacío**: Inputs limpios, submit deshabilitado
2. **Con errores**: Bordes rojos, mensajes de error
3. **Válido**: Submit habilitado
4. **Cargando**: Submit deshabilitado, spinner visible
5. **Error de login**: Alert rojo con mensaje del servidor

## 🧪 Testing

### Probar Login

1. Asegúrate de que el backend esté corriendo en `http://localhost:3000`
2. Inicia el frontend con `npm run dev`
3. Navega a `http://localhost:5173/login`
4. Usa credenciales válidas de tu base de datos

### Probar Registro de Usuarios

1. Inicia sesión con credenciales de **administrador**
2. En el dashboard, haz clic en **"Registrar Usuario"**
3. Completa el formulario con datos de prueba:
   - Email: nuevo@ejemplo.com
   - Nombre: Juan Pérez González
   - RUT: 12345678-5 (el sistema formateará automáticamente)
   - Contraseña: TestPass123!
   - Confirmar contraseña: TestPass123!
   - Rol: Selecciona cualquier rol
   - Colegio ID: UUID válido de tu base de datos
4. Haz clic en **"Registrar Usuario"**
5. Verifica el mensaje de éxito

### Probar Recuperación de Contraseña

#### Solicitar recuperación

1. En la página de login (`http://localhost:5173/login`), haz clic en **"¿Olvidaste tu contraseña?"**
2. Ingresa un email registrado en el sistema
3. Haz clic en **"Enviar Enlace de Recuperación"**
4. Verifica el mensaje de éxito
5. Observa el cooldown de 60 segundos (el botón se deshabilitará con un contador)
6. Revisa tu email para obtener el enlace de recuperación (o consulta los logs del backend)

#### Restablecer contraseña

1. Abre el enlace de recuperación recibido por email (formato: `http://localhost:5173/reset-password?token=xxx`)
2. Espera a que el sistema valide el token automáticamente
3. Si el token es válido, completa el formulario:
   - Nueva contraseña: NuevaPass123!
   - Confirmar contraseña: NuevaPass123!
4. Observa el indicador de fortaleza de contraseña
5. Haz clic en **"Restablecer Contraseña"**
6. Verifica el mensaje de éxito
7. Observa el countdown de 3 segundos antes del redirect
8. Serás redirigido automáticamente a `/login`
9. Inicia sesión con tu nueva contraseña

#### Casos de prueba adicionales

- **Token expirado**: Intenta usar un enlace antiguo y verifica que muestre el mensaje de error
- **Token inválido**: Modifica el parámetro `token` en la URL y verifica el mensaje de error
- **Cooldown**: Intenta solicitar múltiples recuperaciones rápidamente y verifica el cooldown
- **Contraseña débil**: Intenta usar contraseñas que no cumplan los requisitos

### Credenciales de prueba

Solicita credenciales de administrador al equipo de backend o crea un usuario con rol `ADMINISTRADOR` en la base de datos.

## 🐛 Troubleshooting

### Error: "Cannot connect to backend"

- Verifica que el backend esté corriendo en `http://localhost:3000`
- Revisa la consola del navegador para más detalles
- Comprueba la variable `VITE_API_URL` en `.env`

### Error: "Invalid token" o redirección constante a /login

- El token JWT puede haber expirado
- Limpia `localStorage` del navegador (DevTools > Application > Local Storage)
- Vuelve a iniciar sesión

### Errores de compilación TypeScript

- Ejecuta `npm run type-check` para ver todos los errores
- Asegúrate de que las importaciones usen el alias `@/` correctamente
- Verifica que `tsconfig.json` esté configurado correctamente

### Estilos de Tailwind no se aplican

- Verifica que `main.css` esté importado en `main.ts`
- Asegúrate de que `tailwind.config.js` incluya las rutas correctas
- Reinicia el servidor de Vite (`npm run dev`)

## 📚 Recursos

- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Axios Documentation](https://axios-http.com/)
- [Vite Documentation](https://vitejs.dev/)

## 👥 Equipo

Desarrollado por el equipo de Data School - Capstone 03 Equipo 1

## 📄 Licencia

Este proyecto es privado y está destinado únicamente para uso académico.

---

**Última actualización**: Enero 2025
