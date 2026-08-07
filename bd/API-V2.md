# API de Personas — Documentación de uso

Base URL (producción): `https://perapi.codewave.com.bo`
Base URL (local): `http://localhost:8080`

Autenticación: Bearer token opaco (no JWT). Se obtiene con `/auth/login` y se manda en el header `Authorization` de cada request protegido.

---

## 1. Login

```
POST /auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "username": "consulta1",
  "password": "consulta123"
}
```

**Respuesta 200:**
```json
{
  "token": "3wBO30Iv5tNXUcjvZ0CUZV42-2Rkj6Z4aHKhdA4fqzk",
  "expiraEn": "2026-08-02T16:03:46.202791543"
}
```

Token válido 8 horas desde la emisión. No hay endpoint de refresh: al expirar, volver a loguear.

**Respuesta 401** (usuario o password invalidos):
```json
{"error": "Usuario o contrasena invalidos"}
```

**curl:**
```bash
curl -X POST https://perapi.codewave.com.bo/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"consulta1","password":"consulta123"}'
```

---

## 2. Consultar persona por número de documento

```
GET /personas/documento/{numeroDocumento}
Authorization: Bearer {token}
```

**Respuesta 200:**
```json
{
  "codigo": "1011300",
  "primerNombre": "MIRIAN",
  "segundoNombre": "",
  "primerApellido": "NAVARRO",
  "segundoApellido": "ECHALAR",
  "tercerApellido": "",
  "apellidoCasada": "",
  "fechaNacimiento": "1945-05-07",
  "sexo": "F",
  "numeroDocumento": "13830971",
  "extensionDocumento": "01"
}
```

**Respuesta 404** (no existe):
```json
{"error": "Persona no encontrada"}
```

**Respuesta 401** (sin token, token invalido, revocado o expirado):
```
(vacio, HTTP 401)
```

**curl:**
```bash
TOKEN=$(curl -s -X POST https://perapi.codewave.com.bo/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"consulta1","password":"consulta123"}' \
  | grep -oE '"token":"[^"]+"' | cut -d'"' -f4)

curl https://perapi.codewave.com.bo/personas/documento/13830971 \
  -H "Authorization: Bearer $TOKEN"
```

Cada consulta exitosa (persona encontrada) queda registrada en `consulta_auditoria`: qué usuario consultó qué persona, por qué endpoint, y cuándo. Consultas a documentos inexistentes (404) no generan auditoría.

---

## 3. Consultar persona por código (PK)

```
GET /personas/{codigo}
Authorization: Bearer {token}
```

`codigo` es la clave primaria interna de la tabla `persona` — distinta de `numero_documento`. Hay registros con `numero_documento` vacío que solo son ubicables por este `codigo`.

**Respuesta 200:** mismo formato que el endpoint por documento.

**curl:**
```bash
curl https://perapi.codewave.com.bo/personas/7897245 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 4. Buscar por nombre completo, o por nombre / apellido paterno / apellido materno

```
GET /personas/buscar?q={texto}&page={page}&size={size}
GET /personas/buscar?nombre={nombre}&apellido={apellido}&apellidoMaterno={apellidoMaterno}&page={page}&size={size}
Authorization: Bearer {token}
```

Dos formas de buscar, no se combinan (si mandás `q`, se ignoran `nombre`/`apellido`/`apellidoMaterno`):

### 4.1 `q` — nombre completo, un solo campo (recomendado)

Full-text search: matchea palabras sueltas contra nombre + todos los apellidos, **en cualquier orden**. `q=RONALD DIAZ` y `q=DIAZ RONALD` dan el mismo resultado. Cada palabra hace match por prefijo (`RONALD` matchea `RONALDO` también).

Cada palabra de `q` con menos de 3 caracteres se descarta silenciosamente (no rompe la búsqueda, solo no participa) — pero si tras descartar cortas no queda ninguna palabra útil, `400 Bad Request`.

```bash
curl --get "https://perapi.codewave.com.bo/personas/buscar" \
  --data-urlencode "q=RONALD DIAZ" \
  -H "Authorization: Bearer $TOKEN"
```

### 4.2 `nombre` / `apellido` / `apellidoMaterno` — campos separados por prefijo

Búsqueda por **prefijo** sobre `primer_nombre`, `primer_apellido` (paterno) y/o `segundo_apellido` (materno) — cualquier combinación de los tres, paginada. Útil cuando querés un campo exacto (ej. listar todos los `NAVARRO` sin importar nombre).

| Parámetro | Obligatorio | Notas |
|---|---|---|
| `nombre` | al menos uno de los tres | mínimo 3 caracteres, busca en `primer_nombre` |
| `apellido` | al menos uno de los tres | mínimo 3 caracteres, busca en `primer_apellido` (paterno) |
| `apellidoMaterno` | al menos uno de los tres | mínimo 3 caracteres, busca en `segundo_apellido` (materno) |

**Comunes a ambas formas:**

| Parámetro | Obligatorio | Notas |
|---|---|---|
| `page` | no | default `0` |
| `size` | no | default `20`, tope `50` (se recorta si piden más) |

**Reglas anti-abuso (importante):**
- Sin `q` ni ninguno de los tres campos → `400 Bad Request`.
- Cualquier término de menos de 3 caracteres (ej. `nombre=r`) → `400 Bad Request`. Evita que un prefijo de una letra dispare miles de coincidencias en las 12.2M filas.
- `size` nunca supera 50, sin importar lo que se pida — nunca se devuelve todo el dataset de un tiro.

**Respuesta 200:**
```json
{
  "content": [
    {
      "codigo": "1000005",
      "primerNombre": "MARIA",
      "segundoNombre": "MARTHA",
      "primerApellido": "MAITA",
      "segundoApellido": "ARCE",
      "tercerApellido": "",
      "apellidoCasada": "",
      "fechaNacimiento": "1938-06-25",
      "sexo": "F",
      "numeroDocumento": "",
      "extensionDocumento": "  "
    }
  ],
  "totalElements": 15234,
  "totalPages": 762,
  "number": 0,
  "size": 20
}
```

**Respuesta 400** (término muy corto):
```json
{"error": "'nombre' debe tener al menos 3 caracteres"}
```

**curl:**
```bash
# por nombre
curl "https://perapi.codewave.com.bo/personas/buscar?nombre=MARIA" \
  -H "Authorization: Bearer $TOKEN"

# por apellido materno solo
curl "https://perapi.codewave.com.bo/personas/buscar?apellidoMaterno=ECHALAR" \
  -H "Authorization: Bearer $TOKEN"

# nombre + apellido paterno + apellido materno combinados, pagina 2
curl "https://perapi.codewave.com.bo/personas/buscar?nombre=MARIA&apellido=NAVARRO&apellidoMaterno=ECHALAR&page=1&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

Cada persona devuelta en los resultados (en ambas formas de búsqueda) queda registrada en `consulta_auditoria` (igual que los otros endpoints).

**Detalle técnico — `nombre`/`apellido`/`apellidoMaterno`:** el filtro usa `LIKE 'prefijo%'` sobre índices `varchar_pattern_ops` en `primer_nombre`/`primer_apellido`/`segundo_apellido` — necesario porque la base usa collation `es_BO.UTF-8`, donde un índice btree normal no acelera búsquedas por prefijo (cae a table scan completo). Con el índice correcto, una búsqueda por prefijo poco común responde en <1ms; una prueba con `%` en cualquier posición (`Containing`) no está soportada a propósito, porque no puede usar índice en 12M filas.

**Detalle técnico — `q`:** columna generada `busqueda tsvector` (`to_tsvector('simple', nombre + todos los apellidos)`) + índice GIN (`idx_persona_busqueda`). Config `simple` (sin stemming) a propósito: con stemming el motor recortaría apellidos como si tuvieran raíz gramatical, lo cual corrompe nombres propios. Cada palabra de `q` se sanitiza (se descarta todo lo que no sea letra/dígito) antes de armar la tsquery — un input como `q=RONALD & DIAZ | ! (` no rompe nada, simplemente ignora los símbolos. Medido: ~20ms para un combo de nombre+apellido comunes (140 coincidencias), sub-milisegundo para nombres poco comunes.

---

## 5. Códigos de respuesta

| Código | Cuándo |
|---|---|
| 200 | OK, devuelve el recurso |
| 400 | `/personas/buscar` sin parámetros o con término menor a 3 caracteres |
| 401 | Falta el header `Authorization`, token invalido/revocado/expirado, o credenciales de login incorrectas |
| 404 | No encontrado (`/personas/documento/{doc}` o `/personas/{codigo}`) |

---

## 6. Notas de rendimiento

Medido contra producción (`perapi.codewave.com.bo`), con conexión HTTP reusada (keep-alive):

- Query indexada por `numero_documento` (tabla de 12.2M filas) + insert de auditoría: **~50-90ms**.
- Login (BCrypt + lookups): **~300-350ms** — esperable, BCrypt es deliberadamente costoso.
- Si el cliente NO reusa conexión, cada request paga ~200-300ms extra de handshake TLS encima de lo anterior. Se recomienda mantener keep-alive del lado del consumidor.

---

## 7. Variables de entorno (despliegue)

La API lee la conexión a la base desde variables de entorno (ver `.env.example`):

| Variable | Descripción |
|---|---|
| `DB_HOST` | Host de Postgres |
| `DB_PORT` | Puerto de Postgres |
| `DB_NAME` | Nombre de la base (`personas_bolivia`) |
| `DB_USERNAME` | Usuario de conexión |
| `DB_PASSWORD` | Password de conexión |

No hardcodear estas credenciales en `application.properties`; usar `.env` (gitignoreado) o variables de entorno del contenedor.
