# AI API Service

Un servicio de API que rota entre múltiples proveedores de IA (Google Gemini, Groq, Cerebras, OpenRouter) para proporcionar respuestas de chat en tiempo real.

## Características

- **Round-robin load balancing** entre múltiples servicios de IA
- **Streaming responses** para respuestas en tiempo real
- **API RESTful** simple con endpoint `/chat`
- **Soporte para múltiples proveedores** de IA
- **Configuración flexible** mediante variables de entorno

## Requisitos

- **Bun** (runtime de JavaScript)
- **Debian/Ubuntu** VPS
- **Nginx** como proxy reverso
- **Dominio** configurado apuntando a la VPS
- **API Keys** de los proveedores de IA que desees usar

## Instalación en VPS Debian

### 1. Instalar Bun

```bash
# Instalar dependencias del sistema
sudo apt update
sudo apt install -y curl unzip

# Instalar Bun
curl -fsSL https://bun.sh/install | bash

# Agregar Bun al PATH (agregar a ~/.bashrc o ~/.zshrc)
export PATH="$HOME/.bun/bin:$PATH"
source ~/.bashrc
```

### 2. Clonar y configurar el proyecto

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd bun-ai-api

# Instalar dependencias
bun install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# API Keys de proveedores de IA (configura solo las que necesites)
GEMINI_API_KEY=tu_api_key_de_google_gemini
GROQ_API_KEY=tu_api_key_de_groq
CEREBRAS_API_KEY=tu_api_key_de_cerebras
OPENROUTER_API_KEY=tu_api_key_de_openrouter

# Puerto del servidor (opcional, por defecto 3005)
PORT=3005
```

**Nota**: Obtén las API keys de:

- **Google Gemini**: https://makersuite.google.com/app/apikey
- **Groq**: https://console.groq.com/keys
- **Cerebras**: https://cloud.cerebras.ai/
- **OpenRouter**: https://openrouter.ai/keys

### 4. Configurar Nginx como proxy reverso

```bash
# Instalar Nginx
sudo apt install -y nginx

# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/api.ia.btec.com.mx
```

Contenido del archivo de configuración de Nginx:

```nginx
server {
    listen 80;
    server_name api.ia.btec.com.mx;

    # Logs
    access_log /var/log/nginx/api.ia.btec.com.mx.access.log;
    error_log /var/log/nginx/api.ia.btec.com.mx.error.log;

    # Proxy a la aplicación Bun
    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

```bash
# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/api.ia.btec.com.mx /etc/nginx/sites-enabled/

# Remover configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Probar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5. Configurar SSL con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d api.ia.btec.com.mx

# El comando anterior automáticamente:
# - Obtiene el certificado SSL
# - Actualiza la configuración de Nginx para usar HTTPS
# - Configura renovación automática
```

### 6. Configurar el servicio systemd

Crear archivo de servicio para que la aplicación se ejecute automáticamente:

```bash
sudo nano /etc/systemd/system/bun-ai-api.service
```

Contenido del archivo de servicio:

```ini
[Unit]
Description=Bun AI API Service
After=network.target

[Service]
Type=simple
User=tu_usuario
WorkingDirectory=/ruta/a/tu/proyecto/bun-ai-api
ExecStart=/home/tu_usuario/.bun/bin/bun run index.ts
Restart=always
RestartSec=5
Environment=NODE_ENV=production

# Variables de entorno (o usar un archivo .env separado)
Environment=GEMINI_API_KEY=tu_api_key
Environment=GROQ_API_KEY=tu_api_key
Environment=CEREBRAS_API_KEY=tu_api_key
Environment=OPENROUTER_API_KEY=tu_api_key
Environment=PORT=3005

[Install]
WantedBy=multi-user.target
```

**Importante**: Reemplaza `tu_usuario` con tu nombre de usuario real y `/ruta/a/tu/proyecto` con la ruta completa al proyecto.

```bash
# Recargar systemd y habilitar el servicio
sudo systemctl daemon-reload
sudo systemctl enable bun-ai-api
sudo systemctl start bun-ai-api

# Verificar estado
sudo systemctl status bun-ai-api
```

## Uso

### Endpoint de la API

**POST** `https://api.ia.btec.com.mx/chat`

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hola, ¿cómo estás?"
    }
  ]
}
```

**Respuesta:** Stream de texto con la respuesta del modelo de IA.

### Ejemplo de uso con curl

```bash
curl -X POST https://api.ia.btec.com.mx/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "¿Cuál es la capital de Francia?"
      }
    ]
  }'
```

## Desarrollo local

```bash
# Instalar dependencias
bun install

# Ejecutar en modo desarrollo (con hot reload)
bun run dev

# Ejecutar en producción
bun run start
```

## Gestión del servicio

```bash
# Ver logs del servicio
sudo journalctl -u bun-ai-api -f

# Reiniciar servicio
sudo systemctl restart bun-ai-api

# Detener servicio
sudo systemctl stop bun-ai-api

# Ver estado
sudo systemctl status bun-ai-api
```

## Troubleshooting

### Problemas comunes

1. **Error de conexión a servicios de IA**

   - Verifica que las API keys sean válidas
   - Asegúrate de que las variables de entorno estén configuradas correctamente

2. **Nginx no puede conectar al backend**

   ```bash
   # Verificar que el servicio esté corriendo
   sudo systemctl status bun-ai-api

   # Verificar logs
   sudo journalctl -u bun-ai-api -n 50
   ```

3. **Problemas de SSL**

   ```bash
   # Verificar renovación automática de certificados
   sudo certbot renew --dry-run

   # Ver logs de Nginx
   sudo tail -f /var/log/nginx/api.ia.btec.com.mx.error.log
   ```

4. **Puerto ocupado**
   - Cambia el puerto en la variable de entorno `PORT`
   - Actualiza la configuración de Nginx para usar el nuevo puerto

### Logs útiles

```bash
# Logs de la aplicación
sudo journalctl -u bun-ai-api -f

# Logs de Nginx
sudo tail -f /var/log/nginx/api.ia.btec.com.mx.access.log
sudo tail -f /var/log/nginx/api.ia.btec.com.mx.error.log

# Logs de renovación SSL
sudo journalctl -u certbot -f
```

## Configuración de firewall (opcional)

Si usas UFW:

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow ssh

# Permitir HTTP y HTTPS
sudo ufw allow 'Nginx Full'

# Ver estado
sudo ufw status
```

## Actualización del proyecto

```bash
# Detener servicio
sudo systemctl stop bun-ai-api

# Actualizar código
cd /ruta/a/tu/proyecto/bun-ai-api
git pull

# Instalar nuevas dependencias si las hay
bun install

# Reiniciar servicio
sudo systemctl start bun-ai-api
```

## Configuracion NGINX:

- Vamos a manejar el CORS por el NGINX
- Eliminar o certificado que debe ser generado por comando

```
server {
    server_name api.ia.btec.com.mx;

    # Logs
    access_log /var/log/nginx/api.ia.btec.com.mx.access.log;
    error_log /var/log/nginx/api.ia.btec.com.mx.error.log;

    # Proxy a la aplicación Bun
    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # === CORS ===
        set $cors_origin "https://demo.avisus.com.br";

    add_header Access-Control-Allow-Origin $cors_origin always;
    add_header Access-Control-Allow-Methods "POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type" always;

    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin $cors_origin always;
        add_header Access-Control-Allow-Methods "POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type" always;
        add_header Access-Control-Max-Age 86400 always;
        add_header Content-Length 0;
        return 204;
    }
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/api.ia.btec.com.mx/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.ia.btec.com.mx/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = api.ia.btec.com.mx) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name api.ia.btec.com.mx;
    return 404; # managed by Certbot


}
```
