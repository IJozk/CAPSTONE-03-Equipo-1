# Data School - Frontend

Sistema de gestión académica para colegios - Interfaz de usuario con funcionalidad de login.

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
│   │       └── LoginForm.vue
│   ├── layouts/             # Layouts de la aplicación
│   │   └── AuthLayout.vue
│   ├── pages/               # Vistas/Páginas principales
│   │   ├── Login.vue
│   │   └── Dashboard.vue
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
│   │   ├── validators.ts
│   │   └── route-guards.ts
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

Para probar el login localmente:

1. Asegúrate de que el backend esté corriendo en `http://localhost:3000`
2. Inicia el frontend con `npm run dev`
3. Navega a `http://localhost:5173/login`
4. Usa credenciales válidas de tu base de datos

### Credenciales de prueba

Solicita credenciales de prueba al equipo de backend o crea un usuario en la base de datos.

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
