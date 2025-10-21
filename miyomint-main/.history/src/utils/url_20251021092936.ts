// src/utils/url.ts
export function getAppBaseUrl(): string {
  try {
    const hostname = window?.location?.hostname ?? "";

    // 🧩 Eğer staging veya test ortamındaysak
    if (hostname.includes("staging") || hostname.includes("test")) {
      return import.meta.env.VITE_APP_BASE_URL_STAGING || "https://miyomint.com.tr";
    }

    // 🧩 Prod (varsayılan)
    return import.meta.env.VITE_APP_BASE_URL_PROD || "https://www.miyomint.com.tr";
  } catch (e) {
    console.error("⚠️ getAppBaseUrl hata:", e);
    return "https://www.miyomint.com.tr";
  }
}
