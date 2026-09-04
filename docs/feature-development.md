# Desarrollo por features

FamTree se entrega como vertical slices dentro de un monolito modular. Una HU puede tocar una ruta
Next.js, una feature frontend, un módulo FastAPI, persistencia y tests, pero cada pieza conserva un
propietario claro.

```text
frontend/src/app route
  -> frontend/src/features/<feature>/index.ts
     -> api | components | hooks | schemas | types
        -> frontend/src/lib/api/client.ts
           -> /api/v1
              -> backend/app/modules/<module>/router.py
                 -> service.py -> repository.py -> models.py
```

Los nombres de frontend siguen el mapa FT de Notion. El backend agrupa capacidades que comparten
dominio y consistencia transaccional: búsqueda, mapa y comparación pertenecen a `asylums`; no se
crea un módulo por pantalla ni por tabla.

## Cómo iniciar una HU

1. Confirma la HU, sus criterios y las decisiones abiertas en Notion.
2. Identifica la feature frontend y el módulo backend en los README de sus directorios.
3. Añade primero el contrato REST y los casos de prueba relevantes.
4. Implementa dentro del límite existente; crea solo los subdirectorios que hagan falta.
5. Registra una migration Alembic si cambia un esquema ya aprobado.
6. Actualiza trazabilidad en `qa/traceability` cuando comience el trabajo de HUs.

## Reglas de frontera

- Las features frontend consumen REST mediante el transporte compartido, no mediante `fetch`
  disperso.
- Una feature importa otra solo por su `index.ts` público.
- El backend refuerza permisos; ocultar UI nunca sustituye autorización.
- La identidad decide el centro asignado; el cliente no elige el alcance administrativo.
- Componentes compartidos son neutrales al dominio. Si conocen una HU, pertenecen a su feature.
- Los diagramas describen relaciones de dominio, no una carpeta por clase o tabla.
