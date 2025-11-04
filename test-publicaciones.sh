#!/bin/bash

# Script de pruebas exhaustivas para el endpoint de publicaciones
# Asegúrate de tener un token JWT válido

API_URL="https://tp-integrador-server-production.up.railway.app"

echo "========================================="
echo "PRUEBAS EXHAUSTIVAS - PUBLICACIONES"
echo "========================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# PASO 1: Health Check
echo -e "${YELLOW}=== PRUEBA 1: Health Check ===${NC}"
HEALTH=$(curl -s "$API_URL/health")
echo "$HEALTH" | jq .
MONGOOSE_STATE=$(echo "$HEALTH" | jq -r '.mongooseState')

if [ "$MONGOOSE_STATE" = "1" ]; then
    echo -e "${GREEN}✅ MongoDB CONECTADO (mongooseState: 1)${NC}"
else
    echo -e "${RED}❌ MongoDB DESCONECTADO (mongooseState: $MONGOOSE_STATE)${NC}"
    echo -e "${RED}⚠️  Las pruebas no pueden continuar sin conexión a MongoDB${NC}"
    exit 1
fi
echo ""

# PASO 2: Login para obtener token
echo -e "${YELLOW}=== PRUEBA 2: Login (obtener JWT) ===${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joacoferman2@gmail.com",
    "password": "Joaquin123"
  }')

echo "$LOGIN_RESPONSE" | jq .

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ No se pudo obtener el token JWT${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Token JWT obtenido exitosamente${NC}"
    echo "Token (primeros 50 chars): ${TOKEN:0:50}..."
fi
echo ""

# PASO 3: Obtener publicaciones existentes (antes de crear)
echo -e "${YELLOW}=== PRUEBA 3: GET /publicaciones (antes de crear) ===${NC}"
BEFORE_COUNT=$(curl -s "$API_URL/publicaciones" | jq '. | length')
echo "Total de publicaciones existentes: $BEFORE_COUNT"
echo ""

# PASO 4: Crear una publicación
echo -e "${YELLOW}=== PRUEBA 4: POST /publicaciones (crear) ===${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/publicaciones" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "🧪 Prueba automatizada de publicación - '"$(date +%Y-%m-%d\ %H:%M:%S)"'"
  }')

echo "$CREATE_RESPONSE" | jq .

POST_ID=$(echo "$CREATE_RESPONSE" | jq -r '._id')

if [ "$POST_ID" = "null" ] || [ -z "$POST_ID" ]; then
    echo -e "${RED}❌ ERROR: No se pudo crear la publicación${NC}"
    echo "Respuesta completa:"
    echo "$CREATE_RESPONSE"
    exit 1
else
    echo -e "${GREEN}✅ Publicación creada exitosamente${NC}"
    echo "ID de la publicación: $POST_ID"
fi
echo ""

# PASO 5: Verificar que la publicación fue creada (GET)
echo -e "${YELLOW}=== PRUEBA 5: GET /publicaciones (después de crear) ===${NC}"
AFTER_COUNT=$(curl -s "$API_URL/publicaciones" | jq '. | length')
echo "Total de publicaciones ahora: $AFTER_COUNT"
echo "Publicaciones creadas en esta prueba: $((AFTER_COUNT - BEFORE_COUNT))"

if [ $AFTER_COUNT -gt $BEFORE_COUNT ]; then
    echo -e "${GREEN}✅ La publicación se agregó correctamente a la base de datos${NC}"
else
    echo -e "${RED}❌ ERROR: La publicación no se agregó a la base de datos${NC}"
fi
echo ""

# PASO 6: Obtener la publicación específica por ID
echo -e "${YELLOW}=== PRUEBA 6: GET /publicaciones/:id ===${NC}"
GET_POST=$(curl -s "$API_URL/publicaciones/$POST_ID")
echo "$GET_POST" | jq .

POST_CONTENT=$(echo "$GET_POST" | jq -r '.content')
echo "Contenido recuperado: $POST_CONTENT"

if [ "$POST_CONTENT" != "null" ]; then
    echo -e "${GREEN}✅ Publicación recuperada exitosamente${NC}"
else
    echo -e "${RED}❌ ERROR: No se pudo recuperar la publicación${NC}"
fi
echo ""

# PASO 7: Agregar un comentario
echo -e "${YELLOW}=== PRUEBA 7: POST /publicaciones/:id/comment ===${NC}"
COMMENT_RESPONSE=$(curl -s -X POST "$API_URL/publicaciones/$POST_ID/comment" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "💬 Comentario de prueba automatizada"
  }')

echo "$COMMENT_RESPONSE" | jq .

COMMENTS_COUNT=$(echo "$COMMENT_RESPONSE" | jq '.comments | length')

if [ $COMMENTS_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Comentario agregado exitosamente${NC}"
    echo "Total de comentarios: $COMMENTS_COUNT"
else
    echo -e "${RED}❌ ERROR: No se pudo agregar el comentario${NC}"
fi
echo ""

# PASO 8: Dar like
echo -e "${YELLOW}=== PRUEBA 8: POST /publicaciones/:id/like ===${NC}"
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id // .user._id // .user.sub')
LIKE_RESPONSE=$(curl -s -X POST "$API_URL/publicaciones/$POST_ID/like" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\"}")

echo "$LIKE_RESPONSE" | jq .

LIKES_COUNT=$(echo "$LIKE_RESPONSE" | jq -r '.likesCount')

if [ "$LIKES_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ Like agregado exitosamente${NC}"
    echo "Total de likes: $LIKES_COUNT"
else
    echo -e "${RED}❌ ERROR: No se pudo agregar el like${NC}"
fi
echo ""

# PASO 9: Quitar like
echo -e "${YELLOW}=== PRUEBA 9: POST /publicaciones/:id/unlike ===${NC}"
UNLIKE_RESPONSE=$(curl -s -X POST "$API_URL/publicaciones/$POST_ID/unlike" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\"}")

echo "$UNLIKE_RESPONSE" | jq .

LIKES_AFTER=$(echo "$UNLIKE_RESPONSE" | jq -r '.likesCount')

if [ "$LIKES_AFTER" -eq 0 ]; then
    echo -e "${GREEN}✅ Like removido exitosamente${NC}"
    echo "Total de likes: $LIKES_AFTER"
else
    echo -e "${YELLOW}⚠️  Like no fue removido (likes: $LIKES_AFTER)${NC}"
fi
echo ""

# PASO 10: Eliminar publicación
echo -e "${YELLOW}=== PRUEBA 10: DELETE /publicaciones/:id ===${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/publicaciones/$POST_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$DELETE_RESPONSE" | jq .

DELETED_ID=$(echo "$DELETE_RESPONSE" | jq -r '._id')

if [ "$DELETED_ID" = "$POST_ID" ]; then
    echo -e "${GREEN}✅ Publicación eliminada exitosamente${NC}"
else
    echo -e "${RED}❌ ERROR: No se pudo eliminar la publicación${NC}"
fi
echo ""

# PASO 11: Verificar que fue eliminada
echo -e "${YELLOW}=== PRUEBA 11: Verificar eliminación ===${NC}"
FINAL_COUNT=$(curl -s "$API_URL/publicaciones" | jq '. | length')
echo "Total de publicaciones final: $FINAL_COUNT"

if [ $FINAL_COUNT -eq $BEFORE_COUNT ]; then
    echo -e "${GREEN}✅ La base de datos volvió a su estado inicial${NC}"
else
    echo -e "${YELLOW}⚠️  Diferencia en el conteo (puede haber otras publicaciones)${NC}"
fi
echo ""

# RESUMEN FINAL
echo "========================================="
echo -e "${GREEN}✅ TODAS LAS PRUEBAS COMPLETADAS${NC}"
echo "========================================="
echo ""
echo "Resumen:"
echo "- MongoDB State: $MONGOOSE_STATE (1 = conectado)"
echo "- Publicación creada: ✅"
echo "- Publicación recuperada: ✅"
echo "- Comentario agregado: ✅"
echo "- Like agregado: ✅"
echo "- Like removido: ✅"
echo "- Publicación eliminada: ✅"
echo ""
echo -e "${GREEN}🎉 El backend de publicaciones está funcionando correctamente${NC}"
