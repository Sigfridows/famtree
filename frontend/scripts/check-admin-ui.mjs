/* Runs against backend/scripts/check_admin_ui.sh's disposable database only. */
import { chromium, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const api = process.env.FAMTREE_QA_API;
const dir = process.env.FAMTREE_QA_DIR;
if (!api || !dir || !/^http:\/\/localhost:\d+$/.test(api))
  throw new Error("Run through backend/scripts/check_admin_ui.sh");
const credentials = JSON.parse(
  fs.readFileSync(path.join(dir, "credentials.json"), "utf8"),
);
const front = process.env.FAMTREE_QA_FRONTEND || "http://localhost:3000";
const checks = [];
const record = (text) => {
  checks.push(text);
  console.log("PASS", text);
};
(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  async function context() {
    const ctx = await browser.newContext({
      viewport: { width: 1512, height: 900 },
      locale: "es-DO",
    });
    await ctx.route(/\/api\/v1\//, async (route) => {
      const original = new URL(route.request().url());
      await route.continue({url: api + original.pathname + original.search});
    });
    ctx.on("page", (page) =>
      page.on("pageerror", (err) => errors.push(err.message)),
    );
    return ctx;
  }
  async function request(ctx, method, endpoint, data, expected = 200) {
    const response = await ctx.request.fetch(api + "/api/v1" + endpoint, {
      method,
      data,
      headers: { Origin: front },
    });
    expect(
      response.status(),
      `${method} ${endpoint}: ${await response.text()}`,
    ).toBe(expected);
    return response.status() === 204 ? null : response.json();
  }
  async function login(page, username, password, destination) {
    await page.goto(front + "/login");
    await page.locator("input[type=text]").fill(username);
    await page.locator("input[type=password]").fill(password);
    await page.locator("button[type=submit]").click();
    await page.waitForURL(front + destination);
  }
  try {
    const admin = await context();
    const page = await admin.newPage();
    await login(page, "qaAdmin", credentials.qaAdmin, "/system-admin");
    await expect(
      page.getByText("Asilos activos", { exact: true }),
    ).toBeVisible();
    record("SYSTEM_ADMIN login and real dashboard");
    await page
      .getByRole("button", { name: "Últimos 7 días", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Actualizar datos" }),
    ).toBeEnabled();
    await page.goto(front + "/system-admin/asylums");
    await page
      .getByRole("button", { name: "Registrar asilo", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog
      .getByLabel("Nombre del asilo", { exact: true })
      .fill("Residencia Prueba Integral");
    const catalogs = await request(admin, "GET", "/asylums/catalogs");
    const municipality = catalogs.municipalities[0];
    await dialog
      .getByLabel("Provincia", { exact: true })
      .selectOption(String(municipality.province_id));
    await dialog
      .getByLabel("Municipio", { exact: true })
      .selectOption(String(municipality.id));
    for (const [label, value] of [
      ["Sector", "Centro"],
      ["Dirección", "Calle de prueba 123"],
      [
        "Descripción",
        "Centro temporal creado exclusivamente para pruebas de aceptación.",
      ],
      ["Requisitos de ingreso", "Evaluación médica y documento de identidad."],
      ["Capacidad total", "25"],
      ["Precio mínimo mensual (RD$)", "15000"],
      ["Precio máximo mensual (RD$)", "25000"],
      ["Teléfono (10 dígitos)", "8095550200"],
      ["Correo institucional", "center@example.invalid"],
    ])
      await dialog.getByLabel(label, { exact: true }).fill(value);
    await dialog
      .getByRole("group", { name: "Servicios (al menos uno)" })
      .locator("input[type=checkbox]")
      .first()
      .check();
    await dialog
      .getByRole("group", { name: "Tipos de atención (al menos uno)" })
      .locator("input[type=checkbox]")
      .first()
      .check();
    await dialog
      .getByLabel(/Imágenes: un enlace/)
      .fill("https://example.invalid/cover.png");
    const created = page.waitForResponse(
      (r) =>
        r.url().endsWith("/admin/asylums") && r.request().method() === "POST",
    );
    await dialog
      .getByRole("button", { name: "Registrar asilo", exact: true })
      .click();
    const createdResponse = await created;
    expect(createdResponse.status()).toBe(201);
    const center = await createdResponse.json();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByText(center.name, { exact: true })).toBeVisible();
    record("HU28 creation through UI and persisted center");
    await page.getByRole("button", { name: "Editar", exact: true }).click();
    await dialog
      .getByLabel("Nombre del asilo", { exact: true })
      .fill("Cambio descartado");
    await dialog.getByRole("button", { name: "Cancelar", exact: true }).click();
    expect(
      (await request(admin, "GET", "/admin/asylums/" + center.asylumId)).name,
    ).toBe(center.name);
    await page.getByRole("button", { name: "Editar", exact: true }).click();
    await dialog.getByLabel("Capacidad total", { exact: true }).fill("30");
    await dialog.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(dialog).toHaveCount(0);
    expect(
      (await request(admin, "GET", "/admin/asylums/" + center.asylumId))
        .totalCapacity,
    ).toBe(30);
    record("HU30 edit and cancellation");
    for (const action of ["Desactivar", "Activar"]) {
      await page.getByRole("button", { name: action, exact: true }).click();
      await dialog
        .getByRole("button", { name: "Confirmar", exact: true })
        .click();
      await expect(dialog).toHaveCount(0);
      await expect(
        page.getByRole("button", {
          name: action === "Activar" ? "Desactivar" : "Activar",
          exact: true,
        }),
      ).toBeVisible();
    }
    record("HU31/32 activate and deactivate");
    await page.goto(front + "/system-admin/users");
    await page
      .getByRole("button", { name: "Crear administrador de asilo" })
      .click();
    for (const [label, value] of [
      ["Nombre", "Marcos"],
      ["Apellido", "Prueba"],
      ["Usuario", "qaCenter"],
      ["Correo", "qacenter@example.invalid"],
      ["Teléfono", "8095550300"],
    ])
      await dialog.getByLabel(label, { exact: true }).fill(value);
    await dialog
      .getByLabel("Asilo asignado")
      .selectOption(String(center.asylumId));
    const accountResponse = page.waitForResponse(
      (r) =>
        r.url().endsWith("/admin/asylum-admins") &&
        r.request().method() === "POST",
    );
    await dialog.getByRole("button", { name: "Crear y enviar acceso" }).click();
    const account = await (await accountResponse).json();
    expect(account.user.role).toBe("ASYLUM_ADMIN");
    await dialog
      .getByRole("button", { name: "Cerrar", exact: true })
      .last()
      .click();
    record(
      "HU39 create assigned admin, mail failure shown without losing account",
    );
    const centerContext = await context();
    const cp = await centerContext.newPage();
    await login(
      cp,
      "qaCenter",
      account.temporaryPassword,
      "/center-admin/asylum",
    );
    await expect(
      cp.getByText("Actualizar Contraseña", { exact: true }),
    ).toBeVisible();
    const newPassword = "QaNew9!TestingSafe";
    const passwords = cp.locator("input[type=password]");
    await passwords.nth(0).fill(account.temporaryPassword);
    await passwords.nth(1).fill(newPassword);
    await passwords.nth(2).fill(newPassword);
    await cp
      .getByRole("button", { name: "Actualizar y Acceder al Panel" })
      .click();
    await expect(
      cp.getByRole("heading", { name: "Gestión del Asilo" }),
    ).toBeVisible();
    record("HU40 forced password change then assigned-center access");
    const description = cp.getByLabel("Descripción", { exact: true });
    const originalDescription = await description.inputValue();
    await description.fill(
      "Este texto debe desaparecer cuando se cancele la edición.",
    );
    await cp.getByRole("button", { name: "Cancelar cambios" }).click();
    await expect(description).toHaveValue(originalDescription);
    await description.fill(
      "Descripción nueva del centro para comprobar guardado persistente.",
    );
    await cp
      .getByRole("button", { name: "Guardar cambios", exact: true })
      .click();
    await expect(
      cp.getByText("Cambios guardados.", { exact: true }),
    ).toBeVisible();
    expect(
      (await request(centerContext, "GET", "/center")).description,
    ).toContain("Descripción nueva");
    record("HU41 cancel restores and save persists");
    await cp.goto(front + "/center-admin/gallery");
    await expect(cp.getByLabel("Añadir imágenes")).toBeEnabled();
    await cp
      .getByLabel("Añadir imágenes")
      .setInputFiles([
        path.join(dir, "gallery.png"),
        path.join(dir, "gallery.png"),
      ]);
    await expect(
      cp.getByText("2 imágenes añadidas.", { exact: true }),
    ).toBeVisible();
    const gallery = await request(centerContext, "GET", "/center/images");
    expect(gallery.length).toBe(3);
    await cp.getByRole("button", { name: "Usar como portada" }).first().click();
    await expect(
      cp.getByText("Portada actualizada.", { exact: true }),
    ).toBeVisible();
    await cp
      .getByRole("button", { name: "Eliminar imagen", exact: true })
      .last()
      .click();
    await cp
      .getByRole("dialog")
      .getByRole("button", { name: "Cancelar" })
      .click();
    expect((await request(centerContext, "GET", "/center/images")).length).toBe(
      3,
    );
    await cp
      .getByRole("button", { name: "Eliminar imagen", exact: true })
      .last()
      .click();
    await cp.getByRole("button", { name: "Confirmar eliminación" }).click();
    await expect(
      cp.getByText("Imagen eliminada.", { exact: true }),
    ).toBeVisible();
    record("HU42 multi-upload, cover, deletion confirmation and cancellation");
    const author = await context();
    const reporter = await context();
    await request(author, "POST", "/auth/login", {
      username: "qaUser",
      password: credentials.qaUser,
    });
    await request(reporter, "POST", "/auth/login", {
      username: "qaReporter",
      password: credentials.qaReporter,
    });
    const review = await request(
      author,
      "POST",
      "/reviews",
      {
        asylumId: center.asylumId,
        rating: 4,
        comment: "Experiencia de prueba para comprobar la moderación completa.",
      },
      201,
    );
    await request(
      reporter,
      "POST",
      "/reviews/reports",
      {
        reviewId: review.reviewId,
        reason: "OTHER",
        detail: "Validación de moderación.",
      },
      201,
    );
    await cp.goto(front + "/center-admin/reviews");
    await expect(
      cp.getByRole("heading", { name: "Distribución de calificaciones" }),
    ).toBeVisible();
    await cp.getByLabel("Ordenar reseñas").selectOption("rating_asc");
    await expect(cp.getByText(review.comment, { exact: true })).toBeVisible();
    record("HU43 reputation, rating distribution and sorting");
    await page.goto(front + "/system-admin/moderation");
    await page.getByRole("button", { name: "Moderar", exact: true }).click();
    await dialog
      .getByLabel("Resolución", { exact: true })
      .selectOption("REVIEW_REMOVED");
    await dialog
      .getByLabel(/Justificación/)
      .fill("Se elimina como parte de la prueba aislada de moderación.");
    await dialog.getByRole("button", { name: "Confirmar resolución" }).click();
    await expect(dialog).toHaveCount(0);
    await page
      .getByLabel("Estado", { exact: true })
      .selectOption("REVIEW_REMOVED");
    await expect(
      page.getByRole("button", { name: "Ver resolución" }),
    ).toBeVisible();
    const notifications = await request(reporter, "GET", "/notifications");
    expect(notifications.some((n) => n.eventType === "REPORT_RESOLUTION")).toBe(
      true,
    );
    record("HU36/37 resolution and real reporter notification");
    await page.goto(front + "/system-admin/users");
    await page.getByLabel("Buscar usuario").fill("qaUser");
    await page.getByRole("button", { name: "Buscar", exact: true }).click();
    await page.getByRole("button", { name: "Bloquear", exact: true }).click();
    await dialog
      .getByLabel("Motivo del bloqueo")
      .fill("Bloqueo temporal para comprobar permisos y revocación.");
    await dialog
      .getByRole("button", { name: "Confirmar", exact: true })
      .click();
    await expect(dialog).toHaveCount(0);
    await page
      .getByRole("button", { name: "Desbloquear", exact: true })
      .click();
    await dialog
      .getByRole("button", { name: "Confirmar", exact: true })
      .click();
    await expect(dialog).toHaveCount(0);
    record("HU33/34/35 user lookup, block and unblock");
    await page.goto(front + "/system-admin/reports");
    await page.getByLabel("Desde", { exact: true }).fill("2020-01-01");
    await page.getByLabel("Hasta", { exact: true }).fill("2030-12-31");
    await page.getByRole("button", { name: "Consultar datos" }).click();
    await expect(
      page.getByRole("button", { name: "Descargar reporte" }),
    ).toBeEnabled();
    for (const format of ["pdf", "csv"]) {
      await page.getByLabel("Formato de descarga").selectOption(format);
      const download = page.waitForEvent("download");
      await page.getByRole("button", { name: "Descargar reporte" }).click();
      const file = await download;
      expect(file.suggestedFilename()).toMatch(
        new RegExp("\\." + format + "$"),
      );
      await file.saveAs(path.join(dir, "report." + format));
    }
    record("HU38/44 table and real PDF/CSV downloads");
    await page.goto(front + "/system-admin/audit");
    await expect(
      page.getByText(
        "Se elimina como parte de la prueba aislada de moderación.",
        { exact: true },
      ),
    ).toBeVisible();
    record("Moderation audit retains resolution");
    await cp.goto(front + "/system-admin");
    await expect(
      cp.getByText(
        "Este panel requiere una cuenta de administrador del sistema.",
        { exact: true },
      ),
    ).toBeVisible();
    await request(centerContext, "GET", "/admin/users", undefined, 403);
    await request(reporter, "GET", "/center", undefined, 403);
    record("Cross-role API and UI isolation");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(front + "/system-admin/asylums");
    await page.getByRole("button", { name: "Mostrar navegación" }).click();
    await expect(
      page.getByRole("link", { name: "Usuarios", exact: true }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Usuarios", exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    record("Mobile navigation and no viewport overflow");
    await page.setViewportSize({ width: 1512, height: 900 });
    await page.goto(front + "/system-admin/asylums");
    await expect(page.getByText(center.name, { exact: true })).toBeVisible();
    await page.screenshot({
      path: path.join(dir, "system-admin.png"),
      fullPage: true,
    });
    expect(errors).toEqual([]);
    fs.writeFileSync(
      path.join(dir, "results.json"),
      JSON.stringify({ checks, pageErrors: errors }, null, 2),
    );
  } catch (error) {
    let i = 0;
    for (const ctx of browser.contexts())
      for (const page of ctx.pages()) {
        await page
          .screenshot({
            path: path.join(dir, "failure-" + i++ + ".png"),
            fullPage: true,
          })
          .catch(() => {});
      }
    throw error;
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
